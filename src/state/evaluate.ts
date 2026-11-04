import { billableDayCount } from '@/domain/calendar'
import { FISCAL_DEFAULTS } from '@/domain/fiscal'
import { d, parseDecimal } from '@/domain/money'
import { monthlyPayroll, type PayrollResult } from '@/domain/payroll'
import {
  annualAmountFromPeriod,
  evaluateScenario,
  requiredRevenue,
  type RegimeResult,
  type ScenarioInput,
} from '@/domain/taxEngine'
import {
  daysOffError,
  hoursError,
  nameError,
  percentError,
  yearError,
} from '@/domain/validate'
import type { DashboardState } from './types'

export interface BillableSummary {
  year: number
  weekdays: number
  daysOff: number
  billableDays: number
}

export interface RegimePair {
  micro: RegimeResult
  profit: RegimeResult
}

export interface TargetEvaluation {
  annualTarget: ReturnType<typeof d>
  micro: RegimeResult
  profit: RegimeResult
}

export interface Evaluation {
  payroll: PayrollResult | null
  billable: BillableSummary | null
  contract: RegimePair | null
  target: TargetEvaluation | null
  flatMonthly: boolean
}

function percentRate(text: string) {
  if (percentError(text)) return null
  const parsed = parseDecimal(text)
  return parsed == null ? null : parsed.div(100)
}

function moneyValue(text: string | null) {
  if (text == null) return null
  try {
    const value = d(text)
    return value.isNegative() ? null : value
  } catch {
    return null
  }
}

function expensesValid(rows: DashboardState['monthlyExpenses']): boolean {
  return rows.every((row) => nameError(row.name) == null && moneyValue(row.amountRon) != null)
}

function expenseTotal(rows: DashboardState['monthlyExpenses'], times: number) {
  return rows.reduce((sum, row) => sum.plus(d(row.amountRon ?? 0)), d(0)).mul(times)
}

export function sharedInputsValid(state: DashboardState): boolean {
  if (yearError(state.year)) return false
  const year = Number(state.year)
  return daysOffError(state.daysOff, year) == null
    && hoursError(state.hoursPerDay) == null
    && percentRate(state.microPercent) != null
    && percentRate(state.profitPercent) != null
    && percentRate(state.dividendPercent) != null
    && percentRate(state.casPercent) != null
    && percentRate(state.employeeCassPercent) != null
    && percentRate(state.incomeTaxPercent) != null
    && percentRate(state.camPercent) != null
    && moneyValue(state.grossRon) != null
    && moneyValue(state.untaxedRon) != null
    && moneyValue(state.personalDeductionRon) != null
    && moneyValue(state.cassReferenceWageRon) != null
    && moneyValue(state.otherIncomeRon) != null
    && moneyValue(state.microCapRon) != null
    && expensesValid(state.monthlyExpenses)
    && expensesValid(state.yearlyExpenses)
}

function buildPayroll(state: DashboardState): PayrollResult | null {
  const gross = moneyValue(state.grossRon)
  const untaxed = moneyValue(state.untaxedRon)
  const deduction = moneyValue(state.personalDeductionRon)
  const casRate = percentRate(state.casPercent)
  const cassRate = percentRate(state.employeeCassPercent)
  const incomeTaxRate = percentRate(state.incomeTaxPercent)
  const camRate = percentRate(state.camPercent)
  if (!gross || !untaxed || !deduction || !casRate || !cassRate || !incomeTaxRate || !camRate) return null
  return monthlyPayroll({
    gross,
    untaxedAmount: untaxed,
    personalDeduction: deduction,
    casRate,
    cassRate,
    incomeTaxRate,
    camRate,
  })
}

function billableSummary(state: DashboardState): BillableSummary | null {
  if (yearError(state.year) || daysOffError(state.daysOff, Number(state.year))) return null
  const year = Number(state.year)
  const daysOff = Number(state.daysOff)
  const weekdays = billableDayCount(year, 0)
  return { year, weekdays, daysOff, billableDays: weekdays - daysOff }
}

function scenarioBase(state: DashboardState, annualRevenue: ReturnType<typeof d>): ScenarioInput | null {
  if (!sharedInputsValid(state)) return null
  const payroll = buildPayroll(state)
  const microRate = percentRate(state.microPercent)
  const profitRate = percentRate(state.profitPercent)
  const dividendRate = percentRate(state.dividendPercent)
  const wage = moneyValue(state.cassReferenceWageRon)
  const other = moneyValue(state.otherIncomeRon)
  const cap = moneyValue(state.microCapRon)
  const hours = parseDecimal(state.hoursPerDay)
  const billable = billableSummary(state)
  if (!payroll || !microRate || !profitRate || !dividendRate || !wage || !other || !cap || !hours || !billable) return null
  const operating = expenseTotal(state.monthlyExpenses, 12).plus(expenseTotal(state.yearlyExpenses, 1))
  return {
    annualRevenue,
    operatingExpenses: operating,
    payroll,
    salaryMonths: FISCAL_DEFAULTS.salaryMonths,
    microRate,
    profitRate,
    dividendRate,
    cassReferenceWage: wage,
    otherIncome: other,
    billableDays: billable.billableDays,
    hoursPerDay: hours,
    microCap: cap,
  }
}

export function evaluateState(state: DashboardState): Evaluation {
  const payroll = buildPayroll(state)
  const billable = billableSummary(state)
  const flatMonthly = state.contractPeriod === 'monthly' || state.contractPeriod === 'yearly'

  let contract: RegimePair | null = null
  const amount = moneyValue(state.contractAmountRon)
  const hours = parseDecimal(state.hoursPerDay)
  if (amount && hours && billable && sharedInputsValid(state)) {
    const revenue = annualAmountFromPeriod({
      amount,
      period: state.contractPeriod,
      billableDays: billable.billableDays,
      hoursPerDay: hours,
    })
    const base = scenarioBase(state, revenue)
    if (base) contract = evaluateScenario(base)
  }

  let target: TargetEvaluation | null = null
  const wanted = moneyValue(state.targetAmountRon)
  const base = scenarioBase(state, d(0))
  if (base && wanted) {
    const annualTarget = annualAmountFromPeriod({
      amount: wanted,
      period: state.targetPeriod,
      billableDays: base.billableDays,
      hoursPerDay: base.hoursPerDay,
    })
    const deductible = base.operatingExpenses.plus(base.payroll.employerCost.mul(base.salaryMonths))
    const shared = {
      annualDividendTakeHome: annualTarget,
      deductible,
      microRate: base.microRate,
      profitRate: base.profitRate,
      dividendRate: base.dividendRate,
      cassReferenceWage: base.cassReferenceWage,
      otherIncome: base.otherIncome,
    }
    try {
      const microRevenue = requiredRevenue({ ...shared, regime: 'micro' })
      const profitRevenue = requiredRevenue({ ...shared, regime: 'profit' })
      target = {
        annualTarget,
        micro: evaluateScenario({ ...base, annualRevenue: microRevenue }).micro,
        profit: evaluateScenario({ ...base, annualRevenue: profitRevenue }).profit,
      }
    } catch {
      target = null
    }
  }

  return { payroll, billable, contract, target, flatMonthly }
}
