<script setup lang="ts">
import { QBtn, QInput } from 'quasar'
import MoneyInput from '@/components/MoneyInput.vue'
import { addExpense, removeExpense, type ExpenseRow } from '@/state/dashboard'
import { nameError } from '@/domain/validate'

defineProps<{
  title: string
  kind: 'monthly' | 'yearly'
  rows: ExpenseRow[]
}>()

function nameRule(value: string) {
  return nameError(value) ?? true
}
</script>

<template>
  <div>
    <div class="section-title">{{ title }}</div>
    <p v-if="rows.length === 0" class="hint">None yet.</p>
    <div v-for="row in rows" :key="row.id" class="expense-row">
      <q-input
        v-model="row.name"
        label="Name"
        outlined
        dense
        reactive-rules
        no-error-icon
        :rules="[nameRule]"
      />
      <money-input
        v-model:model-ron="row.amountRon"
        v-model:currency="row.currency"
        label="Amount"
        immediate
      />
      <q-btn flat round dense icon="close" color="negative" aria-label="Remove expense" @click="removeExpense(kind, row.id)" />
    </div>
    <q-btn
      outline
      color="primary"
      icon="add"
      :label="kind === 'monthly' ? 'Add monthly expense' : 'Add yearly expense'"
      @click="addExpense(kind)"
    />
  </div>
</template>
