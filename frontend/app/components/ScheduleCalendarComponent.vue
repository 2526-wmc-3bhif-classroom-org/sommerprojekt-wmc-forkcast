<script setup lang="ts">
import draggable from 'vuedraggable';

const { locale } = useI18n();

type CalendarCell = {
  key: string;
  day: number | null;
  isToday: boolean;
  date: Date | null;
};

type DayRecipeSummary = {
  count: number;
  previewTitles: string[];
  remainingCount: number;
};

const HOVER_DELAY_MS = 450;
const DAY_PREVIEW_TITLE_LIMIT = 2;

const today = new Date();
const currentMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1));
const expandedDayKey = ref<string | null>(null);
const isDraggingRecipe = ref(false);
const calendarGridRef = ref<HTMLElement | null>(null);
const dragSourceDayKey = ref<string | null>(null);
const dragSourceIndex = ref<number | null>(null);
const recipesByDay = reactive<Record<string, Record<string, unknown>[]>>({});
let hoverTimerId: ReturnType<typeof setTimeout> | null = null;
let dropItemCounter = 0;

const monthLabel = computed(() =>
  new Intl.DateTimeFormat(locale.value, {
	month: 'long',
	year: 'numeric'
  }).format(currentMonth.value)
);

const weekdayLabels = computed(() => {
  const formatter = new Intl.DateTimeFormat(locale.value, { weekday: 'short' });
  const monday = new Date(2026, 5, 1);
  return Array.from({ length: 7 }, (_, index) => formatter.format(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index)));
});

const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear();
  const month = currentMonth.value.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingEmptyDays = (firstDayOfMonth.getDay() + 6) % 7;

  const cells: CalendarCell[] = [];

  for (let index = 0; index < leadingEmptyDays; index += 1) {
	cells.push({ key: `empty-leading-${index}`, day: null, isToday: false, date: null });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
	const date = new Date(year, month, day);
	cells.push({
	  key: toDateKey(date),
	  day,
	  date,
	  isToday:
		date.getFullYear() === today.getFullYear() &&
		date.getMonth() === today.getMonth() &&
		date.getDate() === today.getDate()
	});
  }

  while (cells.length < 42) {
	cells.push({ key: `empty-trailing-${cells.length}`, day: null, isToday: false, date: null });
  }

  return cells;
});

const dayRecipeSummaryByKey = computed<Record<string, DayRecipeSummary>>(() => {
  const summaries: Record<string, DayRecipeSummary> = {};

  for (const [dayKey, dayRecipes] of Object.entries(recipesByDay)) {
    if (!Array.isArray(dayRecipes) || dayRecipes.length === 0) {
      continue;
    }

    const titles = dayRecipes.map((recipe, index) => recipeTitleFromData(recipe, index));
    summaries[dayKey] = {
      count: titles.length,
      previewTitles: titles.slice(0, DAY_PREVIEW_TITLE_LIMIT),
      remainingCount: Math.max(0, titles.length - DAY_PREVIEW_TITLE_LIMIT)
    };
  }

  return summaries;
});

watch(currentMonth, () => {
  expandedDayKey.value = null;
  clearHoverTimer();
});

onUnmounted(() => {
  clearHoverTimer();
});

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function clearHoverTimer() {
  if (!hoverTimerId) {
    return;
  }
  clearTimeout(hoverTimerId);
  hoverTimerId = null;
}

function startDayHover(cell: CalendarCell) {
  if (!cell.day || !cell.key) {
    return;
  }
  clearHoverTimer();
  hoverTimerId = setTimeout(() => {
    expandedDayKey.value = cell.key;
  }, HOVER_DELAY_MS);
}

function endDayHover(cell: CalendarCell) {
  clearHoverTimer();
  if (isDraggingRecipe.value) {
    return;
  }
  if (expandedDayKey.value === cell.key) {
    expandedDayKey.value = null;
  }
}

function onDayDragEnter(cell: CalendarCell) {
  if (!cell.day) {
    return;
  }
  isDraggingRecipe.value = true;
  clearHoverTimer();
  expandedDayKey.value = cell.key;
}

function onDayDragOver(cell: CalendarCell) {
  if (!cell.day) {
    return;
  }
  isDraggingRecipe.value = true;
  if (expandedDayKey.value !== cell.key) {
    expandedDayKey.value = cell.key;
  }
}

function onDayDrop(cell: CalendarCell) {
  if (cell.day) {
    expandedDayKey.value = cell.key;
  }
  isDraggingRecipe.value = false;
}

