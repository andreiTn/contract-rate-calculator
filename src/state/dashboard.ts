import { reactive, ref, watch } from 'vue'
import { FISCAL_DEFAULTS } from '@/domain/fiscal'
import {
  convertToRon,
  displayAmount,
  isFresh,
  parseCupiuRates,
  type Currency,
  type FxTable,
} from '@/domain/fx'
import { d, formatPlain, parseDecimal } from '@/domain/money'
import { moneyError } from '@/domain/validate'
import {
  loadDashboardSnapshot,
  saveDashboardSnapshot,
  type PersistedDashboard,
} from '@/storage/dashboardStore'
import { CURRENT_SAVE_VERSION } from '@/storage/dashboardSchema'
import { defaultCurrencies, type DashboardState, type ExpenseRow } from './types'

const RATES_URL = 'https://cupiu.ro/api/rates/'

function emptyState(): DashboardState {
  return {
    currencies: defaultCurrencies(),
    year: String(FISCAL_DEFAULTS.year),
    daysOff: '',
    hoursPerDay: FISCAL_DEFAULTS.hoursPerDay,
    contractAmountRon: null,
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
    targetAmountRon: null,
    targetPeriod: 'yearly',
    fx: null,
    fxStatus: 'loading',
  }
}

export const dashboard = reactive<DashboardState>(emptyState())

/** Shown when both localStorage and IndexedDB refuse a write. */
export const persistError = ref<string | null>(null)

/** When true, automatic saves are skipped so an unknown save version is not overwritten. */
let persistBlocked = false
let persistTimer: ReturnType<typeof setTimeout> | null = null
let watching = false
let flushBound = false

function snapshot(): PersistedDashboard {
  return {
    version: CURRENT_SAVE_VERSION,
    currencies: { ...dashboard.currencies },
    year: dashboard.year,
    daysOff: dashboard.daysOff,
    hoursPerDay: dashboard.hoursPerDay,
    contractAmountRon: dashboard.contractAmountRon,
    contractPeriod: dashboard.contractPeriod,
    microPercent: dashboard.microPercent,
    profitPercent: dashboard.profitPercent,
    dividendPercent: dashboard.dividendPercent,
    grossRon: dashboard.grossRon,
    untaxedRon: dashboard.untaxedRon,
    personalDeductionRon: dashboard.personalDeductionRon,
    casPercent: dashboard.casPercent,
    employeeCassPercent: dashboard.employeeCassPercent,
    incomeTaxPercent: dashboard.incomeTaxPercent,
    camPercent: dashboard.camPercent,
    cassReferenceWageRon: dashboard.cassReferenceWageRon,
    otherIncomeRon: dashboard.otherIncomeRon,
    microCapRon: dashboard.microCapRon,
    monthlyExpenses: dashboard.monthlyExpenses.map((row) => ({ ...row })),
    yearlyExpenses: dashboard.yearlyExpenses.map((row) => ({ ...row })),
    targetAmountRon: dashboard.targetAmountRon,
    targetPeriod: dashboard.targetPeriod,
    fx: dashboard.fx,
  }
}

function applyPersisted(saved: PersistedDashboard) {
  dashboard.currencies = { ...saved.currencies }
  dashboard.year = saved.year
  dashboard.daysOff = saved.daysOff
  dashboard.hoursPerDay = saved.hoursPerDay
  dashboard.contractAmountRon = saved.contractAmountRon
  dashboard.contractPeriod = saved.contractPeriod
  dashboard.microPercent = saved.microPercent
  dashboard.profitPercent = saved.profitPercent
  dashboard.dividendPercent = saved.dividendPercent
  dashboard.grossRon = saved.grossRon
  dashboard.untaxedRon = saved.untaxedRon
  dashboard.personalDeductionRon = saved.personalDeductionRon
  dashboard.casPercent = saved.casPercent
  dashboard.employeeCassPercent = saved.employeeCassPercent
  dashboard.incomeTaxPercent = saved.incomeTaxPercent
  dashboard.camPercent = saved.camPercent
  dashboard.cassReferenceWageRon = saved.cassReferenceWageRon
  dashboard.otherIncomeRon = saved.otherIncomeRon
  dashboard.microCapRon = saved.microCapRon
  dashboard.monthlyExpenses = saved.monthlyExpenses.map((row) => ({ ...row }))
  dashboard.yearlyExpenses = saved.yearlyExpenses.map((row) => ({ ...row }))
  dashboard.targetAmountRon = saved.targetAmountRon
  dashboard.targetPeriod = saved.targetPeriod
  dashboard.fx = saved.fx
}

