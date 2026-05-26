<script setup lang="ts">
// --- Types (Step 2: swap dummyRecipes with GET /api/users/me/calendar/shopping-list?from=&to=&units=metric) ---
type Ingredient = { name: string; amount: number; unit: string };

type PlannedRecipe = {
  id: number;
  name: string;
  image: string;
  date: Date;
  ingredients: Ingredient[];
};

type ShoppingItem = {
  name: string;
  amount: number;
  unit: string;
  recipes: string[];
  checked: boolean;
};

// --- Dummy data ---
const today = new Date();
today.setHours(0, 0, 0, 0);

const d = (n: number): Date => {
  const x = new Date(today);
  x.setDate(x.getDate() + n);
  return x;
};

const IMAGES: [string, string, string] = [
  'https://spoonacular.com/recipeImages/716429-312x231.jpg',
  'https://spoonacular.com/recipeImages/715538-312x231.jpg',
  'https://spoonacular.com/recipeImages/716408-312x231.jpg',
];

const allDummyRecipes: PlannedRecipe[] = [
  {
    id: 1, name: 'Spaghetti Carbonara', image: IMAGES[0], date: d(0),
    ingredients: [
      { name: 'Spaghetti', amount: 200, unit: 'g' },
      { name: 'Eggs', amount: 3, unit: 'pcs' },
      { name: 'Bacon', amount: 150, unit: 'g' },
      { name: 'Parmesan', amount: 80, unit: 'g' },
      { name: 'Garlic', amount: 2, unit: 'cloves' },
      { name: 'Black Pepper', amount: 5, unit: 'g' },
    ],
  },
  {
    id: 2, name: 'Chicken Alfredo', image: IMAGES[1], date: d(1),
    ingredients: [
      { name: 'Spaghetti', amount: 200, unit: 'g' },
      { name: 'Chicken Breast', amount: 400, unit: 'g' },
      { name: 'Heavy Cream', amount: 200, unit: 'ml' },
      { name: 'Parmesan', amount: 100, unit: 'g' },
      { name: 'Garlic', amount: 3, unit: 'cloves' },
      { name: 'Butter', amount: 50, unit: 'g' },
    ],
  },
  {
    id: 3, name: 'Vegetable Stir Fry', image: IMAGES[2], date: d(2),
    ingredients: [
      { name: 'Broccoli', amount: 300, unit: 'g' },
      { name: 'Carrots', amount: 150, unit: 'g' },
      { name: 'Bell Pepper', amount: 1, unit: 'pcs' },
      { name: 'Soy Sauce', amount: 60, unit: 'ml' },
      { name: 'Ginger', amount: 15, unit: 'g' },
      { name: 'Garlic', amount: 2, unit: 'cloves' },
      { name: 'Olive Oil', amount: 30, unit: 'ml' },
    ],
  },
  {
    id: 4, name: 'Greek Salad', image: IMAGES[0], date: d(3),
    ingredients: [
      { name: 'Tomatoes', amount: 300, unit: 'g' },
      { name: 'Cucumber', amount: 1, unit: 'pcs' },
      { name: 'Feta Cheese', amount: 150, unit: 'g' },
      { name: 'Olives', amount: 80, unit: 'g' },
      { name: 'Olive Oil', amount: 30, unit: 'ml' },
      { name: 'Lemon', amount: 1, unit: 'pcs' },
      { name: 'Red Onion', amount: 1, unit: 'pcs' },
    ],
  },
  {
    id: 5, name: 'Fluffy Pancakes', image: IMAGES[1], date: d(4),
    ingredients: [
      { name: 'Flour', amount: 200, unit: 'g' },
      { name: 'Eggs', amount: 2, unit: 'pcs' },
      { name: 'Milk', amount: 250, unit: 'ml' },
      { name: 'Butter', amount: 50, unit: 'g' },
      { name: 'Sugar', amount: 30, unit: 'g' },
      { name: 'Baking Powder', amount: 10, unit: 'g' },
    ],
  },
  {
    id: 6, name: 'Tomato Basil Soup', image: IMAGES[2], date: d(5),
    ingredients: [
      { name: 'Tomatoes', amount: 500, unit: 'g' },
      { name: 'Onion', amount: 1, unit: 'pcs' },
      { name: 'Garlic', amount: 3, unit: 'cloves' },
      { name: 'Heavy Cream', amount: 100, unit: 'ml' },
      { name: 'Basil', amount: 15, unit: 'g' },
      { name: 'Olive Oil', amount: 20, unit: 'ml' },
    ],
  },
  {
    id: 7, name: 'Beef Tacos', image: IMAGES[0], date: d(6),
    ingredients: [
      { name: 'Ground Beef', amount: 400, unit: 'g' },
      { name: 'Tortillas', amount: 8, unit: 'pcs' },
      { name: 'Tomatoes', amount: 200, unit: 'g' },
      { name: 'Cheddar Cheese', amount: 100, unit: 'g' },
      { name: 'Lettuce', amount: 100, unit: 'g' },
      { name: 'Lime', amount: 2, unit: 'pcs' },
      { name: 'Onion', amount: 1, unit: 'pcs' },
      { name: 'Sour Cream', amount: 100, unit: 'g' },
    ],
  },
  {
    id: 8, name: 'Mushroom Risotto', image: IMAGES[1], date: d(7),
    ingredients: [
      { name: 'Arborio Rice', amount: 300, unit: 'g' },
      { name: 'Mushrooms', amount: 250, unit: 'g' },
      { name: 'Onion', amount: 1, unit: 'pcs' },
      { name: 'Garlic', amount: 2, unit: 'cloves' },
      { name: 'Parmesan', amount: 80, unit: 'g' },
      { name: 'Butter', amount: 50, unit: 'g' },
      { name: 'White Wine', amount: 100, unit: 'ml' },
    ],
  },
  {
    id: 9, name: 'Caesar Salad', image: IMAGES[2], date: d(8),
    ingredients: [
      { name: 'Romaine Lettuce', amount: 200, unit: 'g' },
      { name: 'Parmesan', amount: 60, unit: 'g' },
      { name: 'Croutons', amount: 80, unit: 'g' },
      { name: 'Eggs', amount: 1, unit: 'pcs' },
      { name: 'Garlic', amount: 1, unit: 'cloves' },
      { name: 'Lemon', amount: 1, unit: 'pcs' },
    ],
  },
  {
    id: 10, name: 'Butter Chicken', image: IMAGES[0], date: d(9),
    ingredients: [
      { name: 'Chicken Breast', amount: 600, unit: 'g' },
      { name: 'Tomatoes', amount: 400, unit: 'g' },
      { name: 'Heavy Cream', amount: 150, unit: 'ml' },
      { name: 'Butter', amount: 50, unit: 'g' },
      { name: 'Garlic', amount: 3, unit: 'cloves' },
      { name: 'Ginger', amount: 10, unit: 'g' },
      { name: 'Onion', amount: 1, unit: 'pcs' },
    ],
  },
  {
    id: 11, name: 'Avocado Toast', image: IMAGES[1], date: d(10),
    ingredients: [
      { name: 'Bread', amount: 4, unit: 'slices' },
      { name: 'Avocado', amount: 2, unit: 'pcs' },
      { name: 'Eggs', amount: 2, unit: 'pcs' },
      { name: 'Lemon', amount: 1, unit: 'pcs' },
      { name: 'Red Pepper Flakes', amount: 5, unit: 'g' },
    ],
  },
  {
    id: 12, name: 'Salmon Teriyaki', image: IMAGES[2], date: d(11),
    ingredients: [
      { name: 'Salmon', amount: 500, unit: 'g' },
      { name: 'Soy Sauce', amount: 60, unit: 'ml' },
      { name: 'Honey', amount: 30, unit: 'ml' },
      { name: 'Garlic', amount: 2, unit: 'cloves' },
      { name: 'Ginger', amount: 10, unit: 'g' },
      { name: 'Sesame Oil', amount: 15, unit: 'ml' },
    ],
  },
  {
    id: 13, name: 'Vegetarian Pizza', image: IMAGES[0], date: d(12),
    ingredients: [
      { name: 'Flour', amount: 300, unit: 'g' },
      { name: 'Tomatoes', amount: 200, unit: 'g' },
      { name: 'Mozzarella', amount: 200, unit: 'g' },
      { name: 'Bell Pepper', amount: 1, unit: 'pcs' },
      { name: 'Olive Oil', amount: 30, unit: 'ml' },
      { name: 'Basil', amount: 10, unit: 'g' },
    ],
  },
  {
    id: 14, name: 'French Onion Soup', image: IMAGES[1], date: d(13),
    ingredients: [
      { name: 'Onion', amount: 4, unit: 'pcs' },
      { name: 'Butter', amount: 60, unit: 'g' },
      { name: 'White Wine', amount: 100, unit: 'ml' },
      { name: 'Gruyere Cheese', amount: 150, unit: 'g' },
      { name: 'Bread', amount: 4, unit: 'slices' },
      { name: 'Garlic', amount: 2, unit: 'cloves' },
    ],
  },
  {
    id: 15, name: 'Shakshuka', image: IMAGES[2], date: d(14),
    ingredients: [
      { name: 'Eggs', amount: 4, unit: 'pcs' },
      { name: 'Tomatoes', amount: 400, unit: 'g' },
      { name: 'Bell Pepper', amount: 1, unit: 'pcs' },
      { name: 'Onion', amount: 1, unit: 'pcs' },
      { name: 'Garlic', amount: 3, unit: 'cloves' },
      { name: 'Olive Oil', amount: 30, unit: 'ml' },
      { name: 'Cumin', amount: 5, unit: 'g' },
    ],
  },
  {
    id: 16, name: 'Pad Thai', image: IMAGES[0], date: d(16),
    ingredients: [
      { name: 'Rice Noodles', amount: 200, unit: 'g' },
      { name: 'Chicken Breast', amount: 300, unit: 'g' },
      { name: 'Eggs', amount: 2, unit: 'pcs' },
      { name: 'Soy Sauce', amount: 45, unit: 'ml' },
      { name: 'Lime', amount: 2, unit: 'pcs' },
      { name: 'Peanuts', amount: 60, unit: 'g' },
      { name: 'Garlic', amount: 2, unit: 'cloves' },
    ],
  },
  {
    id: 17, name: 'Caprese Salad', image: IMAGES[1], date: d(18),
    ingredients: [
      { name: 'Tomatoes', amount: 400, unit: 'g' },
      { name: 'Mozzarella', amount: 250, unit: 'g' },
      { name: 'Basil', amount: 20, unit: 'g' },
      { name: 'Olive Oil', amount: 30, unit: 'ml' },
      { name: 'Black Pepper', amount: 3, unit: 'g' },
    ],
  },
  {
    id: 18, name: 'Lentil Curry', image: IMAGES[2], date: d(20),
    ingredients: [
      { name: 'Red Lentils', amount: 250, unit: 'g' },
      { name: 'Onion', amount: 2, unit: 'pcs' },
      { name: 'Garlic', amount: 4, unit: 'cloves' },
      { name: 'Ginger', amount: 15, unit: 'g' },
      { name: 'Heavy Cream', amount: 100, unit: 'ml' },
      { name: 'Butter', amount: 30, unit: 'g' },
      { name: 'Cumin', amount: 5, unit: 'g' },
    ],
  },
  {
    id: 19, name: 'Tuna Pasta', image: IMAGES[0], date: d(22),
    ingredients: [
      { name: 'Spaghetti', amount: 200, unit: 'g' },
      { name: 'Tuna', amount: 200, unit: 'g' },
      { name: 'Tomatoes', amount: 300, unit: 'g' },
      { name: 'Garlic', amount: 2, unit: 'cloves' },
      { name: 'Olive Oil', amount: 30, unit: 'ml' },
      { name: 'Capers', amount: 30, unit: 'g' },
    ],
  },
  {
    id: 20, name: 'Beef Stew', image: IMAGES[1], date: d(25),
    ingredients: [
      { name: 'Beef Chuck', amount: 600, unit: 'g' },
      { name: 'Carrots', amount: 200, unit: 'g' },
      { name: 'Onion', amount: 2, unit: 'pcs' },
      { name: 'Garlic', amount: 3, unit: 'cloves' },
      { name: 'Red Wine', amount: 200, unit: 'ml' },
      { name: 'Tomatoes', amount: 300, unit: 'g' },
      { name: 'Butter', amount: 30, unit: 'g' },
    ],
  },
  {
    id: 21, name: 'Quiche Lorraine', image: IMAGES[2], date: d(27),
    ingredients: [
      { name: 'Flour', amount: 200, unit: 'g' },
      { name: 'Eggs', amount: 3, unit: 'pcs' },
      { name: 'Heavy Cream', amount: 200, unit: 'ml' },
      { name: 'Bacon', amount: 150, unit: 'g' },
      { name: 'Gruyere Cheese', amount: 100, unit: 'g' },
      { name: 'Butter', amount: 80, unit: 'g' },
    ],
  },
];

