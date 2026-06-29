<script setup lang="ts">
defineProps<{
  name: string;
  amount: number;
  unit: string;
  recipes: string[];
  checked: boolean;
}>();

defineEmits<{ toggle: [] }>();
</script>

<template>
  <li
    class="flex items-center gap-3 bg-base-200 rounded-box px-4 py-3 cursor-pointer select-none transition-opacity"
    :class="{ 'opacity-50': checked }"
    @click="$emit('toggle')"
  >
    <i
      :class="[
        'text-lg shrink-0 transition-colors',
        checked
          ? 'fa-solid fa-circle-check text-primary'
          : 'fa-regular fa-circle text-base-content/20',
      ]"
    />
    <div class="flex-1 min-w-0">
      <span
        class="font-medium text-base-content"
        :class="{ 'line-through text-base-content/40': checked }"
      >{{ name }}</span>
      <div v-if="recipes.length > 0" class="flex flex-wrap gap-1 mt-1">
        <span
          v-for="recipe in recipes"
          :key="recipe"
          class="badge badge-xs badge-ghost text-base-content/50"
        >{{ recipe }}</span>
      </div>
    </div>
    <span class="text-sm font-mono text-base-content/60 shrink-0">
      {{ amount % 1 === 0 ? amount : amount.toFixed(1) }}&nbsp;{{ unit }}
    </span>
  </li>
</template>
