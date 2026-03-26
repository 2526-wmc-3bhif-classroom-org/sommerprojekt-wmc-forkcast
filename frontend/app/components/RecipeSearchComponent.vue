<script setup lang="ts">
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
</script>

<template>
  <div class="join">
    <label class="input join-item w-full">
      <i class="fa-solid fa-magnifying-glass"/>
      <input type="search" required placeholder="Search" />
    </label>
    <div class="dropdown dropdown-end join-item">
      <div tabindex="0" role="button" class="select join-item w-30">
        <span>Filter</span>
      </div>
      <div tabindex="0" class="dropdown-content card card-sm bg-base-200 z-1 mt-2 w-120 h-120 shadow-2xl">
        <div class="card-body h-full w-full">
          <div class="w-full space-y-2 overflow-y-scroll h-full p-2">
            <recipe-filter-component
              label="Min Calories"
              :min="0"
              :max="1000"
              v-model="minCalories"
            />
            <recipe-filter-component
              label="Max Calories"
              :min="0"
              :max="1000"
              v-model="maxCalories"
            />
            <recipe-filter-component
              label="Min Time (m)"
              :min="0"
              :max="120"
              v-model="minTime"
            />
            <recipe-filter-component
              label="Max Time (m)"
              :min="0"
              :max="120"
              v-model="maxTime"
            />
            <recipe-filter-component
              label="Min Ingredients"
              :min="0"
              :max="20"
              v-model="minIngredients"
            />
            <recipe-filter-component
              label="Max Ingredients"
              :min="0"
              :max="20"
              v-model="maxIngredients"
            />
            <recipe-filter-component
              label="Min Servings"
              :min="0"
              :max="20"
              v-model="minServings"
            />
            <recipe-filter-component
              label="Max Servings"
              :min="0"
              :max="20"
              v-model="maxServings"
            />
            <recipe-filter-component
              label="Min Rating"
              :min="0"
              :max="5"
              v-model="minRating"
            />
            <recipe-filter-component
              label="Max Rating"
              :min="0"
              :max="5"
              v-model="maxRating"
            />
            <label class="flex items-center space-x-2">
              <input type="checkbox" class="checkbox" v-model="isVegetarian" />
              <span>Vegetarian</span>
            </label>
            <label class="flex items-center space-x-2">
              <input type="checkbox" class="checkbox" v-model="isVegan" />
              <span>Vegan</span>
            </label>
            <label class="flex items-center space-x-2">
              <input type="checkbox" class="checkbox" v-model="isGlutenFree" />
              <span>Gluten Free</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>