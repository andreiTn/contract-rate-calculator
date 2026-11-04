import { describe, expect, it } from 'vitest'
import {
  parsePersistedDashboard,
  parsePersistedDashboardText,
  snapshotHasUserInputs,
} from './dashboardSchema'

const valid = {
  version: 1,
  currency: 'RON',
  year: '2026',
  daysOff: '25',
  hoursPerDay: '8',
  contractAmountRon: '12000',
  contractPeriod: 'yearly',
  microPercent: '1',
  profitPercent: '16',
  dividendPercent: '16',
  grossRon: '4325',
  untaxedRon: '200',
  personalDeductionRon: '865',
  casPercent: '25',
  employeeCassPercent: '10',
  incomeTaxPercent: '10',
  camPercent: '2.25',
  cassReferenceWageRon: '4050',
  otherIncomeRon: '0',
  microCapRon: '509850',
  monthlyExpenses: [],
  yearlyExpenses: [],
  targetAmountRon: null,
  targetPeriod: 'yearly',
  fx: null,
}

describe('dashboard schema', () => {
  it('accepts a version 1 snapshot and coerces a numeric year', () => {
    const result = parsePersistedDashboard({ ...valid, year: 2026 })
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    expect(result.data.year).toBe('2026')
    expect(result.data.contractAmountRon).toBe('12000')
  })

  it('copies a legacy single currency onto each amount', () => {
    const result = parsePersistedDashboard({
      ...valid,
      currency: 'GBP',
      monthlyExpenses: [{ id: '1', name: 'Rent', amountRon: '500' }],
    })
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    expect(result.data.currencies.contract).toBe('GBP')
    expect(result.data.monthlyExpenses[0].currency).toBe('GBP')
  })

  it('rejects an unknown version without treating it as corrupt wipe bait', () => {
    expect(parsePersistedDashboard({ ...valid, version: 2 })).toEqual({
      status: 'unsupported',
      version: 2,
    })
  })

  it('rejects junk JSON text', () => {
    expect(parsePersistedDashboardText('{')).toEqual({ status: 'corrupt' })
    expect(parsePersistedDashboardText(null).status).toBe('corrupt')
  })

  it('detects whether the user entered real inputs', () => {
    const empty = parsePersistedDashboard({
      ...valid,
      contractAmountRon: null,
      daysOff: '',
      targetAmountRon: null,
    })
    expect(empty.status).toBe('ok')
    if (empty.status !== 'ok') return
    expect(snapshotHasUserInputs(empty.data)).toBe(false)
    expect(snapshotHasUserInputs({ ...empty.data, contractAmountRon: '1' })).toBe(true)
  })
})
