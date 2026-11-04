import type { BillingPeriod } from '@/domain/taxEngine'
import type { Currency, FxSnapshot } from '@/domain/fx'

export type FxStatus = 'loading' | 'fresh' | 'stale' | 'unavailable'

export interface ExpenseRow {
  id: string
  name: string
  amountRon: string | null
  currency: Currency
}

export interface MoneyCurrencies {
  contract: Currency
  gross: Currency
  target: Currency
  untaxed: Currency
  personalDeduction: Currency
  cassWage: Currency
  otherIncome: Currency
  microCap: Currency
}

export function defaultCurrencies(): MoneyCurrencies {
  return {
    contract: 'RON',
    gross: 'RON',
    target: 'RON',
    untaxed: 'RON',
    personalDeduction: 'RON',
    cassWage: 'RON',
    otherIncome: 'RON',
    microCap: 'RON',
  }
}

export interface DashboardState {
  currencies: MoneyCurrencies
  year: string
  daysOff: string
  hoursPerDay: string
  contractAmountRon: string | null
  contractPeriod: BillingPeriod
  microPercent: string
  profitPercent: string
  dividendPercent: string
  grossRon: string | null
  untaxedRon: string | null
  personalDeductionRon: string | null
  casPercent: string
  employeeCassPercent: string
  incomeTaxPercent: string
  camPercent: string
  cassReferenceWageRon: string | null
  otherIncomeRon: string | null
  microCapRon: string | null
  monthlyExpenses: ExpenseRow[]
  yearlyExpenses: ExpenseRow[]
  targetAmountRon: string | null
  targetPeriod: BillingPeriod
  fx: FxSnapshot | null
  fxStatus: FxStatus
}
