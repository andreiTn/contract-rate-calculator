import { describe, expect, it } from 'vitest'
import { FISCAL_DEFAULTS } from '@/domain/fiscal'
import { evaluateState } from './evaluate'
import { defaultCurrencies, type DashboardState } from './types'

/** Synthetic demo figures only. Not a real contract. */
function demoState(): DashboardState {
  return {
    currencies: defaultCurrencies(),
    year: String(FISCAL_DEFAULTS.year),
    daysOff: '25',
    hoursPerDay: FISCAL_DEFAULTS.hoursPerDay,
    contractAmountRon: '90000',
    contractPeriod: 'yearly',
    microPercent: FISCAL_DEFAULTS.microPercent,
    profitPercent: FISCAL_DEFAULTS.profitPercent,
    dividendPercent: FISCAL_DEFAULTS.dividendPercent,
    grossRon: FISCAL_DEFAULTS.grossRon,
    untaxedRon: FISCAL_DEFAULTS.untaxedRon,
    personalDeductionRon: FISCAL_DEFAULTS.personalDeductionRon,
    casPercent: FISCAL_DEFAULTS.casPercent,
    employeeCassPercent: FISCAL_DEFAULTS.employeeCassPercent,
    incomeTaxPercent: FISCAL_DEFAULTS.incomeTaxPercent,
    camPercent: FISCAL_DEFAULTS.camPercent,
    cassReferenceWageRon: FISCAL_DEFAULTS.cassReferenceWageRon,
    otherIncomeRon: FISCAL_DEFAULTS.otherIncomeRon,
    microCapRon: FISCAL_DEFAULTS.microCapRon,
    monthlyExpenses: [],
    yearlyExpenses: [],
    targetAmountRon: '27880.56',
    targetPeriod: 'yearly',
    fx: null,
    fxStatus: 'unavailable',
  }
}

describe('evaluateState', () => {
  it('reproduces the 90,000 demo contract and the reverse micro rate', () => {
    const result = evaluateState(demoState())
    expect(result.billable?.billableDays).toBe(236)
    expect(result.payroll?.net.toString()).toBe('2699')
    expect(result.contract?.micro.revenue.toString()).toBe('90000')
    expect(result.contract?.micro.dividendTakeHome.toString()).toBe('27880.56')
    expect(result.contract?.micro.totalCash.toString()).toBe('60268.56')
    expect(result.contract?.profit.companyTax.toString()).toBe('5917.44')
    expect(result.target?.micro.revenue.toString()).toBe('90000')
    expect(result.target?.profit.revenue.toFixed(2)).toBe('95973.14')
    expect(result.flatMonthly).toBe(true)
  })

  it('leaves the contract empty until days off are valid', () => {
    const state = demoState()
    state.daysOff = ''
    const result = evaluateState(state)
    expect(result.contract).toBeNull()
    expect(result.target).toBeNull()
    expect(result.payroll).not.toBeNull()
  })
})
