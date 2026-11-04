<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  QBanner,
  QCard,
  QSelect,
  QSeparator,
  QTab,
  QTabPanel,
  QTabPanels,
  QTabs,
} from 'quasar'
import BreakdownCard from '@/components/BreakdownCard.vue'
import ComparisonCard from '@/components/ComparisonCard.vue'
import MoneyInput from '@/components/MoneyInput.vue'
import { useDashboardEvaluation } from '@/composables/useDashboardEvaluation'
import { dashboard } from '@/state/dashboard'
import { BILLING_PERIODS } from '@/ui/periods'

const tab = ref<'micro' | 'profit' | 'target'>('micro')
const {
  billableSummary,
  contractResults,
  targetResults,
  flatMonthlyContract,
} = useDashboardEvaluation()

const monthlyLabel = computed(() => (flatMonthlyContract.value ? 'Monthly invoice' : 'Average month'))
</script>

<template>
  <div class="results-board">
    <q-card flat bordered>
      <div v-if="billableSummary" class="billable-strip">
        <strong>{{ billableSummary.billableDays }} billable days</strong>
        <span>
          {{ billableSummary.weekdays }} weekdays − {{ billableSummary.daysOff }} days off.
          Weekly, daily, and hourly rates use those days. A monthly invoice is the yearly amount divided by 12.
        </span>
      </div>
      <p class="hint results-note">Totals below are in RON. Each amount you type keeps its own currency.</p>
      <q-tabs v-model="tab" active-color="primary" indicator-color="accent" align="left" narrow-indicator>
        <q-tab name="micro" label="Micro" />
        <q-tab name="profit" label="Profit tax" />
        <q-tab name="target" label="Target dividend" />
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="micro">
          <q-banner v-if="!contractResults" class="bg-green-1 text-green-10" rounded>
            Enter a contract amount and days off to see the micro breakdown.
          </q-banner>
          <div v-else class="compare-grid">
            <breakdown-card
              :result="contractResults.micro"
              title="Micro tax"
              :monthly-label="monthlyLabel"
              show-rates
            />
            <comparison-card title="Profit tax on this revenue" :result="contractResults.profit" />
          </div>
        </q-tab-panel>

        <q-tab-panel name="profit">
          <q-banner v-if="!contractResults" class="bg-green-1 text-green-10" rounded>
            Enter a contract amount and days off to see the profit-tax breakdown.
          </q-banner>
          <div v-else class="compare-grid">
            <breakdown-card
              :result="contractResults.profit"
              title="Profit tax"
              :monthly-label="monthlyLabel"
              show-rates
            />
            <comparison-card title="Micro tax on this revenue" :result="contractResults.micro" />
          </div>
        </q-tab-panel>

        <q-tab-panel name="target" class="stack">
          <p class="hint">
            This target is dividend cash after dividend tax and the health contribution. Salary net is added on top and is not part of the target.
          </p>
          <div class="row-2">
            <money-input
              v-model:model-ron="dashboard.targetAmountRon"
              v-model:currency="dashboard.currencies.target"
              label="Dividend cash you want"
            />
            <q-select
              v-model="dashboard.targetPeriod"
              :options="BILLING_PERIODS"
              label="Target period"
              outlined
              dense
              emit-value
              map-options
            />
          </div>
          <q-banner v-if="!targetResults" class="bg-green-1 text-green-10" rounded>
            Enter the dividend you want to keep, plus days off and the salary figures, to see the required rates.
          </q-banner>
          <template v-else>
            <p v-if="billableSummary" class="hint">
              The monthly figure is a flat invoice, the same every month. Weekly, daily, and hourly rates assume you bill only the {{ billableSummary.billableDays }} billable days.
            </p>
            <div class="target-grid">
              <breakdown-card
                :result="targetResults.micro"
                title="Required rates, micro"
                monthly-label="Minimum monthly invoice"
                show-rates
                highlight-rates
              />
              <breakdown-card
                :result="targetResults.profit"
                title="Required rates, profit tax"
                monthly-label="Minimum monthly invoice"
                show-rates
                highlight-rates
              />
            </div>
          </template>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </div>
</template>
