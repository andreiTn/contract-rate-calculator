<script setup lang="ts">
import { computed } from 'vue'
import { QCard, QCardSection, QInput, QSelect } from 'quasar'
import MoneyInput from '@/components/MoneyInput.vue'
import PercentField from '@/components/PercentField.vue'
import { countWeekdays } from '@/domain/calendar'
import { daysOffError, hoursError, yearError } from '@/domain/validate'
import { dashboard } from '@/state/dashboard'
import { BILLING_PERIODS } from '@/ui/periods'

const daysHint = computed(() => {
  if (yearError(dashboard.year)) return 'Vacation plus weekday public holidays.'
  const weekdays = countWeekdays(Number(dashboard.year))
  return `${dashboard.year} has ${weekdays} weekdays. Billable days are that count minus the days you enter. Monthly and yearly contracts are invoiced in full.`
})

function yearRule(value: string) {
  return yearError(value) ?? true
}

function daysRule(value: string) {
  if (yearError(dashboard.year)) return 'Enter a valid year first'
  return daysOffError(value, Number(dashboard.year)) ?? true
}

function hoursRule(value: string) {
  return hoursError(value) ?? true
}
</script>

<template>
  <q-card flat bordered>
    <q-card-section class="stack">
      <div>
        <div class="section-title">Contract</div>
        <p class="hint">Amounts are without VAT. This currency is only for the contract. Expenses can use another one. A monthly or yearly amount is billed in full, including months when you take time off.</p>
      </div>
      <div class="row-2">
          <money-input
            v-model:model-ron="dashboard.contractAmountRon"
            v-model:currency="dashboard.currencies.contract"
            label="Contract amount"
          />
        <q-select
          v-model="dashboard.contractPeriod"
          :options="BILLING_PERIODS"
          label="Billing period"
          outlined
          dense
          emit-value
          map-options
        />
      </div>
      <div class="row-2">
        <q-input v-model="dashboard.year" label="Year" outlined dense reactive-rules no-error-icon :rules="[yearRule]" />
        <q-input
          v-model="dashboard.hoursPerDay"
          label="Hours per day"
          outlined
          dense
          reactive-rules
          no-error-icon
          hint="Used for hourly rates."
          :rules="[hoursRule]"
        />
      </div>
      <q-input
        v-model="dashboard.daysOff"
        label="Days off"
        outlined
        dense
        reactive-rules
        no-error-icon
        placeholder="25"
        :hint="daysHint"
        :rules="[daysRule]"
      />
      <div class="row-3">
        <percent-field v-model="dashboard.microPercent" label="Micro tax" />
        <percent-field v-model="dashboard.profitPercent" label="Profit tax" />
        <percent-field v-model="dashboard.dividendPercent" label="Dividend tax" />
      </div>
    </q-card-section>
  </q-card>
</template>
