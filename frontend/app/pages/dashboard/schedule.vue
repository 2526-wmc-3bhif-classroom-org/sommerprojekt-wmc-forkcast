<script setup lang="ts">
import draggable from 'vuedraggable';

definePageMeta({
  showFooter: false
})

const data1 = {
  title: "Spaghetti Carbonara",
  image: "https://spoonacular.com/recipeImages/716429-312x231.jpg",
  rating: {
    rating: 4,
    count: 63,
  },
  effort: 31,
  attributes: [
    { icon: "fire", text: "602 Calories" },
    { icon: "clock", text: "31 mins" },
    { icon: "utensils", text: "6 Ingredients" },
    { icon: "users", text: "Serves 4" }
  ],
  tags: [
    { icon: "star", text: "Popular", color: "warning" },
    { icon: "leaf", text: "Vegetarian", color: "success" }
  ]
};
const data2 = {
  title: "Chicken Alfredo",
  image: "https://spoonacular.com/recipeImages/715538-312x231.jpg",
  rating: {
    rating: 2,
    count: 147,
  },
  effort: 67,
  attributes: [
    { icon: "fire", text: "850 Calories" },
    { icon: "clock", text: "45 mins" },
    { icon: "utensils", text: "8 Ingredients" },
    { icon: "users", text: "Serves 2" }
  ],
  tags: [
    { icon: "pepper-hot", text: "Spicy", color: "error" },
    { icon: "leaf", text: "Vegetarian", color: "success" },
    { icon: "bowl-food", text: "Gluten Free", color: "primary" }
  ]
};
const data3 = {
  title: "Vegetable Stir Fry",
  image: "https://spoonacular.com/recipeImages/716408-312x231.jpg",
  rating: {
    rating: 5,
    count: 89,
  },
  effort: 25,
  attributes: [
    { icon: "fire", text: "400 Calories" },
    { icon: "clock", text: "25 mins" },
    { icon: "utensils", text: "10 Ingredients" },
    { icon: "users", text: "Serves 3" }
  ],
  tags: [
    { icon: "leaf", text: "Vegan", color: "success" },
    { icon: "pepper-hot", text: "Spicy", color: "error" }
  ]
};

let sourceItemCounter = 0;

function createSourceRecipe(recipe: Record<string, unknown>) {
  return {
    ...recipe,
    __sourceItemId: `source-recipe-${sourceItemCounter++}`
  };
}

function cloneRecipeForDrop(recipe: Record<string, unknown>) {
  return {
    ...recipe,
    __dropItemId: `day-recipe-clone-${sourceItemCounter++}`
  };
}

const datas = ref([
  createSourceRecipe(data1),
  createSourceRecipe(data2),
  createSourceRecipe(data3),
  createSourceRecipe(data2),
  createSourceRecipe(data3),
  createSourceRecipe(data2),
  createSourceRecipe(data3),
  createSourceRecipe(data2),
  createSourceRecipe(data3)
]);

const holder = ref([]);

function onMainListAdd(evt: any) {
  if (evt.from !== evt.to && evt.from.dataset.zone === 'holder') {
    datas.value.splice(evt.newIndex, 1);
  }
}

let dragGhostEl: HTMLElement | null = null;

function onMainListDragStart(evt: any) {
  const recipe = datas.value[evt.oldIndex];
  if (!recipe || !evt.originalEvent?.dataTransfer) return;

  // Resolve actual computed theme colors from document root.
  const style = getComputedStyle(document.documentElement);
  const bg = style.getPropertyValue('--color-base-200').trim() || '#1f2937';
  const border = style.getPropertyValue('--color-base-300').trim() || '#374151';
  const color = style.getPropertyValue('--color-base-content').trim() || '#ffffff';

  dragGhostEl = document.createElement('div');
  // Must be in the visible paint area when browser snapshots it — position off-left via transform.
  dragGhostEl.style.cssText =
    `position:fixed;top:0;left:0;transform:translate(-9999px,-9999px);` +
    `display:flex;align-items:center;gap:8px;` +
    `background:${bg};border:1px solid ${border};` +
    `border-radius:10px;padding:6px 10px;color:${color};` +
    `font-size:12px;font-weight:500;width:200px;white-space:nowrap;overflow:hidden;`;

  const img = document.createElement('img');
  img.src = recipe.image as string;
  img.style.cssText = 'width:24px;height:24px;border-radius:4px;object-fit:cover;flex-shrink:0;';
  dragGhostEl.appendChild(img);

  const label = document.createElement('span');
  label.textContent = recipe.title as string;
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
        <recipe-search-component class="m-3 w-[stretch]"/>

        <draggable
            v-model="datas"
            :animation="300"
            :clone="cloneRecipeForDrop"
            :sort="false"
            :group="{ name: 'items', pull: 'clone', put: false }"
            tag="ul"
            item-key="__sourceItemId"
            class="list overflow-y-scroll h-[calc(100vh-8rem)]"
            ghost-class="hidden"
            @add="onMainListAdd"
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
      </div>
    </div>
    <schedule-calendar-component />
    <!--div class="col-span-1">
      <draggable
        v-model="holder"
        :animation="300"
        :group="{ name: 'items', put: true }"
        tag="ul"
        item-key="id"
        ghost-class="opacity-25"
        class="list bg-base-100 h-full w-full rounded-tl-2xl"
        :data-zone="'holder'"
      >
        <template #item="{ element: data }">
          <recipe-list-component :data="data"/>
        </template>
      </draggable>
    </div-->
  </div>
</template>