function onDayListAdd(cell: CalendarCell, event: { newIndex?: number }) {
  onDayDrop(cell);

  const index = typeof event.newIndex === 'number' ? event.newIndex : -1;
  if (index < 0) {
    return;
  }

  const dayRecipes = getDayRecipes(cell.key);
  const droppedRecipe = dayRecipes[index];
  if (!droppedRecipe) {
    return;
  }

  // Create a fresh object + unique key for each drop, even for cloned sources.
  dayRecipes[index] = {
    ...droppedRecipe,
    __dropItemId: `day-recipe-${dropItemCounter++}`
  };
}

function onDayListDragStart(cell: CalendarCell, event: { oldIndex?: number }) {
  isDraggingRecipe.value = true;
  dragSourceDayKey.value = cell.key;
  dragSourceIndex.value = typeof event.oldIndex === 'number' ? event.oldIndex : null;
}

function onDayListDragEnd(cell: CalendarCell, event: {
  oldIndex?: number;
  to?: EventTarget | null;
  from?: EventTarget | null;
  originalEvent?: MouseEvent | TouchEvent;
}) {
  const sourceDayKey = dragSourceDayKey.value;
  const sourceIndex = dragSourceIndex.value;
  const didReturnToSameList = event.to === event.from;
  const pointer = pointerPositionFromEvent(event.originalEvent);
  const droppedOutsideCalendar = pointer
    ? !isPointInsideCalendar(pointer.x, pointer.y)
    : false;

  if (sourceDayKey && didReturnToSameList && droppedOutsideCalendar) {
    const dayRecipes = getDayRecipes(sourceDayKey);
    const indexToRemove = sourceIndex ?? (typeof event.oldIndex === 'number' ? event.oldIndex : -1);
    if (indexToRemove >= 0 && indexToRemove < dayRecipes.length) {
      dayRecipes.splice(indexToRemove, 1);
    }
  }

  dragSourceDayKey.value = null;
  dragSourceIndex.value = null;
  isDraggingRecipe.value = false;
}

function getDayRecipes(dayKey: string): Record<string, unknown>[] {
  if (!recipesByDay[dayKey]) {
    recipesByDay[dayKey] = [];
  }
  return recipesByDay[dayKey];
}

function getDayRecipeSummary(dayKey: string): DayRecipeSummary | null {
  return dayRecipeSummaryByKey.value[dayKey] ?? null;
}

function pointerPositionFromEvent(event?: MouseEvent | TouchEvent): { x: number; y: number } | null {
  if (!event) {
    return null;
  }
  if ('clientX' in event) {
    return { x: event.clientX, y: event.clientY };
  }
  const touch = event.changedTouches[0] ?? event.touches[0];
  if (!touch) {
    return null;
  }
  return { x: touch.clientX, y: touch.clientY };
}

function isPointInsideCalendar(x: number, y: number): boolean {
  const grid = calendarGridRef.value;
  if (!grid) {
    return true;
  }
  const bounds = grid.getBoundingClientRect();
  return x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom;
}

function recipeTitleFromData(recipe: Record<string, unknown>, index: number): string {
  const rawTitle = recipe.title;
  if (typeof rawTitle === 'string' && rawTitle.trim().length > 0) {
    return rawTitle;
  }
  return `Recipe ${index + 1}`;
}

