import { describe, expect, it } from 'vitest'
import { dashboard, displayFromRon } from '../state/dashboard'
import { convertFromRon, parseCupiuRates } from './fx'
import { d } from './money'

const sample = {
  date: '2026-11-03',
  rates: [
    { currency: 'EUR', name: 'Euro', rate: '5.3416', multiplier: 1 },
    { currency: 'USD', name: 'Dolar american', rate: '4.7761', multiplier: 1 },
    { currency: 'GBP', name: 'Liră sterlină', rate: '6.4063', multiplier: 1 },
    { currency: 'JPY', name: 'Yen', rate: '3.2140', multiplier: 100 },
  ],
}

describe('exchange rates', () => {
  it('reads lei per unit from the BNR feed', () => {
    const snapshot = parseCupiuRates(sample, 1_700_000_000_000)
    expect(snapshot).not.toBeNull()
    expect(snapshot?.date).toBe('2026-11-03')
    expect(snapshot?.ronPerUnit.EUR).toBe('5.3416')
    expect(snapshot?.ronPerUnit.RON).toBe('1')
  })

  it('keeps the stored lei amount when one field changes currency', () => {
    const snapshot = parseCupiuRates(sample, Date.now())!
    dashboard.fx = snapshot
    dashboard.fxStatus = 'fresh'
    dashboard.contractAmountRon = '2500'
    dashboard.currencies.contract = 'GBP'
    dashboard.monthlyExpenses = [{ id: 'tools', name: 'Tools', amountRon: '250', currency: 'RON' }]

    expect(dashboard.contractAmountRon).toBe('2500')
    expect(displayFromRon('2500', 'GBP')).toBe(convertFromRon(d(2500), 'GBP', snapshot.ronPerUnit).toFixed(2))
    expect(displayFromRon(dashboard.monthlyExpenses[0].amountRon, dashboard.monthlyExpenses[0].currency)).toBe('250.00')

    dashboard.currencies.contract = 'RON'
    expect(dashboard.contractAmountRon).toBe('2500')
    expect(displayFromRon('2500', 'RON')).toBe('2500.00')
  })
})
