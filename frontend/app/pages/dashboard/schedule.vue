<script setup lang="ts">
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
const data3 = {
  title: "Vegetable Stir Fry",
  image: "https://spoonacular.com/recipeImages/716408-312x231.jpg",
  rating: {
    rating: 5,
    count: 89,
  },
  effort: 25,
  attributes: [
    {
      icon: "fire",
      text: "400 Calories"
    },
    {
      icon: "clock",
      text: "25 mins"
    },
    {
      icon: "utensils",
      text: "10 Ingredients"
    },
    {
      icon: "users",
      text: "Serves 3"
    }
  ],
  tags: [
    {
      icon: "leaf",
      text: "Vegan",
      color: "success"
    },
    {
      icon: "pepper-hot",
      text: "Spicy",
      color: "error"
    }
  ]
}

const datas = ref([
  data1, data2, data3, data1, data2, data3, data1, data2, data3, data1, data2, data3, data1, data2, data3, data1, data2, data3,
]);

const holder = ref([]);

const trash = ref([]);

const handleRemove = () => {
  trash.value = [];
};
</script>

<template>
  <div class="grid grid-rows-[4rem_1fr] grid-cols-[32.5rem_1fr] row-end-auto w-screen h-screen">
    <div class="col-span-2"></div>
    <div class="w-120 bg-base-100 overflow-y-scroll">
      <draggable v-model="datas" :animation="300"
                 :sort="false"
                 :group="{ name: 'items', pull: 'clone', put: false }"
                 tag="ul"
                 item-key="id"
                 class="list"
      >
        <template #item="{ element: data }">
          <recipe-list-component :data="data"/>
        </template>
      </draggable>
    </div>
    <div class="col-span-1">
      <draggable v-model="holder" :animation="300"
                 :group="{ name: 'items', put: true }"
                 tag="ul"
                 item-key="id"
                 ghost-class="opacity-25"
                 class="list bg-base-100 min-h-100 min-w-100"
      >
        <template #item="{ element: data }">
          <recipe-list-component :data="data"/>
        </template>
      </draggable>
    </div>
  </div>

  <!--<draggable v-model="trash" :animation="300"
             :group="{ name: 'items', put: true }"
             tag="ul"
             class="list bg-base-100 min-h-100 min-w-100"
             ghost-class="hidden"
             @add="handleRemove"
  >
    <template #item="{ element: data }">
      <recipe-list-component :data="data"/>
    </template>
  </draggable-->

</template>