async function writeSnapshot(): Promise<boolean> {
  if (persistBlocked) {
    return false
  }

  const result = await saveDashboardSnapshot(snapshot())
  if (result.localStorage || result.indexedDb) {
    persistError.value = null
    return true
  }

  persistError.value = 'Could not save your figures in this browser.'
  return false
}

export async function hydrateDashboard(): Promise<void> {
  persistBlocked = false
  const loaded = await loadDashboardSnapshot()
  if (loaded.status === 'unsupported') {
    persistBlocked = true
    persistError.value = 'A newer saved file is on this browser. Automatic saving is paused.'
    return
  }

  if (loaded.status !== 'ok' || !loaded.data) {
    return
  }

  applyPersisted(loaded.data)
  if (loaded.data.fx == null) {
    useRonUntilRatesExist()
  }
}

export function startPersistence() {
  if (watching) {
    return
  }

  watching = true

  watch(dashboard, () => {
    if (persistBlocked) {
      return
    }

    if (persistTimer) {
      clearTimeout(persistTimer)
    }

    persistTimer = setTimeout(() => {
      void writeSnapshot()
    }, 200)
  }, { deep: true })

  if (!flushBound && typeof window !== 'undefined') {
    flushBound = true
    const flush = () => {
      if (persistTimer) {
        clearTimeout(persistTimer)
        persistTimer = null
      }
      void writeSnapshot()
    }
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        flush()
      }
    })
  }
}

export function ratesAvailable(): FxTable | null {
  return dashboard.fx?.ronPerUnit ?? null
}

export function canUseCurrency(currency: Currency): boolean {
  return currency === 'RON' || ratesAvailable() != null
}

export function displayFromRon(amountRon: string | null, currency: Currency): string {
  if (amountRon == null || amountRon === '') {
    return ''
  }

  const shown = displayAmount(d(amountRon), currency, ratesAvailable())
  return formatPlain(shown)
}

export function ronFromDisplay(text: string, currency: Currency): string | null {
  if (moneyError(text)) {
    return null
  }

  const parsed = parseDecimal(text)
  if (parsed == null) {
    return null
  }

  const rates = ratesAvailable()
  if (currency !== 'RON' && rates == null) {
    return null
  }

  const table = rates ?? { RON: '1', EUR: '1', USD: '1', GBP: '1' }
  return convertToRon(parsed, currency, table).toString()
}

function useRonUntilRatesExist() {
  if (dashboard.fx) {
    return
  }

  dashboard.currencies = defaultCurrencies()
  for (const row of dashboard.monthlyExpenses) {
    row.currency = 'RON'
  }

  for (const row of dashboard.yearlyExpenses) {
    row.currency = 'RON'
  }
}

export function addExpense(kind: 'monthly' | 'yearly') {
  const row: ExpenseRow = { id: crypto.randomUUID(), name: '', amountRon: null, currency: 'RON' }
  if (kind === 'monthly') {
    dashboard.monthlyExpenses.push(row)
  } else {
    dashboard.yearlyExpenses.push(row)
  }
}

export function removeExpense(kind: 'monthly' | 'yearly', id: string) {
  const list = kind === 'monthly' ? dashboard.monthlyExpenses : dashboard.yearlyExpenses
  const index = list.findIndex((row) => row.id === id)
  if (index >= 0) {
    list.splice(index, 1)
  }
}

export async function refreshRates(force = false) {
  const now = Date.now()
  if (!force && dashboard.fx && isFresh(dashboard.fx, now)) {
    dashboard.fxStatus = 'fresh'
    return
  }

  dashboard.fxStatus = dashboard.fx ? 'stale' : 'loading'
  try {
    const response = await fetch(RATES_URL, { signal: AbortSignal.timeout(8_000) })
    if (!response.ok) {
      throw new Error(`Rate request failed (${response.status})`)
    }

    const body = await response.json()
    const parsed = parseCupiuRates(body, Date.now())
    if (!parsed) {
      throw new Error('Rate feed did not include EUR, USD, and GBP')
    }

    dashboard.fx = parsed
    dashboard.fxStatus = 'fresh'
  } catch {
    dashboard.fxStatus = dashboard.fx ? 'stale' : 'unavailable'
    useRonUntilRatesExist()
  }
}

export type { DashboardState, ExpenseRow }
