<script setup lang="ts">
import type {RecipePreview} from "~/assets/model/recipe-preview";
import {useFavoritesStore} from "~/assets/store/favorites-store";

const props = defineProps(["data"]);
const data = computed(() => props.data as RecipePreview);

const infoModal = ref();
const favStore = useFavoritesStore();
onMounted(() => favStore.load());
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
  <div v-if="data" class="card bg-base-100 w-[calc(100vw-3rem)] sm:w-96 max-h-full shadow-sm">
    <figure class="relative">
      <img :src="data.image" :alt="`Image for: ${data.title}`" class="object-cover h-60 w-full" loading="lazy"/>
      <button @click="favStore.toggle(data.id)" class="btn btn-circle btn-sm absolute top-2 right-2 bg-base-100/70 hover:bg-base-100 border-0 backdrop-blur-sm">
        <i :class="['fa-heart text-lg', isFav ? 'fa-solid text-error' : 'fa-regular text-base-content/50']" />
      </button>
      <button @click.stop="infoModal?.open()" class="btn btn-circle btn-sm absolute top-11 right-2 bg-base-100/70 hover:bg-base-100 border-0 backdrop-blur-sm">
        <i class="fa-solid fa-circle-info text-base-content/50 text-lg"/>
      </button>
    </figure>
    <RecipeInfoModalComponent ref="infoModal" :data="data" />
    <div class="card-body text-left">
      <div class="flex items-start gap-2">
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap gap-1 mb-1">
            <!-- We cannot use concatenation here, because tailwind does not detect it and does not generate the required classes -->
            <span v-for="tag in data.tags" :class="`badge badge-xs ${tag.color == 'primary' ? 'badge-primary' : tag.color == 'error' ? 'badge-error' : tag.color == 'success' ? 'badge-success' : tag.color == 'warning' ? 'badge-warning' : 'badge-neutral'}`" class="inline-flex items-center gap-1">
              <i :class="`fa-solid fa-${tag.icon}`"/>
              <span>{{tag.text}}</span>
            </span>
          </div>
          <h2 class="text-2xl font-bold leading-tight">
            {{data.title}}
          </h2>
        </div>
        <div :class="`tooltip shrink-0 ${tooltipColor}`">
          <div class="tooltip-content">
            <span class="font-semibold">{{data.effort}} - {{legend}}</span>
          </div>
          <div :class="`radial-progress radial-progress-sm text-primary-content ${color} text-xs border-2`"
               :style="`--value:${data.effort}; --size: 2.6rem`" :aria-valuenow="data.effort" role="progressbar">
            <span class="font-bold">{{data.effort}}</span>
          </div>
        </div>
      </div>

      <div class="inline-flex gap-2">
        <div class="rating rating-sm">
          <div type="radio" class="mask mask-star-2 bg-orange-400" aria-label="1 star" :aria-current="data.rating.rating == 1" />
          <div type="radio" class="mask mask-star-2 bg-orange-400" aria-label="2 star" :aria-current="data.rating.rating == 2" />
          <div type="radio" class="mask mask-star-2 bg-orange-400" aria-label="3 star" :aria-current="data.rating.rating == 3" />
          <div type="radio" class="mask mask-star-2 bg-orange-400" aria-label="4 star" :aria-current="data.rating.rating == 4" />
          <div type="radio" class="mask mask-star-2 bg-orange-400" aria-label="5 star" :aria-current="data.rating.rating == 5" />
        </div>
        <div>
          <span class="text-orange-300 font-bold bg-transparent">({{data.rating.count}})</span>
        </div>
      </div>

      <ul class="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <li v-for="attribute in data.attributes" :key="attribute.icon" class="inline-flex items-center gap-1">
          <i :class="`fa-solid fa-${attribute.icon} mr-1`"/>
          <span>{{attribute.text}}</span>
        </li>
      </ul>

      <div class="mt-auto flex gap-2">
        <nuxt-link-locale :to="`/dashboard/cook/${data.id}`" class="btn btn-primary flex-1 mt-3">
          <i class="fa-solid fa-utensils"/>
          <span>{{$t("component.recipe.card.open")}}</span>
        </nuxt-link-locale>
      </div>
    </div>
  </div>
</template>