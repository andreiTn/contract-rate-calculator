<script setup lang="ts">
import { ref } from 'vue'
import { QBtn, QCard, QCardSection, QExpansionItem } from 'quasar'
import HealthInfoDialog from '@/components/HealthInfoDialog.vue'
import MoneyInput from '@/components/MoneyInput.vue'
import PercentField from '@/components/PercentField.vue'
import { dashboard } from '@/state/dashboard'

const healthInfo = ref(false)
</script>

<template>
  <q-expansion-item
    class="board-span statutory"
    icon="tune"
    label="Statutory figures"
    caption="Rates and ceilings that change with the law"
    header-class="text-dark"
    bordered
  >
    <q-card flat>
      <q-card-section class="stack">
        <money-input
            v-model:model-ron="dashboard.untaxedRon"
            v-model:currency="dashboard.currencies.untaxed"
            label="Untaxed salary slice"
        />

        <money-input v-model:model-ron="dashboard.personalDeductionRon" v-model:currency="dashboard.currencies.personalDeduction" label="Personal deduction" />
        <div class="row-2">
          <percent-field v-model="dashboard.casPercent" label="Pension CAS" />
          <percent-field v-model="dashboard.employeeCassPercent" label="Salary health CASS" />
        </div>
        <div class="row-2">
          <percent-field v-model="dashboard.incomeTaxPercent" label="Salary income tax" />
          <percent-field v-model="dashboard.camPercent" label="Employer CAM" />
        </div>
        <money-input v-model:model-ron="dashboard.cassReferenceWageRon" v-model:currency="dashboard.currencies.cassWage" label="Wage for the health ceiling" />
        <div style="display: flex; align-items: flex-start; gap: 4px;">
          <money-input v-model:model-ron="dashboard.otherIncomeRon" v-model:currency="dashboard.currencies.otherIncome" label="Other income in the health ceiling" hint="Rent, interest, and similar. Default 0." style="flex: 1;" />
          <q-btn flat round dense icon="info" aria-label="Health contribution ceilings" style="margin-top: 4px;" @click="healthInfo = true" />
        </div>
        <money-input v-model:model-ron="dashboard.microCapRon" v-model:currency="dashboard.currencies.microCap" label="Micro revenue cap" hint="100,000 euro at the 31 December 2025 BNR rate, 5.0985." />
      </q-card-section>
    </q-card>
  </q-expansion-item>

  <health-info-dialog v-model="healthInfo" />
</template>
