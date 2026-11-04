import Decimal from 'decimal.js'
import { d, roundMoney } from './money'
import type { PayrollResult } from './payroll'

export type BillingPeriod = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly'
export type Regime = 'micro' | 'profit'

export interface EquivalentRates {
  yearly: Decimal
  monthly: Decimal
  weekly: Decimal
  daily: Decimal
  hourly: Decimal
}

export interface RegimeResult {
  regime: Regime
  revenue: Decimal
  operatingExpenses: Decimal
  employerCostAnnual: Decimal
  deductible: Decimal
  companyTax: Decimal
  accountingProfit: Decimal
  grossDividend: Decimal
  dividendTax: Decimal
  dividendReceived: Decimal
  healthContribution: Decimal
  dividendTakeHome: Decimal
  salaryTakeHome: Decimal
  totalCash: Decimal
  loss: boolean
  salaryUnfunded: boolean
  aboveMicroCap: boolean
  rates: EquivalentRates
}

export interface ScenarioInput {
  annualRevenue: Decimal
  operatingExpenses: Decimal
  payroll: PayrollResult
  salaryMonths: number
  microRate: Decimal
  profitRate: Decimal
  dividendRate: Decimal
  cassReferenceWage: Decimal
  otherIncome: Decimal
  billableDays: number
  hoursPerDay: Decimal
  microCap: Decimal
}

export function annualRevenueFromContract(input: {
  amount: Decimal
  period: BillingPeriod
  billableDays: number
  hoursPerDay: Decimal
}): Decimal {
  const days = d(input.billableDays)
  switch (input.period) {
    case 'hourly':
      return input.amount.mul(input.hoursPerDay).mul(days)
    case 'daily':
      return input.amount.mul(days)
    case 'weekly':
      return input.amount.mul(days.div(5))
    case 'monthly':
      return input.amount.mul(12)
    case 'yearly':
      return input.amount
  }
}

export function annualAmountFromPeriod(input: {
  amount: Decimal
  period: BillingPeriod
  billableDays: number
  hoursPerDay: Decimal
}): Decimal {
  return annualRevenueFromContract(input)
}

export function equivalentRates(annual: Decimal, billableDays: number, hoursPerDay: Decimal): EquivalentRates {
  const daily = annual.div(billableDays)
  return {
    yearly: annual,
    monthly: annual.div(12),
    weekly: daily.mul(5),
    daily,
    hourly: daily.div(hoursPerDay),
  }
}

/** CASS rate on the chosen wage-band base (not on the full dividend). */
const HEALTH_CONTRIBUTION_RATE = d('0.10')

/**
 * Health contribution to dividends and other investment-type income.
 * Bands use the January minimum wage for the whole year.
 * The base is dividend cash received (after dividend tax) plus other income.
 * Edges: [6, 12) wages, [12, 24) wages, and 24 wages upward.
 */
export function healthContribution(
  dividendReceived: Decimal,
  otherIncome: Decimal,
  referenceWage: Decimal,
): Decimal {
  const base = dividendReceived.plus(otherIncome)
  const six = referenceWage.mul(6)
  const twelve = referenceWage.mul(12)
  const twentyFour = referenceWage.mul(24)
  if (base.lt(six)) {
    return d(0)
  }

  if (base.lt(twelve)) {
    return roundMoney(six.mul(HEALTH_CONTRIBUTION_RATE))
  }

  if (base.lt(twentyFour)) {
    return roundMoney(twelve.mul(HEALTH_CONTRIBUTION_RATE))
  }

  return roundMoney(twentyFour.mul(HEALTH_CONTRIBUTION_RATE))
}

interface CassBand {
  contribution: Decimal
  lower: Decimal
  upper: Decimal | null
}

function cassBands(referenceWage: Decimal): CassBand[] {
  const six = referenceWage.mul(6)
  const twelve = referenceWage.mul(12)
  const twentyFour = referenceWage.mul(24)

  return [
    { contribution: d(0), lower: d(0), upper: six },
    { contribution: roundMoney(six.mul(HEALTH_CONTRIBUTION_RATE)), lower: six, upper: twelve },
    { contribution: roundMoney(twelve.mul(HEALTH_CONTRIBUTION_RATE)), lower: twelve, upper: twentyFour },
    { contribution: roundMoney(twentyFour.mul(HEALTH_CONTRIBUTION_RATE)), lower: twentyFour, upper: null },
  ]
}

function baseIsInBand(base: Decimal, band: CassBand): boolean {
  if (base.lt(band.lower)) {
    return false
  }

  return !(band.upper != null && base.gte(band.upper));

}

