<script setup lang="ts">
import { computed, ref } from 'vue'
import { QBtn, QCard, QCardActions, QCardSection, QDialog, QInput, QSelect } from 'quasar'
import ExpenseList from '@/components/ExpenseList.vue'
import MoneyInput from '@/components/MoneyInput.vue'
import { countWeekdays } from '@/domain/calendar'
import { daysOffError, hoursError, nameError, yearError } from '@/domain/validate'
import { dashboard } from '@/state/dashboard'
import { markSetupDone } from '@/state/savedDashboard'
import { BILLING_PERIODS } from '@/ui/periods'

const open = defineModel<boolean>({ required: true })

const step = ref(1)
const message = ref('')
const steps = 4

const title = computed(() => {
  switch (step.value) {
    case 1:
      return 'Contract'
    case 2:
      return 'Days off'
    case 3:
      return 'Salary'
    default:
      return 'Monthly expenses'
  }
})

const intro = computed(() => {
  if (step.value === 1) {
    return 'Enter what the client pays, without VAT, in the currency of the contract. A cost in lei can stay in lei. A monthly or yearly amount is billed in full, even in months when you take days off.'
  }
  if (step.value === 2) {
    const year = yearError(dashboard.year) ? 'The selected year' : dashboard.year
    const weekdays = yearError(dashboard.year) ? null : countWeekdays(Number(dashboard.year))
    const weekdayText = weekdays == null ? '' : ` ${year} has ${weekdays} weekdays.`

    return `Add vacation and weekday public holidays as one number.${weekdayText} Only weekly, daily, and hourly rates use these days.`
  }
  if (step.value === 3) {
    return 'You are the only employee. This starts at the July 2026 minimum wage. The company pays the employer cost. You keep the net.'
  }

  return 'Add costs you pay every month, such as software or accounting. Each one can use its own currency. Leave this empty if you have none. You can add yearly costs later.'
})

function expenseProblem(): string | null {
  for (const row of dashboard.monthlyExpenses) {
    if (nameError(row.name)) {
      return 'Name each monthly expense'
    }

    if (row.amountRon == null) {
      return 'Enter an amount for each monthly expense'
    }
  }

  return null
}

function problemForStep(current: number): string | null {
  if (current === 1) {
    return dashboard.contractAmountRon == null ? 'Enter the contract amount' : null
  }

  if (current === 2) {
    return yearError(dashboard.year)
      ?? daysOffError(dashboard.daysOff, Number(dashboard.year))
      ?? hoursError(dashboard.hoursPerDay)
  }

  if (current === 3) {
    return dashboard.grossRon == null ? 'Enter the monthly gross' : null
  }

  return expenseProblem()
}

function next() {
  const problem = problemForStep(step.value)
  message.value = problem ?? ''
  if (problem) {
    return
  }

  if (step.value === steps) {
    markSetupDone()
    open.value = false
    return
  }

  step.value += 1
}

function back() {
  message.value = ''
  if (step.value > 1) {
    step.value -= 1
  }
}

function skip() {
  markSetupDone()
  open.value = false
}
</script>

<template>
  <q-dialog v-model="open" persistent>
    <q-card class="setup-wizard">
      <q-card-section>
        <p class="setup-kicker">Step {{ step }} of {{ steps }}</p>
        <div class="section-title">{{ title }}</div>
        <p class="hint">{{ intro }}</p>

        <div v-if="step === 1" class="stack">
          <money-input
            v-model:model-ron="dashboard.contractAmountRon"
            v-model:currency="dashboard.currencies.contract"
            label="Contract amount"
            immediate
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

        <div v-else-if="step === 2" class="stack">
          <q-input v-model="dashboard.year" label="Year" outlined dense />
          <q-input v-model="dashboard.daysOff" label="Days off" outlined dense placeholder="25" />
          <q-input v-model="dashboard.hoursPerDay" label="Hours per day" outlined dense />
        </div>

        <div v-else-if="step === 3" class="stack">
          <money-input
            v-model:model-ron="dashboard.grossRon"
            v-model:currency="dashboard.currencies.gross"
            label="Monthly gross"
          />
        </div>

        <expense-list v-else title="Monthly expenses" kind="monthly" :rows="dashboard.monthlyExpenses" />

        <p v-if="message" class="setup-error">{{ message }}</p>
      </q-card-section>

      <q-card-actions align="between">
        <q-btn type="button" flat color="primary" label="Skip" @click="skip" />
        <div>
          <q-btn v-if="step > 1" type="button" flat color="primary" label="Back" @click="back" />
          <q-btn type="button" color="primary" :label="step === steps ? 'See the rates' : 'Next'" @click="next" />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
