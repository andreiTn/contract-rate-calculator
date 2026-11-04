export function countWeekdays(year: number): number {
  let count = 0
  for (let month = 0; month < 12; month += 1) {
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    for (let day = 1; day <= daysInMonth; day += 1) {
      const weekday = new Date(year, month, day).getDay()
      if (weekday !== 0 && weekday !== 6) {
        count += 1
      }
    }
  }
  return count
}

export function billableDayCount(year: number, daysOff: number): number {
  return countWeekdays(year) - daysOff
}
