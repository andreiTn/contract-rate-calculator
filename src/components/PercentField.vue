<script setup lang="ts">
import { QInput } from 'quasar'
import { percentError } from '@/domain/validate'

defineProps<{
  modelValue: string
  label: string
}>()

const emit = defineEmits<{ 'update:modelValue': [string] }>()

function rule(value: string) {
  return percentError(value) ?? true
}

function onUpdate(value: string | number | null) {
  emit('update:modelValue', value == null ? '' : String(value))
}
</script>

<template>
  <q-input
    :model-value="modelValue"
    :label="label"
    suffix="%"
    outlined
    dense
    reactive-rules
    no-error-icon
    :rules="[rule]"
    @update:model-value="onUpdate"
  />
</template>
