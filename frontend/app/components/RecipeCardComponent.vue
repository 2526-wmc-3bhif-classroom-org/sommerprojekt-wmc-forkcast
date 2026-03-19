<script setup lang="ts">
const props = defineProps(["image", "title", "id", "popular", "rating"]);
</script>

<template>
  <div class="card bg-base-100 w-96 max-h-full shadow-sm">
    <figure>
      <!-- Do not use nuxt-image here as the image will come from external -->
      <img :src="image" :alt="`Image for: ${props.title}`" class="object-cover h-60 w-full"/>
    </figure>
    <div class="card-body text-left">
      <span v-if="props.popular" class="badge badge-xs badge-warning">
        <i class="fa-solid fa-fire"/>
        <span>Popular</span>
      </span>
      <div class="flex justify-between">
        <h2 class="text-2xl font-bold">{{title}}</h2>
      </div>

      <div class="rating rating-sm">
        <div type="radio" class="mask mask-star-2 bg-orange-400" aria-label="1 star" :aria-current="rating == 1" />
        <div type="radio" class="mask mask-star-2 bg-orange-400" aria-label="2 star" :aria-current="rating == 2" />
        <div type="radio" class="mask mask-star-2 bg-orange-400" aria-label="3 star" :aria-current="rating == 3" />
        <div type="radio" class="mask mask-star-2 bg-orange-400" aria-label="4 star" :aria-current="rating == 4" />
        <div type="radio" class="mask mask-star-2 bg-orange-400" aria-label="5 star" :aria-current="rating == 5" />
      </div>

      <div>
        <span class="text-orange-400 font-bold">15</span>
        <span class="">Ratings</span>
      </div>

      <ul class="mt-2 flex flex-col gap-2 text-xs">
        <li>
          <i class="fa-solid fa-fire mr-1"/>
          <span>600 Calories</span>
        </li>
        <li>
          <i class="fa-solid fa-clock mr-1"/>
          <span>30 mins</span>
        </li>
        <li>
          <i class="fa-solid fa-utensils mr-1"/>
          <span>5 Ingredients</span>
        </li>
        <li>
          <i class="fa-solid fa-users mr-1"/>
          <span>Serves 4</span>
        </li>
      </ul>

      <div class="mt-auto">
        <nuxt-link-locale :to="`/cook/${id}`" class="btn btn-primary btn-block mt-3">
          <i class="fa-solid fa-utensils"/>
          <span>Open in Cooking View</span>
        </nuxt-link-locale>
      </div>
    </div>
  </div>
</template>