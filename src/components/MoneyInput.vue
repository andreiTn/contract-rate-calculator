<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { QInput, QSelect } from 'quasar'
import { CURRENCIES, type Currency } from '@/domain/fx'
import { moneyError } from '@/domain/validate'
import { canUseCurrency, dashboard, displayFromRon, ronFromDisplay } from '@/state/dashboard'

const props = withDefaults(defineProps<{
  modelRon: string | null
  currency: Currency
  label: string
  hint?: string
  immediate?: boolean
}>(), {
  hint: undefined,
  immediate: false,
})

const emit = defineEmits<{
  'update:modelRon': [string | null]
  'update:currency': [Currency]
}>()

const text = ref('')
const touched = ref(props.immediate)
let suppress = false

function syncFromStore() {
  if (suppress) return
  text.value = displayFromRon(props.modelRon, props.currency)
}

watch(
  () => [props.modelRon, props.currency, dashboard.fx?.ronPerUnit] as const,
  () => syncFromStore(),
  { immediate: true },
)

function onInput(value: string | number | null) {
  const next = value == null ? '' : String(value)
  text.value = next
  touched.value = true
  suppress = true
  emit('update:modelRon', ronFromDisplay(next, props.currency))
  void nextTick(() => {
    suppress = false
  })
}

function onCurrency(value: Currency) {
  if (!canUseCurrency(value) || value === props.currency) return
  emit('update:currency', value)
}

function rule() {
  if (!touched.value && text.value.trim() === '') return true
  return moneyError(text.value) ?? true
}

function currencyDisabled(code: string) {
  return !canUseCurrency(code as Currency)
}
</script>

<template>
  <div class="money-field">
    <q-input
      :model-value="text"
      :label="label"
      :hint="hint"
      :rules="[rule]"
      outlined
      dense
      reactive-rules
      no-error-icon
      @update:model-value="onInput"
      @blur="touched = true"
    />
    <q-select
      :model-value="currency"
      :options="CURRENCIES"
      :option-disable="currencyDisabled"
      label="Currency"
      outlined
      dense
      @update:model-value="onCurrency"
    />
  </div>
</template>