/**
 * Smallest dividend received (after dividend tax, before the health contribution)
 * whose cash left in pocket equals the target. Within a band the contribution is
 * a fixed sum, so the match is exact. Overlapping bands keep the smaller amount.
 */
export function dividendReceivedForTakeHome(
  target: Decimal,
  otherIncome: Decimal,
  referenceWage: Decimal,
): Decimal {
  let best: Decimal | null = null
  for (const band of cassBands(referenceWage)) {
    const received = target.plus(band.contribution)
    if (received.isNegative()) {
      continue
    }

    const base = received.plus(otherIncome)
    if (!baseIsInBand(base, band)) {
      continue
    }

    if (best == null || received.lt(best)) {
      best = received
    }
  }

  if (best == null) {
    throw new Error('No dividend amount produces this take-home')
  }

  return best
}

function finishRegime(
  regime: Regime,
  revenue: Decimal,
  operatingExpenses: Decimal,
  employerCostAnnual: Decimal,
  companyTax: Decimal,
  accountingProfit: Decimal,
  input: ScenarioInput,
): RegimeResult {
  const deductible = operatingExpenses.plus(employerCostAnnual)
  const grossDividend = Decimal.max(accountingProfit, 0)
  const dividendTax = grossDividend.mul(input.dividendRate)
  const dividendReceived = grossDividend.minus(dividendTax)
  const health = healthContribution(dividendReceived, input.otherIncome, input.cassReferenceWage)
  const dividendTakeHome = dividendReceived.minus(health)
  const salaryTakeHome = input.payroll.net.mul(input.salaryMonths)

  return {
    regime,
    revenue,
    operatingExpenses,
    employerCostAnnual,
    deductible,
    companyTax,
    accountingProfit,
    grossDividend,
    dividendTax,
    dividendReceived,
    healthContribution: health,
    dividendTakeHome,
    salaryTakeHome,
    totalCash: dividendTakeHome.plus(salaryTakeHome),
    loss: accountingProfit.isNegative(),
    salaryUnfunded: revenue.lt(employerCostAnnual),
    aboveMicroCap: revenue.gt(input.microCap),
    rates: equivalentRates(revenue, input.billableDays, input.hoursPerDay),
  }
}

export function evaluateMicro(input: ScenarioInput): RegimeResult {
  const employerCostAnnual = input.payroll.employerCost.mul(input.salaryMonths)
  const companyTax = input.annualRevenue.mul(input.microRate)
  const accountingProfit = input.annualRevenue
    .minus(input.operatingExpenses)
    .minus(employerCostAnnual)
    .minus(companyTax)

  return finishRegime(
      'micro',
      input.annualRevenue,
      input.operatingExpenses,
      employerCostAnnual,
      companyTax,
      accountingProfit,
      input
  )
}

export function evaluateProfit(input: ScenarioInput): RegimeResult {
  const employerCostAnnual = input.payroll.employerCost.mul(input.salaryMonths)
  const taxable = input.annualRevenue.minus(input.operatingExpenses).minus(employerCostAnnual)
  const companyTax = Decimal.max(taxable, 0).mul(input.profitRate)
  const accountingProfit = taxable.minus(companyTax)

  return finishRegime(
      'profit',
      input.annualRevenue,
      input.operatingExpenses,
      employerCostAnnual,
      companyTax,
      accountingProfit,
      input
  )
}

export function evaluateScenario(input: ScenarioInput): { micro: RegimeResult; profit: RegimeResult } {
  return {
    micro: evaluateMicro(input),
    profit: evaluateProfit(input),
  }
}

export function grossDividendForReceived(dividendReceived: Decimal, dividendRate: Decimal): Decimal {
  return dividendReceived.div(d(1).minus(dividendRate))
}

export function revenueForGrossDividend(
  regime: Regime,
  grossDividend: Decimal,
  deductible: Decimal,
  microRate: Decimal,
  profitRate: Decimal,
): Decimal {
  if (regime === 'micro') {
    return grossDividend.plus(deductible).div(d(1).minus(microRate))
  }

  return deductible.plus(grossDividend.div(d(1).minus(profitRate)))
}

export function requiredRevenue(input: {
  regime: Regime
  annualDividendTakeHome: Decimal
  deductible: Decimal
  microRate: Decimal
  profitRate: Decimal
  dividendRate: Decimal
  cassReferenceWage: Decimal
  otherIncome: Decimal
}): Decimal {
  const received = dividendReceivedForTakeHome(
    input.annualDividendTakeHome,
    input.otherIncome,
    input.cassReferenceWage,
  )
  const gross = grossDividendForReceived(received, input.dividendRate)

  return revenueForGrossDividend(input.regime, gross, input.deductible, input.microRate, input.profitRate)
}
