import { computed } from 'vue'
import { dashboard } from '@/state/dashboard'
import { evaluateState } from '@/state/evaluate'

const evaluation = computed(() => evaluateState(dashboard))

export function useDashboardEvaluation() {
  return {
    payrollPreview: computed(() => evaluation.value.payroll),
    billableSummary: computed(() => evaluation.value.billable),
    contractResults: computed(() => evaluation.value.contract),
    targetResults: computed(() => evaluation.value.target),
    flatMonthlyContract: computed(() => evaluation.value.flatMonthly),
  }
}
