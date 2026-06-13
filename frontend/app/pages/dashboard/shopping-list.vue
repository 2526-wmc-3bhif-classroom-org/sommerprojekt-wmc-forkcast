  <script setup lang="ts">
  definePageMeta({ showFooter: false })

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
const rawIngredients = ref<ShoppingListIngredient[]>([]);
const recipeCount = ref(0);
const useMetric = ref(true);

const apiItems = computed((): ShoppingItem[] =>
  rawIngredients.value.map((ing) => ({
    name: ing.name,
    amount: ing.metric?.amount ?? ing.us?.amount ?? 0,
    unit: ing.metric?.unit ?? ing.us?.unit ?? '',
    recipes: [],
    checked: false,
  }))
);

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

const isPlaceholder = computed(() => !isLoading.value && !fetchError.value && rawIngredients.value.length === 0);

const shoppingItems = computed((): ShoppingItem[] =>
  apiItems.value.map((item) => ({
    ...item,
    checked: checkedKeys.value.has(`${item.name}|||${item.unit}`),
  }))
);

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
    units: useMetric.value ? 'metric' : 'us',
  });

  const result = await apiRequest<ShoppingListResponse>(
    `/users/me/calendar/shopping-list?${params}`,
    'GET',
    authStore.jwt,
  );

  if (result.ok && result.value) {
    recipeCount.value = result.value.recipeCount;
    rawIngredients.value = result.value.ingredients;
  } else {
    fetchError.value = true;
    rawIngredients.value = [];
  }

  isLoading.value = false;
}

watch([startDateStr, endDateStr, useMetric], fetchShoppingList);
onMounted(fetchShoppingList);
</script>

<template>
  <!-- Full-viewport grid matching schedule page pattern -->
  <div class="sl-grid grid grid-rows-[4rem_1fr] w-screen h-screen px-4 pb-4 gap-x-4" style="grid-template-columns: 20rem 1fr">
    <!-- Navbar spacer -->
    <div class="col-span-2" />

    <!-- Left column: controls + calendar -->
    <div class="flex flex-col gap-4 min-h-0 opacity-0 animate-fade-in-slide-in-left no-print">

      <!-- Controls card -->
      <div class="bg-base-100 rounded-2xl shrink-0">
        <div class="p-5 flex flex-col gap-4">
          <div>
            <h1 class="card-title text-2xl font-bold">
              <i class="fa-solid fa-cart-shopping text-primary" />
              {{ $t('page.shopping_list.title') }}
            </h1>
            <p class="text-base-content/50 text-sm mt-1">{{ $t('page.shopping_list.subtitle') }}</p>
          </div>
          <div class="flex gap-2">
            <button @click="copyToClipboard" class="btn btn-ghost btn-sm gap-2 flex-1">
              <i :class="copySuccess ? 'fa-solid fa-check text-success' : 'fa-regular fa-copy'" />
              <span>{{ copySuccess ? $t('page.shopping_list.copied') : $t('page.shopping_list.copy') }}</span>
            </button>
            <button @click="printList" class="btn btn-ghost btn-sm gap-2 flex-1">
              <i class="fa-solid fa-print" />
              <span>{{ $t('page.shopping_list.print') }}</span>
            </button>
          </div>
          <div class="join w-full">
            <button
              v-for="n in PRESETS"
              :key="n"
              :class="['join-item btn btn-sm flex-1', isPresetActive(n) ? 'btn-primary' : 'btn-ghost bg-base-300']"
              @click="setPreset(n)"
            >{{ n }}d</button>
          </div>
          <div class="join w-full">
            <button :class="['join-item btn btn-sm flex-1', useMetric ? 'btn-primary' : 'btn-ghost bg-base-300']" @click="useMetric = true">ml / g</button>
            <button :class="['join-item btn btn-sm flex-1', !useMetric ? 'btn-primary' : 'btn-ghost bg-base-300']" @click="useMetric = false">cup / oz</button>
          </div>
          <div class="text-sm text-base-content/50 flex items-center gap-2">
            <i class="fa-solid fa-calendar-days text-primary" />
            {{ displayRange }}
          </div>
        </div>
      </div>

      <!-- Calendar card (auto height) -->
      <div class="bg-base-100 rounded-2xl overflow-hidden flex items-center justify-center p-4">
        <calendar-range
          ref="calendarRangeEl"
          class="cally"
          :value="`${startDateStr}/${endDateStr}`"
          @change="onRangeChange"
        >
          <div class="p-2 py-1" slot="previous"><i class="fa-solid fa-angle-left" /></div>
          <div class="p-2 py-1" slot="next"><i class="fa-solid fa-angle-right" /></div>
          <calendar-month />
        </calendar-range>
      </div>

    </div>

    <!-- Right column: shopping list -->
    <div class="sl-right-col bg-base-100 rounded-2xl overflow-hidden flex flex-col opacity-0 animate-fade-in-slide-in-right">

      <!-- Print-only header -->
      <div class="print-only hidden p-4">
        <h1 class="text-2xl font-bold mb-1">Shopping List</h1>
        <p class="text-sm mb-4">
          {{ startDateStr }} – {{ endDateStr }} &nbsp;·&nbsp;
          {{ recipeCount }} recipes &nbsp;·&nbsp;
          {{ shoppingItems.length }} ingredients
        </p>
      </div>

      <!-- Fixed header: stats + progress -->
      <div class="px-6 pt-5 pb-3 shrink-0 no-print flex flex-col gap-3">
        <div v-if="fetchError" class="alert alert-error">
          <i class="fa-solid fa-triangle-exclamation" />
          <span>{{ $t('page.shopping_list.error') }}</span>
        </div>
        <div v-if="!isLoading" class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="font-semibold">
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
        <div v-if="!isLoading && !isPlaceholder && shoppingItems.length > 0" class="w-full h-2 rounded-full bg-base-300 overflow-hidden">
          <div
            class="progress-fill h-full rounded-full bg-primary transition-[width] duration-500 ease-out relative overflow-hidden"
            :style="`width: ${(checkedCount / shoppingItems.length) * 100}%`"
          />
        </div>
      </div>

      <!-- Scrollable list -->
      <div class="sl-list-scroll overflow-y-scroll flex-1 px-6 pb-4">
        <div v-if="isLoading" class="flex justify-center py-12">
          <span class="loading loading-spinner loading-lg text-primary" />
        </div>
        <div v-if="isPlaceholder && !isLoading" class="alert alert-info no-print">
          <i class="fa-solid fa-circle-info" />
          <span>{{ $t('page.shopping_list.placeholder_hint') }}</span>
        </div>
        <ul v-if="!isLoading" class="ingredient-list flex flex-col gap-2">
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
</template>

<style>
@media print {
  .no-print { display: none !important; }
  .navbar, footer, .footer { display: none !important; }
  .print-only { display: block !important; }

  /* Break out of full-viewport grid so all content renders */
  .sl-grid {
    display: block !important;
    height: auto !important;
    width: 100% !important;
    padding: 0 !important;
  }

  .sl-right-col {
    display: block !important;
    height: auto !important;
    overflow: visible !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }

  .sl-list-scroll {
    overflow: visible !important;
    height: auto !important;
  }

  body, body * { background: white !important; }
  body * { color: black !important; }

  li.opacity-50, li.opacity-50 * { color: #555 !important; }

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

  .ingredient-list li .badge { display: none !important; }
}

@keyframes shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(250%); }
}

.progress-fill::after {
  content: '';
  position: absolute;
  inset-y: 0;
  left: 0;
  width: 40%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
  animation: shimmer 2s ease-in-out infinite;
}
</style>
