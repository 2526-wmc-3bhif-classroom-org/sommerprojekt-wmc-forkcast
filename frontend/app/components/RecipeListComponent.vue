<script setup lang="ts">
import type {RecipePreview} from "~/assets/model/recipe-preview";
import {useFavoritesStore} from "~/assets/store/favorites-store";

const props = defineProps(["data"]);
const data = computed(() => props.data as RecipePreview);

const infoModal = ref();
const shareModal = ref();
const favStore = useFavoritesStore();
onMounted(() => {
  if (data.value?.isFavorited !== undefined) favStore.seedFromPayload(data.value.id, data.value.isFavorited);
});
const isFav = computed(() => data.value ? favStore.has(data.value.id) : false);

const effortColors = {
  low: "bg-success border-success",
  medium: "bg-warning border-warning",
  high: "bg-error border-error",
}

const effortTooltipColors = {
  low: "tooltip-success",
  medium: "tooltip-warning",
  high: "tooltip-error",
}

const effortLegend = {
  low: $t("component.recipe.low_effort"),
  medium: $t("component.recipe.medium_effort"),
  high: $t("component.recipe.high_effort"),
}

const color = computed(() => {
  const e = data.value?.effort ?? 100;
  if (e <= 30) return effortColors.low;
  if (e <= 60) return effortColors.medium;
  return effortColors.high;
});

const tooltipColor = computed(() => {
  const e = data.value?.effort ?? 100;
  if (e <= 30) return effortTooltipColors.low;
  if (e <= 60) return effortTooltipColors.medium;
  return effortTooltipColors.high;
});

const legend = computed(() => {
  const e = data.value?.effort ?? 100;
  if (e <= 30) return effortLegend.low;
  if (e <= 60) return effortLegend.medium;
  return effortLegend.high;
});
</script>

<template>
  <li v-if="data" class="list-row bg-base-200">
    <div class="shrink-0">
      <img :src="data.image" :alt="`Image for: ${data.title}`" class="object-cover rounded-box size-20 sm:size-33" loading="lazy"/>
    </div>
    <div class="text-left flex flex-col space-y-2 min-w-0">
      <div class="text-left text-base sm:text-xl font-bold truncate">{{data.title}}</div>
      <div class="flex flex-wrap gap-1">
        <!-- We cannot use concatenation here, because tailwind does not detect it and does not generate the required classes -->
        <span v-for="tag in data.tags || []" :class="`badge badge-xs ${tag.color == 'primary' ? 'badge-primary' : tag.color == 'error' ? 'badge-error' : tag.color == 'success' ? 'badge-success' : tag.color == 'warning' ? 'badge-warning' : 'badge-neutral'}`" class="inline-flex items-center gap-1">
          <i :class="`fa-solid fa-${tag.icon}`"/>
          <span>{{tag.text}}</span>
        </span>
      </div>

      <div v-if="data.rating" class="inline-flex gap-2">
        <div class="rating rating-xs my-auto">
          <div type="radio" class="mask mask-star-2 bg-orange-400" aria-label="1 star" :aria-current="data.rating.rating == 1" />
          <div type="radio" class="mask mask-star-2 bg-orange-400" aria-label="2 star" :aria-current="data.rating.rating == 2" />
          <div type="radio" class="mask mask-star-2 bg-orange-400" aria-label="3 star" :aria-current="data.rating.rating == 3" />
          <div type="radio" class="mask mask-star-2 bg-orange-400" aria-label="4 star" :aria-current="data.rating.rating == 4" />
          <div type="radio" class="mask mask-star-2 bg-orange-400" aria-label="5 star" :aria-current="data.rating.rating == 5" />
        </div>
        <div>
          <span class="text-orange-300 font-bold bg-transparent text-xs">({{data.rating.count}})</span>
        </div>
      </div>

      <ul class="grid grid-cols-2 gap-x-2 gap-y-1 text-[0.7rem]">
        <li v-for="attribute in data.attributes || []" :key="attribute.icon" class="inline-flex items-center gap-1 min-w-0">
          <i :class="`fa-solid fa-${attribute.icon} mr-1 shrink-0`"/>
          <span class="truncate">{{attribute.text}}</span>
        </li>
      </ul>
    </div>

    <div class="flex flex-col items-center gap-2">
      <div :class="`tooltip ${tooltipColor} tooltip-left`">
        <div class="tooltip-content">
          <span class="font-semibold">{{data.effort}} - {{legend}}</span>
        </div>
        <div :class="`radial-progress text-primary-content ${color} text-xs border-2`"
             :style="`--value:${data.effort}; --size: 2rem`" :aria-valuenow="data.effort" role="progressbar">
          <span class="font-bold text-[0.7rem]">{{data.effort}}</span>
        </div>
      </div>
      <button @click.stop="favStore.toggle(data.id)" class="btn btn-ghost btn-sm btn-circle">
        <i :class="['fa-heart text-lg', isFav ? 'fa-solid text-error' : 'fa-regular text-base-content/30']" />
      </button>
      <div class="dropdown dropdown-end">
        <button tabindex="0" @click.stop class="btn btn-ghost btn-sm btn-circle">
          <i class="fa-solid fa-ellipsis-vertical text-base-content/30 text-lg"/>
        </button>
        <ul tabindex="0" class="dropdown-content menu menu-sm bg-base-200 rounded-box z-10 w-40 p-2 shadow">
          <li><button @click.stop="infoModal?.open()"><i class="fa-solid fa-circle-info"/>{{ $t('component.recipe.menu.details') }}</button></li>
          <li><button @click.stop="shareModal?.open()"><i class="fa-solid fa-share-nodes"/>{{ $t('component.recipe.menu.share') }}</button></li>
        </ul>
      </div>
    </div>
    <RecipeInfoModalComponent ref="infoModal" :data="data" />
    <RecipeShareModalComponent ref="shareModal" :data="data" />
  </li>
</template>

<style scoped>

</style>