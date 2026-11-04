<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ContractForm from '@/components/ContractForm.vue'
import ExpensesBoard from '@/components/ExpensesBoard.vue'
import ResultsPanel from '@/components/ResultsPanel.vue'
import SalaryCard from '@/components/SalaryCard.vue'
import SetupWizard from '@/components/SetupWizard.vue'
import StatutoryFigures from '@/components/StatutoryFigures.vue'
import { hasSavedDashboard } from '@/state/savedDashboard'

const setupOpen = ref(false)

onMounted(() => {
  void hasSavedDashboard().then((saved) => {
    setupOpen.value = !saved
  })
})
</script>

<template>
  <setup-wizard v-model="setupOpen" />
  <div class="input-board">
    <contract-form />
    <salary-card />
    <expenses-board />
    <statutory-figures />
  </div>
  <results-panel />
</template>
