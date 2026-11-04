import { afterEach, describe, expect, it, vi } from 'vitest'
import { FISCAL_DEFAULTS } from '@/domain/fiscal'
import { DASHBOARD_STORAGE_KEY } from '@/storage/dashboardSchema'
import { dashboard, hydrateDashboard } from './dashboard'

function memoryStorage() {
  const memory = new Map<string, string>()
  return {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value)
    },
    removeItem: (key: string) => {
      memory.delete(key)
    },
  }
}

describe('dashboard persistence', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    dashboard.contractAmountRon = null
    dashboard.daysOff = ''
    dashboard.year = String(FISCAL_DEFAULTS.year)
    dashboard.monthlyExpenses = []
    dashboard.currencies = {
      contract: 'RON',
      gross: 'RON',
      target: 'RON',
      untaxed: 'RON',
      personalDeduction: 'RON',
      cassWage: 'RON',
      otherIncome: 'RON',
      microCap: 'RON',
    }
  })

  it('restores a saved contract from local storage', async () => {
    const storage = memoryStorage()
    storage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify({
      version: 1,
      currency: 'RON',
      year: '2026',
      daysOff: '25',
      hoursPerDay: '8',
      contractAmountRon: '12000',
      contractPeriod: 'daily',
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
      monthlyExpenses: [{ id: 'tools', name: 'Tools', amountRon: '250' }],
      yearlyExpenses: [],
      targetAmountRon: null,
      targetPeriod: 'yearly',
      fx: null,
    }))
    vi.stubGlobal('localStorage', storage)
    vi.stubGlobal('indexedDB', undefined)

    await hydrateDashboard()

    expect(dashboard.contractAmountRon).toBe('12000')
    expect(dashboard.contractPeriod).toBe('daily')
    expect(dashboard.daysOff).toBe('25')
    expect(dashboard.monthlyExpenses).toEqual([
      { id: 'tools', name: 'Tools', amountRon: '250', currency: 'RON' },
    ])
    expect(dashboard.currencies.contract).toBe('RON')
  })

  it('copies an older single currency onto each amount', async () => {
    const storage = memoryStorage()
    storage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify({
      version: 1,
      currency: 'GBP',
      year: '2026',
      daysOff: '25',
      hoursPerDay: '8',
      contractAmountRon: '2500',
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
      monthlyExpenses: [{ id: 'office', name: 'Office', amountRon: '100' }],
      yearlyExpenses: [],
      targetAmountRon: null,
      targetPeriod: 'yearly',
      fx: { date: '2026-11-03', fetchedAt: 1, ronPerUnit: { RON: '1', EUR: '5', USD: '4', GBP: '6' } },
    }))
    vi.stubGlobal('localStorage', storage)
    vi.stubGlobal('indexedDB', undefined)

    await hydrateDashboard()

    expect(dashboard.currencies.contract).toBe('GBP')
    expect(dashboard.currencies.gross).toBe('GBP')
    expect(dashboard.monthlyExpenses[0].currency).toBe('GBP')
  })

  it('coerces a numeric year so the UI does not crash', async () => {
    const storage = memoryStorage()
    storage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify({
      version: 1,
      year: 2026,
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
    }))
    vi.stubGlobal('localStorage', storage)
    vi.stubGlobal('indexedDB', undefined)

    await hydrateDashboard()
    expect(dashboard.year).toBe('2026')
    expect(dashboard.year.trim()).toBe('2026')
  })

  it('drops a saved file that is not valid JSON', async () => {
    const storage = memoryStorage()
    storage.setItem(DASHBOARD_STORAGE_KEY, '{')
    vi.stubGlobal('localStorage', storage)
    vi.stubGlobal('indexedDB', undefined)
    dashboard.year = '2026'

    await hydrateDashboard()

    expect(storage.getItem(DASHBOARD_STORAGE_KEY)).toBeNull()
    expect(dashboard.year).toBe('2026')
  })
})