// --- State ---
const PRESETS = [3, 7, 14, 30] as const;
const selectedDays = ref(7);
const customDaysInput = ref('');
const checkedKeys = ref<Set<string>>(new Set());
const copySuccess = ref(false);

// --- Computed ---
const activeRecipes = computed(() => {
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() + selectedDays.value);
  return allDummyRecipes.filter((r) => r.date >= today && r.date < cutoff);
});

const shoppingItems = computed((): ShoppingItem[] => {
  const map = new Map<string, ShoppingItem>();

  for (const recipe of activeRecipes.value) {
    for (const ing of recipe.ingredients) {
      const key = `${ing.name}|||${ing.unit}`;
      const existing = map.get(key);
      if (existing) {
        existing.amount += ing.amount;
        if (!existing.recipes.includes(recipe.name)) {
          existing.recipes.push(recipe.name);
        }
      } else {
        map.set(key, {
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          recipes: [recipe.name],
          checked: false,
        });
      }
    }
  }

  return Array.from(map.values())
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((item) => ({
      ...item,
      checked: checkedKeys.value.has(`${item.name}|||${item.unit}`),
    }));
});

const checkedCount = computed(() => shoppingItems.value.filter((i) => i.checked).length);

// --- Actions ---
function setDays(n: number) {
  selectedDays.value = n;
  customDaysInput.value = '';
}

