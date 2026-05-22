<script setup lang="ts">
import draggable from 'vuedraggable';
import useCalendarService from '~/assets/service/calendar-service';
import useRecipeService from '~/assets/service/recipe-service';

const { locale } = useI18n();

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

const calendarService = useCalendarService();
const recipeService = useRecipeService();

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

onMounted(async () => {
  const result = await calendarService.getEntries();
  if (!result.ok || !result.value) return;

  await Promise.all(result.value.map(async (entry) => {
    const recipeResult = await recipeService.getRecipe(entry.recipeId);
    if (!recipeResult.ok || !recipeResult.value) return;

    const dayKey = entry.date.slice(0, 10);
    getDayRecipes(dayKey).push({
      ...recipeResult.value,
      __dropItemId: `day-recipe-${dropItemCounter++}`,
      __calendarEntryId: entry.id,
    });
  }));
});

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function dayKeyToDate(dayKey: string): Date {
  const [year, month, day] = dayKey.split('-').map(Number);
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

  const itemWithId = { ...dropped, __dropItemId: `day-recipe-${dropItemCounter++}` };
  dayRecipes[index] = itemWithId;

  const recipeId = dropped.id as number;
  const result = await calendarService.addEntry(recipeId, dayKeyToDate(dayKey));
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
      await calendarService.deleteEntry(sourceItem.__calendarEntryId as number);
    }
  } else if (!didReturnToSameList && !droppedOutside) {
    // Moved to a different calendar day — old entry deleted, new one created via onDayListAdd.
    if (sourceItem?.__calendarEntryId) {
      await calendarService.deleteEntry(sourceItem.__calendarEntryId as number);
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

function goToToday() {
  currentWeekStart.value = getWeekStart(today);
}
</script>

<template>
  <div class="grid grid-rows-[4.5rem_1fr] grid-cols-1 gap-5">

    <div class="bg-base-100 rounded-l-2xl text-base-content">
      <div class="flex items-center justify-between gap-4 px-4 py-4">
        <h1 class="text-left text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl whitespace-nowrap">
          {{ weekLabel }}
        </h1>
        <div class="flex items-center gap-2 sm:gap-3">
          <button type="button" class="btn btn-circle btn-sm sm:btn-md" aria-label="Previous week" @click="goPrev">
            <i class="fa-solid fa-arrow-left"/>
          </button>
          <button type="button" class="btn btn-sm sm:btn-md rounded-full px-4" aria-label="Today" @click="goToToday">
            <i class="fa-solid fa-calendar-day"/>
          </button>
          <button type="button" class="btn btn-circle btn-sm sm:btn-md" aria-label="Next week" @click="goNext">
            <i class="fa-solid fa-arrow-right"/>
          </button>
        </div>
      </div>
    </div>

    <div class="bg-base-100 rounded-tl-2xl text-base-content overflow-hidden">
      <div ref="calendarGridRef" class="grid grid-cols-7 gap-px bg-base-300 h-full">
        <div
            v-for="day in weekDays"
            :key="day.key"
            class="bg-base-100 flex flex-col overflow-hidden min-h-0"
        >
          <div class="flex flex-col items-center py-3 shrink-0 border-b border-base-300">
            <span class="text-xs font-semibold uppercase tracking-widest text-base-content/50">{{ day.dayName }}</span>
            <span
                class="mt-1 inline-flex size-9 items-center justify-center rounded-full text-lg font-bold"
                :class="day.isToday ? 'bg-primary text-primary-content' : 'text-base-content'"
            >{{ day.dayNum }}</span>
          </div>

          <draggable
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
                  class="cursor-grab active:cursor-grabbing touch-none flex items-center gap-2 rounded-xl bg-base-200/70 hover:bg-base-200 px-2 py-1.5 transition-colors"
                  @click.stop="openRecipe(data as Record<string, unknown>)"
              >
                <img :src="(data as any).image" :alt="(data as any).title" class="size-7 rounded-lg object-cover shrink-0"/>
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
    <div class="modal-box p-0 overflow-hidden w-auto max-w-sm">
      <button
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10"
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
