import { describe, expect, it } from 'vitest'
import { billableDayCount, countWeekdays } from './calendar'
import { d } from './money'
import { monthlyPayroll } from './payroll'
import {
  annualRevenueFromContract,
  dividendReceivedForTakeHome,
  equivalentRates,
  evaluateScenario,
  healthContribution,
  requiredRevenue,
} from './taxEngine'

const wage = d(4050)
const microRate = d('0.01')
const profitRate = d('0.16')
const dividendRate = d('0.16')

function julyPayroll() {
  return monthlyPayroll({
    gross: d(4325),
    untaxedAmount: d(200),
    personalDeduction: d(865),
    casRate: d('0.25'),
    cassRate: d('0.10'),
    incomeTaxRate: d('0.10'),
    camRate: d('0.0225'),
  })
}

function scenario(annualRevenue: ReturnType<typeof d>) {
  return evaluateScenario({
    annualRevenue,
    operatingExpenses: d(0),
    payroll: julyPayroll(),
    salaryMonths: 12,
    microRate,
    profitRate,
    dividendRate,
    cassReferenceWage: wage,
    otherIncome: d(0),
    billableDays: 236,
    hoursPerDay: d(8),
    microCap: d(509850),
  })
}

describe('calendar', () => {
  it('counts 261 weekdays in 2026', () => {
    expect(countWeekdays(2026)).toBe(261)
    expect(billableDayCount(2026, 25)).toBe(236)
  })
})

describe('contract revenue', () => {
  it('keeps a yearly amount whole and derives the day rate from billable days', () => {
    const yearly = annualRevenueFromContract({
      amount: d(90000),
      period: 'yearly',
      billableDays: 236,
      hoursPerDay: d(8),
    })
    expect(yearly.equals(90000)).toBe(true)
    const rates = equivalentRates(yearly, 236, d(8))
    expect(rates.monthly.equals(7500)).toBe(true)
    expect(rates.daily.equals(d(90000).div(236))).toBe(true)
  })

  it('does not change monthly or yearly invoices when days off change', () => {
    const monthly = (days: number) => annualRevenueFromContract({
      amount: d(7500),
      period: 'monthly',
      billableDays: days,
      hoursPerDay: d(8),
    })
    expect(monthly(236).equals(monthly(200))).toBe(true)
    expect(monthly(236).equals(90000)).toBe(true)
  })

  it('scales a daily rate by billable days', () => {
    const revenue = annualRevenueFromContract({
      amount: d(200),
      period: 'daily',
      billableDays: 236,
      hoursPerDay: d(8),
    })
    expect(revenue.equals(d(200).mul(236))).toBe(true)
  })
})

describe('payroll', () => {
  it('matches the July 2026 minimum-wage payslip', () => {
    const pay = julyPayroll()
    expect(pay.cas.equals(1031)).toBe(true)
    expect(pay.cass.equals(413)).toBe(true)
    expect(pay.incomeTax.equals(182)).toBe(true)
    expect(pay.net.equals(2699)).toBe(true)
    expect(pay.cam.equals(93)).toBe(true)
    expect(pay.employerCost.equals(4418)).toBe(true)
  })
})

describe('health contribution', () => {
  it('applies the 6, 12, and 24 wage steps', () => {
    expect(healthContribution(d('24299.99'), d(0), wage).equals(0)).toBe(true)
    expect(healthContribution(d(24300), d(0), wage).equals(2430)).toBe(true)
    expect(healthContribution(d('48599.99'), d(0), wage).equals(2430)).toBe(true)
    expect(healthContribution(d(48600), d(0), wage).equals(4860)).toBe(true)
    expect(healthContribution(d('97199.99'), d(0), wage).equals(4860)).toBe(true)
    expect(healthContribution(d(97200), d(0), wage).equals(9720)).toBe(true)
  })
})

describe('regimes on a 90,000 demo contract with only the salary cost', () => {
  const result = scenario(d(90000))

  it('charges 1% micro tax and applies the first health band', () => {
    expect(result.micro.companyTax.equals(900)).toBe(true)
    expect(result.micro.employerCostAnnual.equals(53016)).toBe(true)
    expect(result.micro.accountingProfit.equals(36084)).toBe(true)
    expect(result.micro.dividendTax.equals('5773.44')).toBe(true)
    expect(result.micro.dividendReceived.equals('30310.56')).toBe(true)
    expect(result.micro.healthContribution.equals(2430)).toBe(true)
    expect(result.micro.dividendTakeHome.equals('27880.56')).toBe(true)
    expect(result.micro.salaryTakeHome.equals(32388)).toBe(true)
    expect(result.micro.totalCash.equals('60268.56')).toBe(true)
    expect(result.micro.aboveMicroCap).toBe(false)
    expect(result.micro.loss).toBe(false)
  })

  it('charges 16% profit tax on the surplus after the salary', () => {
    expect(result.profit.companyTax.equals('5917.44')).toBe(true)
    expect(result.profit.accountingProfit.equals('31066.56')).toBe(true)
    expect(result.profit.dividendReceived.equals('26095.9104')).toBe(true)
    expect(result.profit.dividendTakeHome.equals('23665.9104')).toBe(true)
    expect(result.profit.salaryTakeHome.equals(32388)).toBe(true)
  })
})

describe('reverse dividend target', () => {
  it('adds the health contribution only once the target crosses a ceiling', () => {
    expect(dividendReceivedForTakeHome(d(20000), d(0), wage).equals(20000)).toBe(true)
    expect(dividendReceivedForTakeHome(d(30000), d(0), wage).equals(32430)).toBe(true)
    expect(dividendReceivedForTakeHome(d(100000), d(0), wage).equals(109720)).toBe(true)
  })

  it('returns the same revenue that produced the dividend take-home', () => {
    const forward = scenario(d(90000)).micro
    const deductible = forward.deductible
    const revenue = requiredRevenue({
      regime: 'micro',
      annualDividendTakeHome: forward.dividendTakeHome,
      deductible,
      microRate,
      profitRate,
      dividendRate,
      cassReferenceWage: wage,
      otherIncome: d(0),
    })
    expect(revenue.equals(90000)).toBe(true)

    const profitForward = scenario(d(180000)).profit
    const profitRevenue = requiredRevenue({
      regime: 'profit',
      annualDividendTakeHome: profitForward.dividendTakeHome,
      deductible: profitForward.deductible,
      microRate,
      profitRate,
      dividendRate,
      cassReferenceWage: wage,
      otherIncome: d(0),
    })
    expect(profitRevenue.equals(180000)).toBe(true)
  })
})
