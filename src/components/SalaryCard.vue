<script setup lang="ts">
import { ref } from 'vue'
import { QBtn, QCard, QCardSection } from 'quasar'
import MoneyInput from '@/components/MoneyInput.vue'
import SalaryInfoDialog from '@/components/SalaryInfoDialog.vue'
import { useDashboardEvaluation } from '@/composables/useDashboardEvaluation'
import { dashboard } from '@/state/dashboard'
import { moneyLabel } from '@/ui/format'

const open = ref(false)
const { payrollPreview } = useDashboardEvaluation()
</script>

<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="section-title" style="display: flex; align-items: center; gap: 6px;">
        Minimum-wage salary
        <q-btn flat round dense icon="info" aria-label="Salary calculation details" @click="open = true" />
      </div>
      <p class="hint">
        You are the only employee. The company pays the employer cost. You keep the net salary, separate from dividends. Figures are this monthly payslip times 12.
      </p>
      <money-input
        v-model:model-ron="dashboard.grossRon"
        v-model:currency="dashboard.currencies.gross"
        label="Monthly gross"
      />
      <div v-if="payrollPreview" class="pay-grid">
        <div class="stat-pair"><span>Monthly net</span><strong>{{ moneyLabel(payrollPreview.net) }}</strong></div>
        <div class="stat-pair"><span>Monthly employer cost</span><strong>{{ moneyLabel(payrollPreview.employerCost) }}</strong></div>
        <div class="stat-pair"><span>Pension CAS</span><span>{{ moneyLabel(payrollPreview.cas) }}</span></div>
        <div class="stat-pair"><span>Health CASS</span><span>{{ moneyLabel(payrollPreview.cass) }}</span></div>
        <div class="stat-pair"><span>Income tax</span><span>{{ moneyLabel(payrollPreview.incomeTax) }}</span></div>
        <div class="stat-pair"><span>Labour insurance CAM</span><span>{{ moneyLabel(payrollPreview.cam) }}</span></div>
      </div>
    </q-card-section>
  </q-card>

  <salary-info-dialog v-model="open" />
</template>
