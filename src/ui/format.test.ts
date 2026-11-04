import { describe, expect, it } from 'vitest'
import { d } from '@/domain/money'
import { takeHomeOfGross } from './format'

describe('takeHomeOfGross', () => {
  it('shows total cash as a one-decimal percent of revenue', () => {
    expect(takeHomeOfGross(d(8300), d(10000))).toBe('83.0%')
    expect(takeHomeOfGross(d(6700), d(10000))).toBe('67.0%')
  })

  it('stays blank when there is no revenue', () => {
    expect(takeHomeOfGross(d(0), d(0))).toBe('-')
  })
})