function dayPopoverTitle(date: Date | null): string {
  if (!date) {
    return '';
  }
  return new Intl.DateTimeFormat(locale.value, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

function getPopoverPlacementClasses(index: number): string {
  const row = Math.floor(index / 7);
  const column = index % 7;

  const horizontalClass =
    column <= 1
      ? 'left-0'
      : column >= 5
        ? 'right-0'
        : 'left-1/2 -translate-x-1/2';

  // Open down on top rows to avoid clipping, otherwise open upward from the day card.
  if (row <= 1) {
    return `${horizontalClass} top-0 origin-top`;
  }

  return `${horizontalClass} bottom-0 origin-bottom`;
}

function goToPreviousMonth() {
  currentMonth.value = new Date(
	currentMonth.value.getFullYear(),
	currentMonth.value.getMonth() - 1,
	1
  );
}

function goToNextMonth() {
  currentMonth.value = new Date(
	currentMonth.value.getFullYear(),
	currentMonth.value.getMonth() + 1,
	1
  );
}

function goToToday() {
  currentMonth.value = new Date(today.getFullYear(), today.getMonth(), 1);
}
</script>

<template>
  <div class="grid grid-rows-[4.5rem_1fr] grid-cols-1 gap-5">
    <div class="bg-base-100 rounded-l-2xl text-base-content">
      <div class="flex items-center justify-between gap-4 px-4 py-4">
        <h1 class="text-left text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl whitespace-nowrap">
          {{ monthLabel }}
        </h1>

        <div class="flex items-center gap-2 sm:gap-3">
          <button
              type="button"
              class="btn btn-circle btn-sm sm:btn-md"
              aria-label="Previous month"
              @click="goToPreviousMonth"
          >
            <span aria-hidden="true"><i class="fa-solid fa-arrow-left"/></span>
          </button>

          <button
              type="button"
              class="btn btn-sm sm:btn-md rounded-full px-4"
              aria-label="Go to today"
              @click="goToToday"
          >
            <span aria-hidden="true"><i class="fa-solid fa-calendar-day"/></span>
          </button>

          <button
              type="button"
              class="btn btn-circle btn-sm sm:btn-md"
              aria-label="Next month"
              @click="goToNextMonth"
          >
            <span aria-hidden="true"><i class="fa-solid fa-arrow-right"/></span>
          </button>
        </div>
      </div>
    </div>
    <div class="bg-base-100 rounded-tl-2xl text-base-content">
      <div class="flex flex-col h-full">
        <div class="grid flex-1 grid-rows-[auto_1fr]">
          <div class="grid grid-cols-7 text-center text-xs font-medium uppercase tracking-[0.2em] text-base-content/60 sm:text-sm">
            <div
                v-for="weekday in weekdayLabels"
                :key="weekday"
                class="px-2 py-3 sm:py-4"
            >
              {{ weekday }}
            </div>
          </div>

          <div ref="calendarGridRef" class="grid flex-1 grid-cols-7 h-full grid-rows-6 gap-px bg-base-300 p-px">
            <div
                v-for="(cell, index) in calendarDays"
                :key="cell.key || `${monthLabel}-${index}`"
                class="relative bg-base-100 text-sm"
                :class="cell.day ? 'hover:bg-base-200/70' : 'bg-base-100/80 text-base-content/20'"
                @mouseenter="startDayHover(cell)"
                @mouseleave="endDayHover(cell)"
                @dragenter.prevent="onDayDragEnter(cell)"
                @dragover.prevent="onDayDragOver(cell)"
            >
              <div
                  v-if="cell.day"
                  class="relative flex h-full flex-col items-start justify-between rounded-2xl p-2 transition-colors"
                  :class="cell.isToday ? 'ring-primary/40' : ''"
              >
              <span
                  class="inline-flex h-8 min-w-8 items-center justify-center rounded-full text-sm font-semibold"
                  :class="cell.isToday ? 'bg-primary text-primary-content' : 'text-base-content'"
              >
                {{ cell.day }}
              </span>

                <div
                    v-if="getDayRecipeSummary(cell.key)"
                    class="pointer-events-none mt-2 w-full min-h-18 max-h-18 overflow-hidden"
                >
                  <div class="flex items-center justify-between gap-2">
                    <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-base-content/55">
                      Planned
                    </p>
                    <span class="rounded-full bg-base-200/80 px-2 py-0.5 text-[10px] font-semibold text-base-content/60">
                      {{ getDayRecipeSummary(cell.key)?.count }}
                    </span>
                  </div>
                  <ul class="mt-1 space-y-1">
                    <li
                        v-for="(title, titleIndex) in getDayRecipeSummary(cell.key)?.previewTitles"
                        :key="`${cell.key}-summary-${titleIndex}`"
                        class="truncate rounded-md bg-base-200/60 px-2 py-1 text-xs text-base-content/75"
                    >
                      {{ title }}
                    </li>
                  </ul>
                </div>

                <Transition
                    enter-active-class="transition duration-200 ease-out"
                    enter-from-class="opacity-0 !scale-100"
                    enter-to-class="opacity-100 !scale-125"
                    leave-active-class="transition duration-200 ease-in"
                    leave-from-class="opacity-100 !scale-125"
                    leave-to-class="opacity-0 !scale-100"
                >
                  <div
                      v-show="expandedDayKey === cell.key"
                      :class="getPopoverPlacementClasses(index)"
                      class="pointer-events-none absolute z-30 flex h-60 w-120 scale-125 flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-100 p-3 shadow-2xl"
                  >
                    <p class="text-sm font-semibold leading-tight">
                      {{ dayPopoverTitle(cell.date) }}
                    </p>

                    <draggable
                        :list="getDayRecipes(cell.key)"
                        :animation="300"
                        :group="{ name: 'items', pull: true, put: true }"
                        tag="ul"
                        item-key="__dropItemId"
                        ghost-class="opacity-25"
                        class="pointer-events-auto list mt-2 min-h-0 flex-1 overflow-y-auto rounded-xl bg-base-200/60 p-2"
                        @start="onDayListDragStart(cell, $event)"
                        @end="onDayListDragEnd(cell, $event)"
                        @add="onDayListAdd(cell, $event)"
                    >
                      <template #item="{ element: data }">
                        <div class="cursor-grab active:cursor-grabbing touch-none">
                          <recipe-list-component :data="data"/>
                        </div>
                      </template>
                    </draggable>
                  </div>
                </Transition>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

