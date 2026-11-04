import Decimal from 'decimal.js'
import { d } from './money'

export type Currency = 'RON' | 'EUR' | 'USD' | 'GBP'

export const CURRENCIES: Currency[] = ['RON', 'EUR', 'USD', 'GBP']

export function isCurrency(value: unknown): value is Currency {
  return value === 'RON' || value === 'EUR' || value === 'USD' || value === 'GBP'
}

// Foreign exchange table
export interface FxTable {
  RON: string
  EUR: string
  USD: string
  GBP: string
}

export interface FxSnapshot {
  date: string
  fetchedAt: number
  ronPerUnit: FxTable
}

export interface CupiuRateRow {
  currency: string
  rate: string
  multiplier: number
}

export interface CupiuResponse {
  date: string
  rates: CupiuRateRow[]
}

const FOREIGN: Array<Exclude<Currency, 'RON'>> = ['EUR', 'USD', 'GBP']

export function parseCupiuRates(body: CupiuResponse, fetchedAt: number): FxSnapshot | null {
  if (!body || typeof body.date !== 'string' || !Array.isArray(body.rates)) {
    return null
  }

  const ronPerUnit: FxTable = { RON: '1', EUR: '', USD: '', GBP: '' }
  for (const code of FOREIGN) {
    const row = body.rates.find((rate) => rate.currency === code)
    if (!row || row.multiplier == null || Number(row.multiplier) === 0) {
      return null
    }

    try {
      ronPerUnit[code] = new Decimal(row.rate).div(row.multiplier).toString()
    } catch {
      return null
    }
  }

  return { date: body.date, fetchedAt, ronPerUnit }
}

export function isFresh(snapshot: FxSnapshot, now: number, maxAgeMs = 24 * 60 * 60 * 1000): boolean {
  return now - snapshot.fetchedAt < maxAgeMs
}

export function convertToRon(amount: Decimal, currency: Currency, rates: FxTable): Decimal {
  return amount.mul(rates[currency])
}

export function convertFromRon(amountRon: Decimal, currency: Currency, rates: FxTable): Decimal {
  return amountRon.div(rates[currency])
}

export function displayAmount(amountRon: Decimal, currency: Currency, rates: FxTable | null): Decimal {
  if (currency === 'RON' || rates == null) {
    return amountRon
  }

  return convertFromRon(amountRon, currency, rates)
}

export { d }
