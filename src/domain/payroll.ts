import Decimal from 'decimal.js'
import { roundLei } from './money'

export interface PayrollInput {
  gross: Decimal
  untaxedAmount: Decimal
  personalDeduction: Decimal
  casRate: Decimal
  cassRate: Decimal
  incomeTaxRate: Decimal
  camRate: Decimal
}

export interface PayrollResult {
  contributionBase: Decimal
  cas: Decimal
  cass: Decimal
  incomeTaxBase: Decimal
  incomeTax: Decimal
  net: Decimal
  cam: Decimal
  employerCost: Decimal
}

/**
 * Romanian payroll for one month, rounded half-up to the nearest leu.
 * The untaxed slice and the personal deduction are inputs so a later
 * change to the minimum-wage facility can be typed in without a code change.
 */
export function monthlyPayroll(input: PayrollInput): PayrollResult {
  const contributionBase = Decimal.max(input.gross.minus(input.untaxedAmount), 0)
  const cas = roundLei(contributionBase.mul(input.casRate))
  const cass = roundLei(contributionBase.mul(input.cassRate))
  const incomeTaxBase = Decimal.max(
    input.gross
        .minus(cas)
        .minus(cass)
        .minus(input.personalDeduction)
        .minus(input.untaxedAmount),
    0,
  )
  const incomeTax = roundLei(incomeTaxBase.mul(input.incomeTaxRate))
  const net = input.gross
      .minus(cas)
      .minus(cass)
      .minus(incomeTax)
  const cam = roundLei(contributionBase.mul(input.camRate))
  const employerCost = input.gross.plus(cam)

  return { contributionBase, cas, cass, incomeTaxBase, incomeTax, net, cam, employerCost }
}

