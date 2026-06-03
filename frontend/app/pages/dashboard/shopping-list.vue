  <script setup lang="ts">
import useApiConnection from '~/assets/util/api-connector';
import { useAuthStore } from '~/assets/store/auth-store';

// --- Types ---
type ShoppingItem = {
  name: string;
  amount: number;
  unit: string;
  recipes: string[];
  checked: boolean;
};

type ShoppingListIngredient = {
  name: string;
  metric?: { amount: number; unit: string };
  us?: { amount: number; unit: string };
};

type ShoppingListResponse = {
  dateRange: { start: string; end: string };
  recipeCount: number;
  ingredients: ShoppingListIngredient[];
};

// --- Placeholder (shown when calendar is empty) ---
const PLACEHOLDER_ITEMS: ShoppingItem[] = [
  { name: 'Your Recipe', amount: 1, unit: 'serving', recipes: ['Add meals to your calendar'], checked: false },
  { name: 'Example Ingredient', amount: 200, unit: 'g', recipes: ['Add meals to your calendar'], checked: false },
  { name: 'Another Ingredient', amount: 3, unit: 'pcs', recipes: [], checked: false },
];


const today = new Date();
today.setHours(0, 0, 0, 0);

  // --- Helpers ---
function toInputStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function parseLocalDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number) as [number, number, number];
  return new Date(y, m - 1, d);
}

function addDays(date: Date, n: number): Date {
  const x = new Date(date);
  x.setDate(x.getDate() + n);
  return x;
}

// --- API ---
const { apiRequest } = useApiConnection();
const authStore = useAuthStore();

// --- State ---
const PRESETS = [3, 7, 14, 30] as const;
const startDateStr = ref(toInputStr(today));
const endDateStr = ref(toInputStr(addDays(today, 7)));
const checkedKeys = ref<Set<string>>(new Set());
const copySuccess = ref(false);
const calendarRangeEl = ref<HTMLElement | null>(null);
const isLoading = ref(false);
const fetchError = ref(false);
const apiItems = ref<ShoppingItem[]>([]);
const recipeCount = ref(0);

const displayRange = computed(() => {
  const s = parseLocalDate(startDateStr.value);
  const e = parseLocalDate(endDateStr.value);
  const fmt = (d: Date, showYear: boolean) =>
    d.toLocaleDateString('en', { month: 'short', day: 'numeric', ...(showYear ? { year: 'numeric' } : {}) });
  const diffYear = s.getFullYear() !== e.getFullYear();
  return `${fmt(s, diffYear)} — ${fmt(e, true)}`;
});

// --- Computed ---
function isPresetActive(n: number): boolean {
  return startDateStr.value === toInputStr(today) && endDateStr.value === toInputStr(addDays(today, n));
}

const isPlaceholder = computed(() => !isLoading.value && !fetchError.value && apiItems.value.length === 0);

const shoppingItems = computed((): ShoppingItem[] => {
  const base = isPlaceholder.value ? PLACEHOLDER_ITEMS : apiItems.value;
  return base.map((item) => ({
    ...item,
    checked: checkedKeys.value.has(`${item.name}|||${item.unit}`),
  }));
});

const checkedCount = computed(() => shoppingItems.value.filter((i) => i.checked).length);

// --- Actions ---
function setPreset(n: number) {
  startDateStr.value = toInputStr(today);
  endDateStr.value = toInputStr(addDays(today, n));
  nextTick(() => {
    if (calendarRangeEl.value) {
      (calendarRangeEl.value as any).value = `${startDateStr.value}/${endDateStr.value}`;
    }
  });
}

