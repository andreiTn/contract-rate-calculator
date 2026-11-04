<script setup lang="ts">
import { QBtn, QCard, QCardSection, QDialog } from 'quasar'

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()
</script>

<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card style="width: 560px; max-width: 92vw;">
      <q-card-section>
        <div class="section-title">How the July 2026 minimum wage is calculated</div>
        <p class="hint">
          The form starts from the minimum in force since 1 July 2026. Contribution amounts are rounded half-up to the nearest leu.
        </p>
        <dl class="line-list">
          <div><dt>Gross</dt><dd>4,325 RON</dd></div>
          <div><dt>Untaxed slice</dt><dd>200 RON</dd></div>
          <div><dt>Contribution base</dt><dd>4,125 RON</dd></div>
          <div><dt>Pension CAS, 25%</dt><dd>1,031 RON</dd></div>
          <div><dt>Health CASS, 10%</dt><dd>413 RON</dd></div>
          <div><dt>Personal deduction, no dependents</dt><dd>865 RON</dd></div>
          <div><dt>Income tax, 10%</dt><dd>182 RON</dd></div>
          <div><dt>Net salary</dt><dd>2,699 RON</dd></div>
          <div><dt>Labour insurance CAM, 2.25%</dt><dd>93 RON</dd></div>
          <div><dt>Employer cost</dt><dd>4,418 RON</dd></div>
        </dl>
        <p class="hint" style="margin-top: 12px;">
          From 1 January to 30 June 2026 the gross minimum was 4,050 RON, with a 300 RON untaxed slice. Published figures for that payslip were about 2,574 RON net and 4,134 RON employer cost. There is no extra pension contribution on dividends. Pension is the salary CAS only.
        </p>
        <q-btn v-close-popup color="primary" label="Close" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
