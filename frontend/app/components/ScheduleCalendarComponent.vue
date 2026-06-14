<script setup lang="ts">
import draggable from 'vuedraggable';
import { useCalendarStore } from '~/assets/store/calendar-store';

// Component has two root nodes (grid + dialog), so disable auto attr
// inheritance and bind parent attrs (e.g. class) to the grid root explicitly.
defineOptions({ inheritAttrs: false });

const { locale, t } = useI18n();

type WeekDay = {
  key: string;
  date: Date;
  dayName: string;
  dayNum: number;
  isToday: boolean;
};

const today = new Date();
const currentWeekStart = ref(getWeekStart(today));
const calendarGridRef = ref<HTMLElement | null>(null);
const dragSourceDayKey = ref<string | null>(null);
const dragSourceItem = ref<Record<string, unknown> | null>(null);
const recipesByDay = reactive<Record<string, Record<string, unknown>[]>>({});
const selectedRecipe = ref<Record<string, unknown> | null>(null);
const dialogRef = ref<HTMLDialogElement | null>(null);

function openRecipe(data: Record<string, unknown>) {
  selectedRecipe.value = data;
  dialogRef.value?.showModal();
}

function closeRecipe() {
  dialogRef.value?.close();
  selectedRecipe.value = null;
}
let dropItemCounter = 0;
const loadingWeek = ref(false);
const calendarError = ref<string | null>(null);

const calendarStore = useCalendarStore();

const weekLabel = computed(() => {
  const start = currentWeekStart.value;
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = new Intl.DateTimeFormat(locale.value, { month: 'short', day: 'numeric' });
  const year = new Intl.DateTimeFormat(locale.value, { year: 'numeric' }).format(end);
  return `${fmt.format(start)} – ${fmt.format(end)}, ${year}`;
});

const weekDays = computed<WeekDay[]>(() =>
  Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart.value);
    date.setDate(date.getDate() + i);
    return {
      key: toDateKey(date),
      date,
      dayName: new Intl.DateTimeFormat(locale.value, { weekday: 'short' }).format(date),
      dayNum: date.getDate(),
      isToday: toDateKey(date) === toDateKey(today),
    };
  })
);

async function loadWeek(weekStart: Date) {
  const from = toDateKey(weekStart);
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  const to = toDateKey(end);

  // Clear stale display data for this week (prevents duplicates on week nav, handles remount)
  for (const key of Object.keys(recipesByDay)) {
    if (key >= from && key <= to) recipesByDay[key] = [];
  }

  if (calendarStore.fetchedWeeks.has(from)) {
    for (const [dayKey, entries] of Object.entries(calendarStore.entriesByDate)) {
      if (dayKey < from || dayKey > to) continue;
      for (const entry of entries) {
        getDayRecipes(dayKey).push({
          ...(entry.recipe || { id: entry.recipeId, title: 'Loading…', image: '', effort: 100, tags: [], rating: { rating: 0, count: 0 }, attributes: [] }),
          __dropItemId: `day-recipe-${dropItemCounter++}`,
          __calendarEntryId: entry.id,
        });
      }
    }
    return;
  }

  calendarError.value = null;
  loadingWeek.value = true;

  const result = await calendarStore.getEntries(from, to);
  if (result.rateLimited) {
    calendarError.value = t('error.rate_limited');
    loadingWeek.value = false;
    return;
  }
  if (!result.ok || !result.value) { loadingWeek.value = false; return; }

  for (const entry of result.value) {
    if (!entry.recipe) continue;
    const dayKey = toDateKey(new Date(entry.date));
    getDayRecipes(dayKey).push({
      ...entry.recipe,
      __dropItemId: `day-recipe-${dropItemCounter++}`,
      __calendarEntryId: entry.id,
    });
  }
  loadingWeek.value = false;
}

