import type { FxSnapshot } from '@/domain/fx'
import type { FxStatus } from '@/state/types'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function fxCaption(status: FxStatus, fx: FxSnapshot | null): string {
  if (status === 'loading' && !fx) {
    return 'Loading BNR rates…'
  }

  if (!fx) {
    return 'Rates unavailable. Amounts stay in RON.'
  }

  const [year, month, day] = fx.date.split('-')
  const pretty = `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`
  const saved = status === 'stale' ? ' Saved rate.' : ''

  return `BNR ${pretty}. 1 EUR = ${fx.ronPerUnit.EUR} RON.${saved}`
}
