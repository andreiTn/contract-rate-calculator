<script setup lang="ts">
import { QBtn, QCard, QCardSection, QDialog } from 'quasar'

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()
</script>

<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card style="width: 560px; max-width: 92vw;">
      <q-card-section>
        <div class="section-title">Health contribution on dividends in 2026</div>
        <p class="hint">
          The ceiling uses 4,050 RON, the minimum wage in force on 1 January 2026. The July increase does not move it. The base is the dividend cash you receive after dividend tax, plus any other income you enter for this ceiling. The health contribution already paid on your salary does not reduce it. You pay this yourself. The company does not withhold it.
        </p>
        <dl class="line-list">
          <div><dt>Under 24,300 RON</dt><dd>0</dd></div>
          <div><dt>24,300 up to 48,600 RON</dt><dd>2,430 RON</dd></div>
          <div><dt>48,600 up to 97,200 RON</dt><dd>4,860 RON</dd></div>
          <div><dt>97,200 RON and above</dt><dd>9,720 RON</dd></div>
        </dl>
        <p class="hint" style="margin-top: 12px;">
          At exactly 24,300 the contribution is 2,430. At exactly 48,600 it is 4,860. At exactly 97,200 it is 9,720.
        </p>
        <q-btn v-close-popup color="primary" label="Close" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
