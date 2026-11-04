import { describe, expect, it } from 'vitest'
import { parseDecimal } from './money'
import { daysOffError, hoursError, moneyError, percentError, yearError } from './validate'

describe('parseDecimal', () => {
  it('accepts a comma or a dot as the decimal mark', () => {
    expect(parseDecimal('12,50')?.toString()).toBe('12.5')
    expect(parseDecimal('12.50')?.toString()).toBe('12.5')
    expect(parseDecimal('12a')).toBeNull()
  })
})

describe('field validation', () => {
  it('rejects an empty amount, letters, and a negative amount', () => {
    expect(moneyError('')).toBe('Enter an amount')
    expect(moneyError('12abc')).toBe('Enter a number, with no letters')
    expect(moneyError('-1')).toBe('Amount cannot be negative')
    expect(moneyError('0')).toBeNull()
  })

  it('allows 0 percent and rejects 100', () => {
    expect(percentError('0')).toBeNull()
    expect(percentError('99.9')).toBeNull()
    expect(percentError('100')).toBe('Percent must be under 100')
    expect(percentError('')).toBe('Enter a percent')
  })

  it('checks the year, days off, and hours', () => {
    expect(yearError('2026')).toBeNull()
    expect(yearError('1999')).toBe('Enter a year from 2000 to 2100')
    expect(daysOffError('', 2026)).toBe('Enter days off')
    expect(daysOffError('25', 2026)).toBeNull()
    expect(daysOffError('261', 2026)).toMatch(/under 261/)
    expect(hoursError('0')).toBe('Hours per day must be greater than 0')
    expect(hoursError('8')).toBeNull()
  })
})
