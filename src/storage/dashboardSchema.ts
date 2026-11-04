import type { BillingPeriod } from '@/domain/taxEngine'
import { type ExpenseRow, type MoneyCurrencies } from '@/state/types'
import { isCurrency, type Currency, type FxSnapshot, type FxTable } from '@/domain/fx'

export const DASHBOARD_STORAGE_KEY = 'salary-negotiation-dashboard-v1'
export const SETUP_DONE_KEY = 'salary-negotiation-setup-v1'
export const DASHBOARD_IDB_NAME = 'salary-negotiation-dashboard'
export const DASHBOARD_IDB_STORE = 'snapshots'
export const DASHBOARD_IDB_KEY = 'current'
export const CURRENT_SAVE_VERSION = 1 as const
export const MAX_EXPENSE_ROWS = 100

const PERIODS: BillingPeriod[] = ['hourly', 'daily', 'weekly', 'monthly', 'yearly']

export interface PersistedDashboard {
  version: typeof CURRENT_SAVE_VERSION
  currencies: MoneyCurrencies
  year: string
  daysOff: string
  hoursPerDay: string
  contractAmountRon: string | null
  contractPeriod: BillingPeriod
  microPercent: string
  profitPercent: string
  dividendPercent: string
  grossRon: string | null
  untaxedRon: string | null
  personalDeductionRon: string | null
  casPercent: string
  employeeCassPercent: string
  incomeTaxPercent: string
  camPercent: string
  cassReferenceWageRon: string | null
  otherIncomeRon: string | null
  microCapRon: string | null
  monthlyExpenses: ExpenseRow[]
  yearlyExpenses: ExpenseRow[]
  targetAmountRon: string | null
  targetPeriod: BillingPeriod
  fx: FxSnapshot | null
  /** Older saves used one currency for every amount. */
  currency?: Currency
}

export type ParseResult =
  | { status: 'ok'; data: PersistedDashboard }
  | { status: 'corrupt' }
  | { status: 'unsupported'; version: unknown }

function asString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') {
    return value
  }
  
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  return fallback
}

function asMoneyRon(value: unknown): string | null {
  if (value == null || value === '') {
    return null
  }

  const text = asString(value, '')
  if (text === '') {
    return null
  }

  // Check if the number is int or decimal with
  // optional negative sign
  if (!/^-?\d+(\.\d+)?$/.test(text)) {
    return null
  }

  return text
}

function asPeriod(value: unknown, fallback: BillingPeriod): BillingPeriod {
  return PERIODS.includes(value as BillingPeriod)
      ? (value as BillingPeriod)
      : fallback
}

function asCurrency(value: unknown, fallback: Currency): Currency {
  return isCurrency(value) ? value : fallback
}

function asFxTable(value: unknown): FxTable | null {
  if (value == null || typeof value !== 'object') {
    return null
  }

  const row = value as Record<string, unknown>
  const table: FxTable = {
    RON: asString(row.RON, '1'),
    EUR: asString(row.EUR),
    USD: asString(row.USD),
    GBP: asString(row.GBP),
  }

  if (!table.EUR || !table.USD || !table.GBP) {
    return null
  }

  return table
}

function asFx(value: unknown): FxSnapshot | null {
  if (value == null) {
    return null
  }

  if (typeof value !== 'object') {
    return null
  }

  const row = value as Record<string, unknown>
  const ronPerUnit = asFxTable(row.ronPerUnit)
  if (!ronPerUnit) {
    return null
  }

  const date = asString(row.date)
  const fetchedAt = typeof row.fetchedAt === 'number' && Number.isFinite(row.fetchedAt)
    ? row.fetchedAt
    : Date.now()

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null
  }

  return { date, fetchedAt, ronPerUnit }
}

function asExpense(value: unknown, fallbackCurrency: Currency): ExpenseRow | null {
  if (value == null || typeof value !== 'object') {
    return null
  }

  const row = value as Record<string, unknown>
  const id = asString(row.id)
  const name = asString(row.name)
  if (!id) {
    return null
  }

  return {
    id,
    name,
    amountRon: asMoneyRon(row.amountRon),
    currency: asCurrency(row.currency, fallbackCurrency),
  }
}

