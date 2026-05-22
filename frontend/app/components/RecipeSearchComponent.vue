<script setup lang="ts">
import useRecipeService from "~/assets/service/recipe-service";
import type { RecipePreview } from "~/assets/model/recipe-preview";

const emit = defineEmits<{ results: [recipes: RecipePreview[]] }>();

const minCalories = ref({ value: 0, enabled: false });
const maxCalories = ref({ value: 1000, enabled: false });
const minTime = ref({ value: 0, enabled: false });
const maxTime = ref({ value: 120, enabled: false });
const minIngredients = ref({ value: 0, enabled: false });
const maxIngredients = ref({ value: 20, enabled: false });
const minServings = ref({ value: 0, enabled: false });
const maxServings = ref({ value: 20, enabled: false });
const minRating = ref({ value: 0, enabled: false });
const maxRating = ref({ value: 5, enabled: false });
const isVegetarian = ref(false);
const isVegan = ref(false);
const isGlutenFree = ref(false);

const query = ref('');
const recipeService = useRecipeService();
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function onInput() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    if (!query.value.trim()) {
      emit('results', []);
      return;
    }
    const res = await recipeService.search(query.value.trim());
    if (res.ok && res.value) emit('results', res.value);
  }, 400);
}
</script>

<template>
  <div class="join">
    <label class="input join-item w-full">
      <i class="fa-solid fa-magnifying-glass"/>
      <input type="search" v-model="query" placeholder="Search" @input="onInput" />
    </label>
    <div class="dropdown dropdown-end join-item">
      <div tabindex="0" role="button" class="select join-item w-30">
        <span>Filter</span>
      </div>
      <div tabindex="0" class="dropdown-content card card-sm bg-base-100 z-1 mt-2 w-96 shadow-2xl border border-base-300">
        <div class="card-body h-full w-full px-4 py-4">
          <div class="w-full overflow-y-auto max-h-96 space-y-5 pr-1">

            <!-- Calories -->
            <div>
              <p class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-base-content/50 mb-2">
                <i class="fa-solid fa-fire-flame-curved text-primary"/>
                Calories
              </p>
              <div class="space-y-1.5">
                <recipe-filter-component label="Min" :min="0" :max="1000" v-model="minCalories"/>
                <recipe-filter-component label="Max" :min="0" :max="1000" v-model="maxCalories"/>
              </div>
            </div>

            <!-- Time -->
            <div>
              <p class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-base-content/50 mb-2">
                <i class="fa-solid fa-clock text-primary"/>
                Time (minutes)
              </p>
              <div class="space-y-1.5">
                <recipe-filter-component label="Min" :min="0" :max="120" v-model="minTime"/>
                <recipe-filter-component label="Max" :min="0" :max="120" v-model="maxTime"/>
              </div>
            </div>

            <!-- Ingredients -->
            <div>
              <p class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-base-content/50 mb-2">
                <i class="fa-solid fa-utensils text-primary"/>
                Ingredients
              </p>
              <div class="space-y-1.5">
                <recipe-filter-component label="Min" :min="0" :max="20" v-model="minIngredients"/>
                <recipe-filter-component label="Max" :min="0" :max="20" v-model="maxIngredients"/>
              </div>
            </div>

            <!-- Servings -->
            <div>
              <p class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-base-content/50 mb-2">
                <i class="fa-solid fa-users text-primary"/>
                Servings
              </p>
              <div class="space-y-1.5">
                <recipe-filter-component label="Min" :min="0" :max="20" v-model="minServings"/>
                <recipe-filter-component label="Max" :min="0" :max="20" v-model="maxServings"/>
              </div>
            </div>

            <!-- Rating -->
            <div>
              <p class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-base-content/50 mb-2">
                <i class="fa-solid fa-star text-primary"/>
                Rating
              </p>
              <div class="space-y-1.5">
                <recipe-filter-component label="Min" :min="0" :max="5" v-model="minRating"/>
                <recipe-filter-component label="Max" :min="0" :max="5" v-model="maxRating"/>
              </div>
            </div>

            <!-- Dietary -->
            <div>
              <p class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-base-content/50 mb-2">
                <i class="fa-solid fa-leaf text-primary"/>
                Dietary
              </p>
              <div class="flex flex-wrap gap-2">
                <label class="flex items-center gap-2 rounded-full border border-base-300 bg-base-200 px-3 py-1.5 text-sm cursor-pointer has-[:checked]:border-success has-[:checked]:bg-success/10 has-[:checked]:text-success transition-colors">
                  <input type="checkbox" class="checkbox checkbox-xs checkbox-success" v-model="isVegetarian"/>
                  Vegetarian
                </label>
                <label class="flex items-center gap-2 rounded-full border border-base-300 bg-base-200 px-3 py-1.5 text-sm cursor-pointer has-[:checked]:border-success has-[:checked]:bg-success/10 has-[:checked]:text-success transition-colors">
                  <input type="checkbox" class="checkbox checkbox-xs checkbox-success" v-model="isVegan"/>
                  Vegan
                </label>
                <label class="flex items-center gap-2 rounded-full border border-base-300 bg-base-200 px-3 py-1.5 text-sm cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:checked]:text-primary transition-colors">
                  <input type="checkbox" class="checkbox checkbox-xs checkbox-primary" v-model="isGlutenFree"/>
                  Gluten Free
                </label>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>