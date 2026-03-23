<script setup lang="ts">
import RecipeListComponent from "~/components/RecipeListComponent.vue";
import draggable from 'vuedraggable';

const data1 = {
  title: "Spaghetti Carbonara",
  image: "https://spoonacular.com/recipeImages/716429-312x231.jpg",
  rating: {
    rating: 4,
    count: 63,
  },
  effort: 31,
  attributes: [
    {
      icon: "fire",
      text: "602 Calories"
    },
    {
      icon: "clock",
      text: "31 mins"
    },
    {
      icon: "utensils",
      text: "6 Ingredients"
    },
    {
      icon: "users",
      text: "Serves 4"
    }
  ],
  tags: [
    {
      icon: "star",
      text: "Popular",
      color: "warning"
    },
    {
      icon: "leaf",
      text: "Vegetarian",
      color: "success"
    }
  ]
}
const data2 = {
  title: "Chicken Alfredo",
  image: "https://spoonacular.com/recipeImages/715538-312x231.jpg",
  rating: {
    rating: 2,
    count: 147,
  },
  effort: 67,
  attributes: [
    {
      icon: "fire",
      text: "850 Calories"
    },
    {
      icon: "clock",
      text: "45 mins"
    },
    {
      icon: "utensils",
      text: "8 Ingredients"
    },
    {
      icon: "users",
      text: "Serves 2"
    }
  ],
  tags: [
    {
      icon: "pepper-hot",
      text: "Spicy",
      color: "error"
    },
    {
      icon: "leaf",
      text: "Vegetarian",
      color: "success"
    },
    {
      icon: "bowl-food",
      text: "Gluten Free",
      color: "primary"
    }
  ]
}

const datas = ref([
  data1, data2
]);

const holder = ref([]);

const trash = ref([]); // Always keep this empty

const handleRemove = () => {
  // When an item is added to this list, immediately clear it
  trash.value = [];
};
</script>

<template>
  <div class="hero min-h-screen">
    <div class="hero-content text-center flex flex-col gap-10">
      <h1 class="text-5xl font-bold">What shall we cook today?</h1>
      <draggable v-model="trash" :animation="300"
                 :group="{ name: 'items', put: true }"
                 tag="ul"
                 class="list bg-base-100 min-h-100 min-w-100"
                 ghost-class="hidden"
                 @add="handleRemove"
      >
        <template #item="{ element: data }">
          <recipe-list-component :data="data"/>
        </template>
      </draggable>
      <draggable v-model="datas" :animation="300"
                 :sort="false"
                 :group="{ name: 'items', pull: 'clone', put: false }"
                 tag="ul"
                 class="list bg-base-100 min-h-100 min-w-100"
      >
        <template #item="{ element: data }">
          <recipe-list-component :data="data"/>
        </template>
      </draggable>
      <p>ABC</p>
      <draggable v-model="holder" :animation="300"
                 :group="{ name: 'items', put: true }"
                 tag="ul"
                 ghost-class="opacity-25"
                 class="list bg-base-100 min-h-100 min-w-100"
      >
        <template #item="{ element: data }">
          <recipe-list-component :data="data"/>
        </template>
      </draggable>

      <!--div class="inline-flex space-x-20">
        <recipe-card-component
            :data="data1"
        />
        <div class="divider divider-horizontal">OR</div>
        <recipe-card-component
            :data="data2"
        />
      </div-->
    </div>
  </div>
</template>