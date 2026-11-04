import { describe, expect, it } from 'vitest'
import type { FxSnapshot } from '@/domain/fx'
import { fxCaption } from './fxCaption'

const snapshot: FxSnapshot = {
  date: '2026-11-03',
  fetchedAt: 1,
  ronPerUnit: { RON: '1', EUR: '5.3416', USD: '4.7761', GBP: '6.4063' },
}

describe('fx caption', () => {
  it('names the fixing date and the euro rate', () => {
    expect(fxCaption('fresh', snapshot)).toBe('BNR 3 Nov 2026. 1 EUR = 5.3416 RON.')
  })

  it('marks a saved rate and a missing feed', () => {
    expect(fxCaption('stale', snapshot)).toContain('Saved rate.')
    expect(fxCaption('unavailable', null)).toBe('Rates unavailable. Amounts stay in RON.')
    expect(fxCaption('loading', null)).toBe('Loading BNR rates…')
  })
})
