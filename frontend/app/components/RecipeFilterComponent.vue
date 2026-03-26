<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  label: String,
  min: Number,
  max: Number,
  modelValue: {
    type: Object,
    required: true,
    default: () => ({ value: 0, enabled: false })
  }
});

const emit = defineEmits(['update:modelValue']);

const value = computed({
  get: () => props.modelValue.value,
  set: (val) => {
    emit('update:modelValue', { ...props.modelValue, value: val });
  }
});

const isEnabled = computed({
  get: () => props.modelValue.enabled,
  set: (val) => {
    emit('update:modelValue', { ...props.modelValue, enabled: val });
  }
});
</script>

<template>
  <div class="w-full">
    <label class="text-sm space-x-1.5 flex items-center">
      <input type="checkbox" class="checkbox" v-model="isEnabled" />
      <span>{{label}}</span>
    </label>
    <div v-if="isEnabled" class="flex items-center space-x-4 w-full">
      <input type="range" :min="props.min" :max="props.max" v-model="value" class="range range-xs range-primary w-full" step="1"/>
      <input type="number" :min="props.min" :max="props.max" v-model="value" class="input input-sm w-15"/>
    </div>
  </div>
</template>