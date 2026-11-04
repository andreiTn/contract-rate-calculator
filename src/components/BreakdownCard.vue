<script setup lang="ts">
import { QBanner, QCard, QCardSection } from 'quasar'
import type { RegimeResult } from '@/domain/taxEngine'
import { moneyLabel, takeHomeOfGross } from '@/ui/format'

defineProps<{
  result: RegimeResult
  title: string
  monthlyLabel: string
  showRates?: boolean
  highlightRates?: boolean
}>()
</script>

<template>
  <q-card flat bordered>
    <q-card-section class="stack">
      <div class="section-title">{{ title }}</div>

      <q-banner v-if="result.aboveMicroCap && result.regime === 'micro'" class="bg-orange-1 text-orange-10" rounded>
        Invoiced revenue is above the micro cap. Above that cap the company owes profit tax. These figures still use the micro rate.
      </q-banner>
      <q-banner v-if="result.loss" class="bg-orange-1 text-orange-10" rounded>
        Costs and company tax use up the revenue, so there is no dividend.
      </q-banner>
      <q-banner v-if="result.salaryUnfunded" class="bg-orange-1 text-orange-10" rounded>
        Invoiced revenue is below the employer cost of the salary.
      </q-banner>

      <div v-if="showRates" :class="highlightRates ? 'rate-grid' : ''">
        <template v-if="highlightRates">
          <div class="rate-tile"><span>Minimum yearly revenue</span><strong>{{ moneyLabel(result.rates.yearly) }}</strong></div>
          <div class="rate-tile"><span>{{ monthlyLabel }}</span><strong>{{ moneyLabel(result.rates.monthly) }}</strong></div>
          <div class="rate-tile"><span>Minimum weekly rate</span><strong>{{ moneyLabel(result.rates.weekly) }}</strong></div>
          <div class="rate-tile"><span>Minimum daily rate</span><strong>{{ moneyLabel(result.rates.daily) }}</strong></div>
          <div class="rate-tile"><span>Minimum hourly rate</span><strong>{{ moneyLabel(result.rates.hourly) }}</strong></div>
        </template>
        <dl v-else class="line-list">
          <div><dt>Yearly revenue</dt><dd>{{ moneyLabel(result.rates.yearly) }}</dd></div>
          <div><dt>{{ monthlyLabel }}</dt><dd>{{ moneyLabel(result.rates.monthly) }}</dd></div>
          <div><dt>Weekly rate over billable days</dt><dd>{{ moneyLabel(result.rates.weekly) }}</dd></div>
          <div><dt>Daily rate over billable days</dt><dd>{{ moneyLabel(result.rates.daily) }}</dd></div>
          <div><dt>Hourly rate</dt><dd>{{ moneyLabel(result.rates.hourly) }}</dd></div>
        </dl>
      </div>

      <div>
        <div class="section-title">Cost breakdown</div>
        <dl class="line-list">
          <div><dt>Invoiced revenue</dt><dd>{{ moneyLabel(result.revenue) }}</dd></div>
          <div><dt>Operating expenses</dt><dd>{{ moneyLabel(result.operatingExpenses) }}</dd></div>
          <div><dt>Employer salary cost</dt><dd>{{ moneyLabel(result.employerCostAnnual) }}</dd></div>
          <div><dt>{{ result.regime === 'micro' ? 'Micro tax' : 'Profit tax' }}</dt><dd>{{ moneyLabel(result.companyTax) }}</dd></div>
          <div><dt>Profit left for dividends</dt><dd>{{ moneyLabel(result.accountingProfit) }}</dd></div>
          <div><dt>Gross dividend</dt><dd>{{ moneyLabel(result.grossDividend) }}</dd></div>
          <div><dt>Dividend tax</dt><dd>{{ moneyLabel(result.dividendTax) }}</dd></div>
        </dl>
      </div>

      <div>
        <div class="section-title">Take-home</div>
        <dl class="line-list">
          <div><dt>Dividend received</dt><dd>{{ moneyLabel(result.dividendReceived) }}</dd></div>
          <div><dt>Health contribution</dt><dd>{{ moneyLabel(result.healthContribution) }}</dd></div>
        </dl>
        <div class="take-home" style="margin-top: 8px;">
          <div class="stat-pair"><span>Dividend cash</span><strong>{{ moneyLabel(result.dividendTakeHome) }}</strong></div>
          <div class="stat-pair"><span>Dividend cash per month</span><strong>{{ moneyLabel(result.dividendTakeHome.div(12)) }}</strong></div>
          <div class="stat-pair"><span>Salary net</span><strong>{{ moneyLabel(result.salaryTakeHome) }}</strong></div>
          <div class="stat-pair"><span>Total cash</span><strong>{{ moneyLabel(result.totalCash) }}</strong></div>
          <div class="stat-pair"><span>Total cash per month</span><strong>{{ moneyLabel(result.totalCash.div(12)) }}</strong></div>
          <div class="stat-pair"><span>Take-home vs gross</span><strong>{{ takeHomeOfGross(result.totalCash, result.revenue) }}</strong></div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>
