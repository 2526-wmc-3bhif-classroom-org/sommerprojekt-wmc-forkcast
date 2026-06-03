<script setup lang="ts">
import type { RecipePreview, RecipeIngredient } from '~/assets/model/recipe-preview';

const props = defineProps<{ data: RecipePreview }>();
const dialog = ref<HTMLDialogElement>();
const useMetric = ref(true);

function open() {
  dialog.value?.showModal();
}

function measure(ing: RecipeIngredient) {
  if (useMetric.value) {
    return { amount: ing.measures?.metric?.amount ?? ing.amount, unit: ing.measures?.metric?.unitShort ?? ing.unit };
  }
  return { amount: ing.measures?.us?.amount ?? ing.amount, unit: ing.measures?.us?.unitShort ?? ing.unit };
}

defineExpose({ open });
</script>

<template>
  <dialog ref="dialog" class="modal">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
      <h3 class="font-bold text-lg mb-4">{{ data.title }}</h3>

      <div v-if="data.ingredients && data.ingredients.length > 0">
        <div class="flex items-center justify-between mb-2">
          <h4 class="font-semibold">{{ $t('component.recipe.info.ingredients') }}</h4>
          <div class="join">
            <button :class="['join-item btn btn-xs', useMetric ? 'btn-primary' : 'bg-base-300']" @click="useMetric = true">ml / g</button>
            <button :class="['join-item btn btn-xs', !useMetric ? 'btn-primary' : 'bg-base-300']" @click="useMetric = false">cup / oz</button>
          </div>
        </div>
        <ul class="space-y-1 text-sm">
          <li v-for="ing in data.ingredients" :key="ing.name" class="flex gap-3">
            <span class="text-base-content/90 shrink-0 w-24 text-right">
              {{ measure(ing).amount }}
              {{ measure(ing).unit }}
            </span>
            <span>{{ ing.name }}</span>
          </li>
        </ul>
      </div>
      <p v-else class="text-sm text-base-content/50">{{ $t('component.recipe.info.no_ingredients') }}</p>

      <div v-if="data.sourceUrl || data.sourceName" class="mt-4 pt-4 border-t border-base-300">
        <h4 class="font-semibold mb-1">{{ $t('component.recipe.source') }}</h4>
        <a v-if="data.sourceUrl" :href="data.sourceUrl" target="_blank" rel="noopener noreferrer" class="link link-primary text-sm">
          {{ data.sourceName || data.sourceUrl }}
        </a>
        <span v-else class="text-sm">{{ data.sourceName }}</span>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>
