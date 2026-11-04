import { afterEach, describe, expect, it, vi } from 'vitest'
import { DASHBOARD_STORAGE_KEY, SETUP_DONE_KEY } from './dashboardSchema'
import {
  hasSavedDashboard,
  loadDashboardSnapshot,
  markSetupDone,
  saveDashboardSnapshot,
} from './dashboardStore'

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

const sample = {
  version: 1 as const,
  currencies: {
    contract: 'RON' as const,
    gross: 'RON' as const,
    target: 'RON' as const,
    untaxed: 'RON' as const,
    personalDeduction: 'RON' as const,
    cassWage: 'RON' as const,
    otherIncome: 'RON' as const,
    microCap: 'RON' as const,
  },
  year: '2026',
  daysOff: '25',
  hoursPerDay: '8',
  contractAmountRon: '12000',
  contractPeriod: 'yearly' as const,
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
  monthlyExpenses: [] as [],
  yearlyExpenses: [] as [],
  targetAmountRon: null,
  targetPeriod: 'yearly' as const,
  fx: null,
}

describe('dashboard store', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('loads a valid localStorage snapshot', async () => {
    const storage = memoryStorage()
    storage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(sample))
    vi.stubGlobal('localStorage', storage)
    vi.stubGlobal('indexedDB', {
      open: () => {
        throw new Error('unused')
      },
    })

    // IndexedDB helpers catch open failures; stub a minimal failing factory.
    const outcome = await loadDashboardSnapshot()
    expect(outcome.status).toBe('ok')
    expect(outcome.data?.contractAmountRon).toBe('12000')
  })

  it('does not wipe an unsupported version', async () => {
    const storage = memoryStorage()
    storage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify({ ...sample, version: 9 }))
    vi.stubGlobal('localStorage', storage)

    const outcome = await loadDashboardSnapshot()
    expect(outcome.status).toBe('unsupported')
    expect(storage.getItem(DASHBOARD_STORAGE_KEY)).toContain('"version":9')
  })

  it('removes a corrupt local snapshot', async () => {
    const storage = memoryStorage()
    storage.setItem(DASHBOARD_STORAGE_KEY, '{')
    vi.stubGlobal('localStorage', storage)
    vi.stubGlobal('indexedDB', undefined)

    const outcome = await loadDashboardSnapshot()
    expect(outcome.status).toBe('corrupt')
    expect(storage.getItem(DASHBOARD_STORAGE_KEY)).toBeNull()
  })

  it('saves through localStorage even when IndexedDB is missing', async () => {
    const storage = memoryStorage()
    vi.stubGlobal('localStorage', storage)
    vi.stubGlobal('indexedDB', undefined)

    const result = await saveDashboardSnapshot(sample)
    expect(result.localStorage).toBe(true)
    expect(result.indexedDb).toBe(false)
    expect(storage.getItem(DASHBOARD_STORAGE_KEY)).toContain('12000')
  })

  it('treats setup-done as a saved dashboard', async () => {
    const storage = memoryStorage()
    vi.stubGlobal('localStorage', storage)
    vi.stubGlobal('indexedDB', undefined)

    expect(await hasSavedDashboard()).toBe(false)
    markSetupDone()
    expect(storage.getItem(SETUP_DONE_KEY)).toBe('done')
    expect(await hasSavedDashboard()).toBe(true)
  })
})