function asExpenses(value: unknown, fallbackCurrency: Currency): ExpenseRow[] {
  if (!Array.isArray(value)) {
    return []
  }

  const rows: ExpenseRow[] = []
  for (const entry of value.slice(0, MAX_EXPENSE_ROWS)) {
    const row = asExpense(entry, fallbackCurrency)
    if (row) {
      rows.push(row)
    }
  }

  return rows
}

function asCurrencies(value: unknown, fallback: Currency): MoneyCurrencies {
  if (value == null || typeof value !== 'object') {
    return {
      contract: fallback,
      gross: fallback,
      target: fallback,
      untaxed: fallback,
      personalDeduction: fallback,
      cassWage: fallback,
      otherIncome: fallback,
      microCap: fallback,
    }
  }

  const row = value as Record<string, unknown>
  return {
    contract: asCurrency(row.contract, fallback),
    gross: asCurrency(row.gross, fallback),
    target: asCurrency(row.target, fallback),
    untaxed: asCurrency(row.untaxed, fallback),
    personalDeduction: asCurrency(row.personalDeduction, fallback),
    cassWage: asCurrency(row.cassWage, fallback),
    otherIncome: asCurrency(row.otherIncome, fallback),
    microCap: asCurrency(row.microCap, fallback),
  }
}

/** Parse a saved dashboard. Coerces mild type drift. Rejects unknown versions and junk. */
export function parsePersistedDashboard(raw: unknown): ParseResult {
  if (raw == null || typeof raw !== 'object') {
    return { status: 'corrupt' }
  }

  const row = raw as Record<string, unknown>
  if (!('version' in row)) {
    return { status: 'corrupt' }
  }

  if (row.version !== CURRENT_SAVE_VERSION) {
    return { status: 'unsupported', version: row.version }
  }

  try {
    const legacyCurrency = asCurrency(row.currency, 'RON')
    const data: PersistedDashboard = {
      version: CURRENT_SAVE_VERSION,
      currencies: asCurrencies(row.currencies, legacyCurrency),
      year: asString(row.year),
      daysOff: asString(row.daysOff),
      hoursPerDay: asString(row.hoursPerDay, '8'),
      contractAmountRon: asMoneyRon(row.contractAmountRon),
      contractPeriod: asPeriod(row.contractPeriod, 'yearly'),
      microPercent: asString(row.microPercent),
      profitPercent: asString(row.profitPercent),
      dividendPercent: asString(row.dividendPercent),
      grossRon: asMoneyRon(row.grossRon),
      untaxedRon: asMoneyRon(row.untaxedRon),
      personalDeductionRon: asMoneyRon(row.personalDeductionRon),
      casPercent: asString(row.casPercent),
      employeeCassPercent: asString(row.employeeCassPercent),
      incomeTaxPercent: asString(row.incomeTaxPercent),
      camPercent: asString(row.camPercent),
      cassReferenceWageRon: asMoneyRon(row.cassReferenceWageRon),
      otherIncomeRon: asMoneyRon(row.otherIncomeRon),
      microCapRon: asMoneyRon(row.microCapRon),
      monthlyExpenses: asExpenses(row.monthlyExpenses, legacyCurrency),
      yearlyExpenses: asExpenses(row.yearlyExpenses, legacyCurrency),
      targetAmountRon: asMoneyRon(row.targetAmountRon),
      targetPeriod: asPeriod(row.targetPeriod, 'yearly'),
      fx: asFx(row.fx),
    }
    return { status: 'ok', data }
  } catch (e) {
    console.debug('could not parse persisted data', e);
    return { status: 'corrupt' }
  }
}

export function parsePersistedDashboardText(raw: string | null): ParseResult {
  if (raw == null || raw === '') {
    return { status: 'corrupt' }
  }

  try {
    return parsePersistedDashboard(JSON.parse(raw) as unknown)
  } catch {
    return { status: 'corrupt' }
  }
}

export function snapshotHasUserInputs(data: PersistedDashboard): boolean {
  if (data.contractAmountRon) {
    return true
  }
  if (data.daysOff.trim() !== '') {
    return true
  }
  if (data.monthlyExpenses.length > 0) {
    return true
  }
  if (data.yearlyExpenses.length > 0) {
    return true
  }

  return !!data.targetAmountRon;
}
