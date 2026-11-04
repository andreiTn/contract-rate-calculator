<script setup lang="ts">
import { QBanner, QCard, QCardSection } from 'quasar'
import type { RegimeResult } from '@/domain/taxEngine'
import { moneyLabel, takeHomeOfGross } from '@/ui/format'

defineProps<{
  title: string
  result: RegimeResult
}>()
</script>

<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="section-title">{{ title }}</div>
      <p class="hint">Same revenue, other regime.</p>
      <q-banner v-if="result.aboveMicroCap && result.regime === 'micro'" class="bg-orange-1 text-orange-10 q-mb-sm" rounded dense>
        This revenue is above the micro cap.
      </q-banner>
      <dl class="line-list">
        <div><dt>{{ result.regime === 'micro' ? 'Micro tax' : 'Profit tax' }}</dt><dd>{{ moneyLabel(result.companyTax) }}</dd></div>
        <div><dt>Dividend tax</dt><dd>{{ moneyLabel(result.dividendTax) }}</dd></div>
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
    </q-card-section>
  </q-card>
</template>
