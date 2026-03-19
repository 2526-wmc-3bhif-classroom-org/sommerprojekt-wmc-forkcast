<script setup lang="ts">
import type {RecipePreview} from "~/assets/model/recipe-preview";

const props = defineProps(["data"]);
const data = computed(() => props.data as RecipePreview);
</script>

<template>
  <div class="card bg-base-100 w-96 max-h-full shadow-sm">
    <figure>
      <!-- Do not use nuxt-image here as the image will come from external -->
      <img :src="data.image" :alt="`Image for: ${data.title}`" class="object-cover h-60 w-full"/>
    </figure>
    <div class="card-body text-left">
      <div class="inline-flex space-x-1">
        <span v-for="tag in data.tags" :class="`badge badge-xs badge-${tag.color}`">
          <i :class="`fa-solid fa-${tag.icon}`"/>
          <span>{{tag.text}}</span>
        </span>
      </div>
      <div class="flex justify-between">
        <h2 class="text-2xl font-bold">{{data.title}}</h2>
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

      <div class="mt-auto">
        <!--nuxt-link-locale :to="`/cook/${id}`" class="btn btn-primary btn-block mt-3"-->
        <nuxt-link-locale :to="`/`" class="btn btn-primary btn-block mt-3">
          <i class="fa-solid fa-utensils"/>
          <span>Open in Cooking View</span>
        </nuxt-link-locale>
      </div>
    </div>
  </div>
</template>