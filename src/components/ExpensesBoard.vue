<script setup lang="ts">
import { QCard, QCardSection } from 'quasar'
import ExpenseList from '@/components/ExpenseList.vue'
import { dashboard } from '@/state/dashboard'
</script>

<template>
  <q-card flat bordered class="board-span">
    <q-card-section>
      <div class="expense-split">
        <expense-list title="Monthly expenses" kind="monthly" :rows="dashboard.monthlyExpenses" />
        <expense-list title="Yearly expenses" kind="yearly" :rows="dashboard.yearlyExpenses" />
      </div>
    </q-card-section>
  </q-card>
</template>
