import { countWeekdays } from './calendar'
import { parseDecimal } from './money'

export function moneyError(text: string): string | null {
  if (text.trim() === '') {
    return 'Enter an amount'
  }

  const value = parseDecimal(text)
  if (value == null) {
    return 'Enter a number, with no letters'
  }

  if (value.isNegative()) {
    return 'Amount cannot be negative'
  }

  return null
}

export function percentError(text: string): string | null {
  if (text.trim() === '') {
    return 'Enter a percent'
  }

  const value = parseDecimal(text)
  if (value == null) {
    return 'Enter a number, with no letters'
  }

  if (value.isNegative()) {
    return 'Percent cannot be negative'
  }

  if (value.gte(100)) {
    return 'Percent must be under 100'
  }

  return null
}

export function yearError(text: string): string | null {
  if (!/^\d{4}$/.test(text.trim())) {
    return 'Enter a four-digit year'
  }

  const year = Number(text.trim())
  if (year < 2000 || year > 2100) {
    return 'Enter a year from 2000 to 2100'
  }

  return null
}

export function daysOffError(text: string, year: number): string | null {
  if (text.trim() === '') {
    return 'Enter days off'
  }

  if (!/^\d+$/.test(text.trim())) {
    return 'Enter a whole number of days'
  }

  const days = Number(text.trim())
  const weekdays = countWeekdays(year)
  if (days >= weekdays) {
    return `Days off must be under ${weekdays} weekdays`
  }

  return null
}

export function hoursError(text: string): string | null {
  if (text.trim() === '') {
    return 'Enter hours per day'
  }

  const value = parseDecimal(text)
  if (value == null) {
    return 'Enter a number, with no letters'
  }

  if (value.lte(0)) {
    return 'Hours per day must be greater than 0'
  }

  return null
}

export function nameError(text: string): string | null {
  if (text.trim() === '') {
    return 'Enter a name'
  }

  return null
}
