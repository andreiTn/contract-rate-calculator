import Decimal from 'decimal.js'

Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP })

export type DecimalValue = Decimal.Value

export function d(value: DecimalValue): Decimal {
  return new Decimal(value)
}

export function roundLei(value: Decimal): Decimal {
  return value.toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
}

export function roundMoney(value: Decimal): Decimal {
  return value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
}

/** Parse a user-typed amount. Accepts a dot or comma decimal mark. */
export function parseDecimal(raw: string): Decimal | null {
  const trimmed = raw
      .trim()
      .replace(/\s/g, '')
      .replace(',', '.')

  if (trimmed === '' || !/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return null
  }

  return new Decimal(trimmed)
}

export function formatPlain(value: Decimal, digits = 2): string {
  return value.toFixed(digits)
}

export function formatGrouped(value: Decimal, currency: string): string {
  const [whole, frac] = value.toFixed(2).split('.')
  const sign: ''|'-' = whole.startsWith('-') ? '-' : ''
  const digits: string = whole.replace('-', '')

  // Insert a comma every 3 digits from left to right
  const grouped: string = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return `${sign}${grouped}.${frac} ${currency}`
}
