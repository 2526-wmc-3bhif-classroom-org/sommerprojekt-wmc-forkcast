<script setup lang="ts">
import draggable from 'vuedraggable';
import type { RecipePreview } from '~/assets/model/recipe-preview';

definePageMeta({
  showFooter: false,
  ssr: false
})

const searchRef = ref<{ loadMore: () => void } | null>(null);
const listContainerRef = ref<HTMLElement | null>(null);
const sentinelRef = ref<HTMLElement | null>(null);

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => { if (entries[0].isIntersecting) searchRef.value?.loadMore(); },
    { root: listContainerRef.value, threshold: 0 }
  );
  if (sentinelRef.value) observer.observe(sentinelRef.value);
  onUnmounted(() => observer.disconnect());
});

let sourceItemCounter = 0;

function cloneRecipeForDrop(recipe: Record<string, unknown>) {
  return {
    ...recipe,
    __dropItemId: `day-recipe-clone-${sourceItemCounter++}`
  };
}

const datas = ref<(RecipePreview & { __sourceItemId: string })[]>([]);

function onSearchResults(results: RecipePreview[]) {
  datas.value = results.map(r => ({
    ...r,
    __sourceItemId: `source-recipe-${r.id}`
  }));
}

let dragGhostEl: HTMLElement | null = null;

function onMainListDragStart(evt: any) {
  const recipe = datas.value[evt.oldIndex];
  if (!recipe || !evt.originalEvent?.dataTransfer) return;

  const style = getComputedStyle(document.documentElement);
  const bg = style.getPropertyValue('--color-base-200').trim() || '#1f2937';
  const border = style.getPropertyValue('--color-base-300').trim() || '#374151';
  const color = style.getPropertyValue('--color-base-content').trim() || '#ffffff';

  dragGhostEl = document.createElement('div');
  dragGhostEl.style.cssText =
    `position:fixed;top:0;left:0;transform:translate(-9999px,-9999px);` +
    `display:flex;align-items:center;gap:8px;` +
    `background:${bg};border:1px solid ${border};` +
    `border-radius:10px;padding:6px 10px;color:${color};` +
    `font-size:12px;font-weight:500;width:200px;white-space:nowrap;overflow:hidden;`;

  const img = document.createElement('img');
  img.src = recipe.image;
  img.style.cssText = 'width:24px;height:24px;border-radius:4px;object-fit:cover;flex-shrink:0;';
  dragGhostEl.appendChild(img);

  const label = document.createElement('span');
  label.textContent = recipe.title;
  label.style.cssText = 'overflow:hidden;text-overflow:ellipsis;flex:1;';
  dragGhostEl.appendChild(label);

  document.body.appendChild(dragGhostEl);
  evt.originalEvent.dataTransfer.setDragImage(dragGhostEl, 16, 16);
}

function onMainListDragEnd() {
  dragGhostEl?.remove();
  dragGhostEl = null;
}
</script>

<template>
  <div class="grid grid-rows-[4rem_1fr] grid-cols-[32.5rem_1fr] row-end-auto w-screen h-screen">
    <div class="col-span-2"></div>
    <div class="w-125 bg-base-100 rounded-tr-2xl col-span-1">
      <div>
        <recipe-search-component ref="searchRef" class="m-3 w-[stretch]" @results="onSearchResults"/>

        <div ref="listContainerRef" class="overflow-y-scroll h-[calc(100vh-8rem)]">
          <draggable
              v-model="datas"
              :animation="300"
              :clone="cloneRecipeForDrop"
              :sort="false"
              :group="{ name: 'items', pull: 'clone', put: false }"
              tag="ul"
              item-key="__sourceItemId"
              class="list"
              ghost-class="hidden"
              @start="onMainListDragStart"
              @end="onMainListDragEnd"
              :data-zone="'main'"
          >
            <template #item="{ element: data }">
              <div class="cursor-grab active:cursor-grabbing touch-none">
                <recipe-list-component :data="data"/>
              </div>
            </template>
          </draggable>
          <div ref="sentinelRef" class="h-1"/>
        </div>
      </div>
    </div>
    <schedule-calendar-component />
  </div>
</template>