function onRangeChange(event: Event) {
  const val = (event.target as any).value as string;
  if (!val || !val.includes('/')) return;
  const [start, end] = val.split('/');
  if (!start || !end) return;
  startDateStr.value = start;
  endDateStr.value = end;
  (document.activeElement as HTMLElement)?.blur();
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
    `Shopping List — ${startDateStr.value} to ${endDateStr.value}`,
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

async function fetchShoppingList() {
  isLoading.value = true;
  fetchError.value = false;

  const params = new URLSearchParams({
    from: `${startDateStr.value}T00:00:00`,
    to: `${endDateStr.value}T23:59:59`,
    units: 'metric',
  });

  const result = await apiRequest<ShoppingListResponse>(
    `/users/me/calendar/shopping-list?${params}`,
    'GET',
    authStore.jwt,
  );

  if (result.ok && result.value) {
    recipeCount.value = result.value.recipeCount;
    apiItems.value = result.value.ingredients.map((ing) => ({
      name: ing.name,
      amount: ing.metric?.amount ?? ing.us?.amount ?? 0,
      unit: ing.metric?.unit ?? ing.us?.unit ?? '',
      recipes: [],
      checked: false,
    }));
  } else {
    fetchError.value = true;
    apiItems.value = [];
  }

  isLoading.value = false;
}

watch([startDateStr, endDateStr], fetchShoppingList);
onMounted(fetchShoppingList);
</script>

<template>
  <div class="container mx-auto px-4 pb-10" style="padding-top: 5rem">
    <div class="max-w-2xl mx-auto flex flex-col gap-6 opacity-0 animate-fade-in-slide-in-up">

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

          <!-- Date range selector -->
          <div class="flex items-center gap-3 flex-wrap">
            <div class="join">
              <button
                v-for="n in PRESETS"
                :key="n"
                :class="['join-item btn btn-sm', isPresetActive(n) ? 'btn-primary' : 'btn-ghost bg-base-300']"
                @click="setPreset(n)"
              >{{ n }}d</button>
            </div>

            <div class="dropdown">
              <div tabindex="0" role="button" class="btn btn-ghost btn-sm gap-2">
                <i class="fa-solid fa-calendar-days" />
                <span>{{ displayRange }}</span>
                <i class="fa-solid fa-chevron-down text-xs opacity-50" />
              </div>
              <div tabindex="0" class="card card-compact dropdown-content bg-base-100 z-10 mt-3 shadow">
                <calendar-range
                  ref="calendarRangeEl"
                  class="cally card-body p-0"
                  :value="`${startDateStr}/${endDateStr}`"
                  @change="onRangeChange"
                >
                  <div class="p-2 py-1" slot="previous"><i class="fa-solid fa-angle-left" /></div>
                  <div class="p-2 py-1" slot="next"><i class="fa-solid fa-angle-right" /></div>
                  <calendar-month />
                </calendar-range>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Print-only header -->
      <div class="print-only hidden">
        <h1 class="text-2xl font-bold mb-1">Shopping List</h1>
        <p class="text-sm mb-4">
          {{ startDateStr }} – {{ endDateStr }} &nbsp;·&nbsp;
          {{ recipeCount }} recipes &nbsp;·&nbsp;
          {{ shoppingItems.length }} ingredients
        </p>
      </div>

      <!-- Shopping list card -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body gap-4">

          <!-- Error alert -->
          <div v-if="fetchError" class="alert alert-error no-print">
            <i class="fa-solid fa-triangle-exclamation" />
            <span>{{ $t('page.shopping_list.error') }}</span>
          </div>

          <!-- Stats + uncheckAll -->
          <div v-if="!isLoading" class="flex items-center justify-between no-print">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-semibold text-base-content">
                {{ isPlaceholder ? '—' : shoppingItems.length }} {{ $t('page.shopping_list.ingredients') }}
              </span>
              <span class="text-base-content/50 text-sm">
                ({{ isPlaceholder ? '—' : recipeCount }} {{ $t('page.shopping_list.recipes') }})
              </span>
            </div>
            <div class="flex items-center gap-3">
              <span v-if="!isPlaceholder" class="text-sm text-base-content/50">
                {{ checkedCount }}/{{ shoppingItems.length }}
              </span>
              <button
                v-if="checkedCount > 0 && !isPlaceholder"
                @click="uncheckAll"
                class="btn btn-ghost btn-xs text-base-content/50"
              >
                {{ $t('page.shopping_list.uncheck_all') }}
              </button>
            </div>
          </div>

          <!-- Progress bar -->
          <progress
            v-if="!isLoading && !isPlaceholder && shoppingItems.length > 0"
            class="progress progress-primary no-print"
            :value="checkedCount"
            :max="shoppingItems.length"
          />

          <!-- Loading spinner -->
          <div v-if="isLoading" class="flex justify-center py-12">
            <span class="loading loading-spinner loading-lg text-primary" />
          </div>

          <!-- Placeholder banner -->
          <div v-if="isPlaceholder && !isLoading" class="alert alert-info no-print">
            <i class="fa-solid fa-circle-info" />
            <span>{{ $t('page.shopping_list.placeholder_hint') }}</span>
          </div>

          <!-- List -->
          <ul
            v-if="!isLoading"
            class="ingredient-list flex flex-col gap-2"
            :class="{ 'opacity-40 pointer-events-none select-none': isPlaceholder }"
          >
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

  body, body * { background: white !important; }
  body * { color: black !important; }

  /* Keep checked items visually distinct */
  li.opacity-50, li.opacity-50 * { color: #555 !important; }

  .card { box-shadow: none !important; border: 1px solid #ddd !important; }

  /* 2-column ingredient grid */
  .ingredient-list {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 0.2rem 0.75rem !important;
  }

  .ingredient-list li {
    font-size: 0.75rem !important;
    padding: 0.2rem 0.5rem !important;
    background: transparent !important;
    border: none !important;
    border-bottom: 1px solid #eee !important;
    border-radius: 0 !important;
  }

  .ingredient-list li .badge {
    display: none !important;
  }
}
</style>
