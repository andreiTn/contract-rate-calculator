import type { BillingPeriod } from '@/domain/taxEngine'

export const BILLING_PERIODS: Array<{ label: string; value: BillingPeriod }> = [
  { label: 'Hourly', value: 'hourly' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
]
