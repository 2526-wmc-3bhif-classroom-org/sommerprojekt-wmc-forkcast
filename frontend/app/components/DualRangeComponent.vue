<script setup lang="ts">
const props = defineProps<{
  min: number;
  max: number;
  modelValue: { min: number; max: number };
}>();

const emit = defineEmits<{ 'update:modelValue': [v: { min: number; max: number }] }>();

const minPercent = computed(() =>
  props.max === props.min ? 0 : ((props.modelValue.min - props.min) / (props.max - props.min)) * 100
);
const maxPercent = computed(() =>
  props.max === props.min ? 100 : ((props.modelValue.max - props.min) / (props.max - props.min)) * 100
);

function onMinInput(e: Event) {
  const v = Number((e.target as HTMLInputElement).value);
  emit('update:modelValue', { min: Math.min(v, props.modelValue.max), max: props.modelValue.max });
}

function onMaxInput(e: Event) {
  const v = Number((e.target as HTMLInputElement).value);
  emit('update:modelValue', { min: props.modelValue.min, max: Math.max(v, props.modelValue.min) });
}
</script>

<template>
  <div>
    <div class="dual-range-wrap">
      <div class="track-bg">
        <div
            class="track-fill"
            :style="{ left: minPercent + '%', width: (maxPercent - minPercent) + '%' }"
        />
      </div>
      <input type="range" class="thumb" :min="min" :max="max" :value="modelValue.min" @input="onMinInput"/>
      <input type="range" class="thumb" :min="min" :max="max" :value="modelValue.max" @input="onMaxInput"/>
    </div>
    <div class="flex justify-between text-xs text-base-content/50 mt-1 px-0.5">
      <span>{{ modelValue.min }}</span>
      <span>{{ modelValue.max }}</span>
    </div>
  </div>
</template>

<style scoped>
.dual-range-wrap {
  position: relative;
  height: 1.5rem;
  display: flex;
  align-items: center;
}

.track-bg {
  position: absolute;
  width: 100%;
  height: 0.5rem;
  background: var(--color-base-300);
  border-radius: 9999px;
}

.track-fill {
  position: absolute;
  height: 100%;
  background: var(--color-primary);
  border-radius: 9999px;
}

.thumb {
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  pointer-events: none;
  margin: 0;
  padding: 0;
}

.thumb::-webkit-slider-runnable-track { background: transparent; }
.thumb::-moz-range-track { background: transparent; }

.thumb::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: var(--color-primary);
  pointer-events: auto;
  cursor: pointer;
  border: 2px solid var(--color-base-100);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
}

.thumb::-moz-range-thumb {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: var(--color-primary);
  pointer-events: auto;
  cursor: pointer;
  border: 2px solid var(--color-base-100);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
}
</style>
