import { afterEach, describe, expect, it, vi } from 'vitest'
import { DASHBOARD_STORAGE_KEY } from '@/storage/dashboardSchema'
import { hasSavedDashboard } from './savedDashboard'

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

describe('saved dashboard detection', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('is false when nothing is stored', async () => {
    vi.stubGlobal('localStorage', memoryStorage())
    vi.stubGlobal('indexedDB', undefined)
    await expect(hasSavedDashboard()).resolves.toBe(false)
  })

  it('is true when a contract amount is stored', async () => {
    const storage = memoryStorage()
    storage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify({
      version: 1,
      year: '2026',
      daysOff: '',
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
    await expect(hasSavedDashboard()).resolves.toBe(true)
  })
})
