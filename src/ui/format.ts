import Decimal from 'decimal.js'
import { formatGrouped } from '@/domain/money'

/** Totals stay in lei. The tax sums are done in RON. */
export function moneyLabel(amountRon: Decimal): string {
  return formatGrouped(amountRon, 'RON')
}

/** Total cash kept as a percentage of invoiced revenue. */
export function takeHomeOfGross(totalCash: Decimal, revenue: Decimal): string {
  if (revenue.lte(0)) {
    return '-'
  }

  const percent = totalCash
      .div(revenue)
      .mul(100)
      .toDecimalPlaces(1, Decimal.ROUND_HALF_UP)

  return `${percent.toFixed(1)}%`
}
