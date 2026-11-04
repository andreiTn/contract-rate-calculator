import { describe, expect, it } from 'vitest'
import { countWeekdays } from './calendar'

const saturdayDateIndex = 6;
const sundayDateIndex = 0;

function daysInYear(year: number): number {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365
}

function weekendDays(year: number): number {
  let count = 0
  for (let month = 0; month < 12; month += 1) {
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    for (let day = 1; day <= daysInMonth; day += 1) {
      const weekday = new Date(year, month, day).getDay()
      if (weekday === saturdayDateIndex || weekday === sundayDateIndex) {
        count += 1
      }
    }
  }
  return count
}

describe('calendar', () => {
  it('splits every day of the year into a weekday or a weekend day', () => {
    for (const year of [2024, 2025, 2026, 2028]) {
      expect(countWeekdays(year) + weekendDays(year)).toBe(daysInYear(year))
    }
  })
})