function applyCustomDays() {
  const n = parseInt(customDaysInput.value);
  if (Number.isFinite(n) && n >= 1 && n <= 365) {
    selectedDays.value = n;
  }
}

function toggleItem(item: ShoppingItem) {
  const key = `${item.name}|||${item.unit}`;
  if (checkedKeys.value.has(key)) {
    checkedKeys.value.delete(key);
  } else {
    checkedKeys.value.add(key);
  }
  checkedKeys.value = new Set(checkedKeys.value);
}

function uncheckAll() {
  checkedKeys.value = new Set();
}

async function copyToClipboard() {
  const lines = [
    `Shopping List — Next ${selectedDays.value} days`,
    '─'.repeat(36),
    ...shoppingItems.value.map((item) => {
      const check = item.checked ? '✓' : '□';
      const amount = item.amount % 1 === 0 ? String(item.amount) : item.amount.toFixed(1);
      return `${check} ${item.name.padEnd(22)} ${amount} ${item.unit}`;
    }),
  ];
  await navigator.clipboard.writeText(lines.join('\n'));
  copySuccess.value = true;
  setTimeout(() => (copySuccess.value = false), 2000);
}

function printList() {
  window.print();
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });
}
</script>

<template>
  <div class="container mx-auto px-4 pb-10" style="padding-top: 5rem">
    <div class="max-w-2xl mx-auto flex flex-col gap-6">

      <!-- Header -->
      <div class="card bg-base-100 shadow-xl no-print">
        <div class="card-body gap-4">
          <div class="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 class="card-title text-2xl font-bold">
                <i class="fa-solid fa-cart-shopping text-primary" />
                {{ $t('page.shopping_list.title') }}
              </h1>
              <p class="text-base-content/50 text-sm mt-1">
                {{ $t('page.shopping_list.subtitle') }}
              </p>
            </div>
            <div class="flex gap-2 shrink-0">
              <button @click="copyToClipboard" class="btn btn-ghost btn-sm gap-2">
                <i :class="copySuccess ? 'fa-solid fa-check text-success' : 'fa-regular fa-copy'" />
                <span>{{ copySuccess ? $t('page.shopping_list.copied') : $t('page.shopping_list.copy') }}</span>
              </button>
              <button @click="printList" class="btn btn-ghost btn-sm gap-2">
                <i class="fa-solid fa-print" />
                <span>{{ $t('page.shopping_list.print') }}</span>
              </button>
            </div>
          </div>

          <!-- Day selector -->
          <div class="flex items-center gap-3 flex-wrap">
            <span class="text-base-content/60 text-sm">{{ $t('page.shopping_list.next') }}</span>
            <div class="join">
              <button
                v-for="n in PRESETS"
                :key="n"
                :class="['join-item btn btn-sm', selectedDays === n && customDaysInput === '' ? 'btn-primary' : 'btn-ghost']"
                @click="setDays(n)"
              >{{ n }}</button>
            </div>
            <span class="text-base-content/60 text-sm">{{ $t('page.shopping_list.days') }}</span>
            <input
              v-model="customDaysInput"
              type="number"
              min="1"
              max="365"
              :placeholder="$t('page.shopping_list.custom')"
              class="input input-sm input-bordered w-24"
              @keyup.enter="applyCustomDays"
              @blur="applyCustomDays"
            />
          </div>
        </div>
      </div>

      <!-- Print-only header -->
      <div class="print-only hidden">
        <h1 class="text-2xl font-bold mb-1">Shopping List — Next {{ selectedDays }} days</h1>
        <p class="text-sm text-gray-500 mb-4">
          {{ activeRecipes.length }} recipes · {{ shoppingItems.length }} ingredients
        </p>
      </div>

      <!-- Planned recipes strip -->
      <div v-if="activeRecipes.length > 0" class="no-print">
        <div class="flex gap-3 overflow-x-auto pb-2 px-1">
          <div
            v-for="recipe in activeRecipes"
            :key="recipe.id"
            class="flex flex-col items-center gap-1 shrink-0 w-20"
          >
            <img
              :src="recipe.image"
              :alt="recipe.name"
              class="w-16 h-16 rounded-box object-cover shadow-sm"
            />
            <span class="text-xs text-base-content/70 text-center w-full truncate leading-tight">
              {{ recipe.name }}
            </span>
            <span class="badge badge-xs badge-ghost text-base-content/50">
              {{ formatDate(recipe.date) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Shopping list card -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body gap-4">

          <!-- Stats + uncheckAll -->
          <div class="flex items-center justify-between no-print">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-semibold text-base-content">
                {{ shoppingItems.length }} {{ $t('page.shopping_list.ingredients') }}
              </span>
              <span class="text-base-content/50 text-sm">
                ({{ activeRecipes.length }} {{ $t('page.shopping_list.recipes') }})
              </span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-sm text-base-content/50">
                {{ checkedCount }}/{{ shoppingItems.length }}
              </span>
              <button
                v-if="checkedCount > 0"
                @click="uncheckAll"
                class="btn btn-ghost btn-xs text-base-content/50"
              >
                {{ $t('page.shopping_list.uncheck_all') }}
              </button>
            </div>
          </div>

          <!-- Progress bar -->
          <progress
            v-if="shoppingItems.length > 0"
            class="progress progress-primary no-print"
            :value="checkedCount"
            :max="shoppingItems.length"
          />

          <!-- Empty state -->
          <div v-if="shoppingItems.length === 0" class="text-center py-12">
            <i class="fa-solid fa-cart-shopping text-5xl text-base-content/20 mb-4 block" />
            <p class="text-base-content/50">
              {{ $t('page.shopping_list.empty', { days: selectedDays }) }}
            </p>
          </div>

          <!-- List -->
          <ul v-else class="flex flex-col gap-2">
            <shopping-list-item-component
              v-for="item in shoppingItems"
              :key="`${item.name}|||${item.unit}`"
              :name="item.name"
              :amount="item.amount"
              :unit="item.unit"
              :recipes="item.recipes"
              :checked="item.checked"
              @toggle="toggleItem(item)"
            />
          </ul>

        </div>
      </div>

    </div>
  </div>
</template>

<style>
@media print {
  .no-print { display: none !important; }
  .navbar, footer, .footer { display: none !important; }
  .print-only { display: block !important; }
  body { background: white !important; color: black !important; }
  .card { box-shadow: none !important; border: 1px solid #e5e7eb !important; }
}
</style>