onMounted(() => loadWeek(currentWeekStart.value));
watch(currentWeekStart, (weekStart) => loadWeek(weekStart));

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function dayKeyToDate(dayKey: string): Date {
  const [year, month, day] = dayKey.split('-').map(Number) as [number, number, number];
  // Use noon local time to avoid UTC boundary issues.
  return new Date(year, month - 1, day, 12, 0, 0);
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function effortClass(effort: unknown): string {
  const n = typeof effort === 'number' ? effort : 100;
  if (n <= 30) return 'bg-success';
  if (n <= 60) return 'bg-warning';
  return 'bg-error';
}

function getDayRecipes(dayKey: string): Record<string, unknown>[] {
  if (!recipesByDay[dayKey]) recipesByDay[dayKey] = [];
  return recipesByDay[dayKey];
}

function pointerPositionFromEvent(event?: MouseEvent | TouchEvent): { x: number; y: number } | null {
  if (!event) return null;
  if ('clientX' in event) return { x: event.clientX, y: event.clientY };
  const touch = event.changedTouches[0] ?? event.touches[0];
  if (!touch) return null;
  return { x: touch.clientX, y: touch.clientY };
}

function isPointInsideCalendar(x: number, y: number): boolean {
  const grid = calendarGridRef.value;
  if (!grid) return true;
  const bounds = grid.getBoundingClientRect();
  return x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom;
}

async function onDayListAdd(dayKey: string, event: { newIndex?: number }) {
  const index = typeof event.newIndex === 'number' ? event.newIndex : -1;
  if (index < 0) return;

  const dayRecipes = getDayRecipes(dayKey);
  const dropped = dayRecipes[index];
  if (!dropped) return;

  const itemWithId: Record<string, unknown> = { ...dropped, __dropItemId: `day-recipe-${dropItemCounter++}` };
  dayRecipes[index] = itemWithId;

  const recipeId = dropped.id as number;
  const result = await calendarStore.addEntry(recipeId, dayKeyToDate(dayKey));
  if (result.ok && result.value) {
    itemWithId.__calendarEntryId = result.value.id;
  }
}

function onDayListDragStart(dayKey: string, event: { oldIndex?: number }) {
  dragSourceDayKey.value = dayKey;
  const idx = typeof event.oldIndex === 'number' ? event.oldIndex : -1;
  dragSourceItem.value = idx >= 0 ? (getDayRecipes(dayKey)[idx] ?? null) : null;
}

async function onDayListDragEnd(_dayKey: string, event: {
  oldIndex?: number;
  to?: EventTarget | null;
  from?: EventTarget | null;
  originalEvent?: MouseEvent | TouchEvent;
}) {
  const sourceDayKey = dragSourceDayKey.value;
  const sourceItem = dragSourceItem.value;
  const didReturnToSameList = event.to === event.from;
  const pointer = pointerPositionFromEvent(event.originalEvent);
  const droppedOutside = pointer ? !isPointInsideCalendar(pointer.x, pointer.y) : false;

  if (sourceDayKey && didReturnToSameList && droppedOutside) {
    // Dragged out of calendar entirely — remove from list and delete from backend.
    const dayRecipes = getDayRecipes(sourceDayKey);
    const idx = typeof event.oldIndex === 'number' ? event.oldIndex : -1;
    if (idx >= 0 && idx < dayRecipes.length) dayRecipes.splice(idx, 1);
    if (sourceItem?.__calendarEntryId) {
      await calendarStore.deleteEntry(sourceItem.__calendarEntryId as number);
    }
  } else if (!didReturnToSameList && !droppedOutside) {
    // Moved to a different calendar day — find and delete the old entry by recipe ID from source day
    if (sourceDayKey && sourceItem) {
      const recipeId = sourceItem.id as number;
      const storeEntries = calendarStore.entriesByDate[sourceDayKey];
      if (storeEntries) {
        const idx = storeEntries.findIndex(e => e.recipeId === recipeId);
        if (idx !== -1) {
          const entryId = storeEntries[idx].id;
          await calendarStore.deleteEntry(entryId);
        }
      }
    }
  }

  dragSourceDayKey.value = null;
  dragSourceItem.value = null;
}

function goPrev() {
  const d = new Date(currentWeekStart.value);
  d.setDate(d.getDate() - 7);
  currentWeekStart.value = d;
}

function goNext() {
  const d = new Date(currentWeekStart.value);
  d.setDate(d.getDate() + 7);
  currentWeekStart.value = d;
}

const mobileDayIndex = ref((() => {
  const d = today.getDay();
  return d === 0 ? 6 : d - 1; // Mon=0..Sun=6
})());

function goPrevDay() {
  if (mobileDayIndex.value > 0) {
    mobileDayIndex.value--;
  } else {
    goPrev();
    mobileDayIndex.value = 6;
  }
}

function goNextDay() {
  if (mobileDayIndex.value < 6) {
    mobileDayIndex.value++;
  } else {
    goNext();
    mobileDayIndex.value = 0;
  }
}

function goToToday() {
  currentWeekStart.value = getWeekStart(today);
  const d = today.getDay();
  mobileDayIndex.value = d === 0 ? 6 : d - 1;
}
</script>

<template>
  <div v-bind="$attrs" class="grid grid-rows-[4.5rem_1fr] grid-cols-1 gap-4 h-full min-h-0 rounded-2xl overflow-hidden opacity-0 animate-fade-in-slide-in-right">
    <div class="bg-base-100 rounded-2xl text-base-content">
      <div class="flex items-center justify-between gap-4 px-4 py-4">
        <div class="flex flex-col gap-0.5 min-w-0">
          <!-- Desktop: week range -->
          <h1 class="hidden md:block text-left text-2xl font-semibold tracking-tight lg:text-4xl whitespace-nowrap">
            {{ weekLabel }}
          </h1>
          <!-- Mobile: single day -->
          <div class="md:hidden">
            <h1 class="text-left text-xl font-semibold tracking-tight">
              {{ weekDays[mobileDayIndex]?.dayName }}, {{ weekDays[mobileDayIndex]?.date.toLocaleDateString(locale, { month: 'short', day: 'numeric' }) }}
            </h1>
          </div>
          <p v-if="calendarError" class="flex items-center gap-1.5 text-xs text-error">
            <i class="fa-solid fa-circle-exclamation shrink-0"/>
            {{ calendarError }}
          </p>
        </div>
        <!-- Desktop nav: week -->
        <div class="hidden md:flex items-center gap-3">
          <button type="button" class="btn btn-circle btn-md" aria-label="Previous week" @click="goPrev">
            <i class="fa-solid fa-arrow-left"/>
          </button>
          <button type="button" class="btn btn-md rounded-full px-4" aria-label="Today" @click="goToToday">
            <i class="fa-solid fa-calendar-day"/>
          </button>
          <button type="button" class="btn btn-circle btn-md" aria-label="Next week" @click="goNext">
            <i class="fa-solid fa-arrow-right"/>
          </button>
        </div>
        <!-- Mobile nav: day -->
        <div class="flex md:hidden items-center gap-2">
          <button type="button" class="btn btn-circle btn-sm" aria-label="Previous day" @click="goPrevDay">
            <i class="fa-solid fa-arrow-left"/>
          </button>
          <button type="button" class="btn btn-sm rounded-full px-3" aria-label="Today" @click="goToToday">
            <i class="fa-solid fa-calendar-day"/>
          </button>
          <button type="button" class="btn btn-circle btn-sm" aria-label="Next day" @click="goNextDay">
            <i class="fa-solid fa-arrow-right"/>
          </button>
        </div>
      </div>
    </div>

    <div class="bg-base-100 rounded-2xl text-base-content overflow-hidden">
      <div ref="calendarGridRef" class="grid grid-cols-1 md:grid-cols-7 gap-px bg-base-300 h-full">
        <div
            v-for="(day, i) in weekDays"
            :key="day.key"
            class="bg-base-100 flex flex-col overflow-hidden min-h-0"
            :class="i !== mobileDayIndex ? 'hidden md:flex' : ''"
        >
          <div class="hidden md:flex flex-col items-center py-3 shrink-0 border-b border-base-300">
            <span class="text-xs font-semibold uppercase tracking-widest text-base-content/50">{{ day.dayName }}</span>
            <span
                class="mt-1 inline-flex size-9 items-center justify-center rounded-full text-lg font-bold"
                :class="day.isToday ? 'bg-primary text-primary-content' : 'text-base-content'"
            >{{ day.dayNum }}</span>
          </div>

          <div v-if="loadingWeek" class="flex-1 p-2 space-y-1.5">
            <div v-for="i in 2" :key="i" class="skeleton h-10 w-full rounded-xl"/>
          </div>
          <draggable v-else
              :list="getDayRecipes(day.key)"
              :animation="200"
              :group="{ name: 'items', pull: true, put: true }"
              tag="ul"
              item-key="__dropItemId"
              ghost-class="cal-drop-ghost"
              class="flex-1 min-h-0 overflow-y-auto p-2 space-y-1.5"
              @start="onDayListDragStart(day.key, $event)"
              @end="onDayListDragEnd(day.key, $event)"
              @add="onDayListAdd(day.key, $event)"
          >
            <template #item="{ element: data }">
              <li
                  class="cursor-grab active:cursor-grabbing touch-none select-none flex items-center gap-1.5 rounded-xl bg-base-200/70 hover:bg-base-200 px-1.5 md:px-2 py-1.5 transition-colors"
                  @click.stop="openRecipe(data as Record<string, unknown>)"
              >
                <img :src="(data as any).image" :alt="(data as any).title" class="size-7 rounded-lg object-cover shrink-0" loading="lazy"/>
                <span class="text-xs font-medium leading-tight truncate flex-1">{{ (data as any).title }}</span>
                <span class="shrink-0 size-1.5 rounded-full" :class="effortClass((data as any).effort)"/>
              </li>
            </template>
          </draggable>
        </div>
      </div>
    </div>

  </div>

  <!-- Recipe detail popover -->
  <dialog ref="dialogRef" class="modal" @click.self="closeRecipe">
    <div class="modal-box p-0 overflow-hidden max-w-sm">
      <button
          class="btn btn-sm btn-circle absolute left-2 top-2 z-10 bg-base-100/70 hover:bg-base-100 border-0 backdrop-blur-sm"
          @click="closeRecipe"
      >
        <i class="fa-solid fa-xmark"/>
      </button>
      <recipe-card-component v-if="selectedRecipe" :data="selectedRecipe"/>
    </div>
  </dialog>
</template>

<style>
.cal-drop-ghost {
  height: 2rem !important;
  max-height: 2rem !important;
  overflow: hidden !important;
  border-radius: 0.5rem !important;
  opacity: 0.45;
  background: var(--color-base-200) !important;
  border: 1px dashed var(--color-primary) !important;
  padding: 0 !important;
}

.cal-drop-ghost > * {
  display: none !important;
}
</style>
