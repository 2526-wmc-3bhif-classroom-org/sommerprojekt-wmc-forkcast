<script setup lang="ts">
import useCalendarService from '~/assets/service/calendar-service';
import type { CalendarEntry } from '~/assets/model/calendar-entry';

const route = useRoute();
const localePath = useLocalePath();
const calendarService = useCalendarService();

function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const todayStr = toLocalDateStr(new Date());

const selectedDate = computed(() => {
  const d = route.query.date as string;
  return d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : todayStr;
});

const isToday = computed(() => selectedDate.value === todayStr);

const parsedDate = computed(() => {
  const [year, month, day] = selectedDate.value.split('-').map(Number);
  return new Date(year, month - 1, day);
});

const weekday = computed(() =>
  new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(parsedDate.value)
);

const dateLabel = computed(() =>
  new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric' }).format(parsedDate.value)
);

function offsetDate(base: string, days: number): string {
  const [year, month, day] = base.split('-').map(Number);
  return toLocalDateStr(new Date(year, month - 1, day + days));
}

const prevDate = computed(() => offsetDate(selectedDate.value, -1));
const nextDate = computed(() => offsetDate(selectedDate.value, 1));

const entries = ref<CalendarEntry[]>([]);
const loading = ref(true);
const error = ref(false);

async function fetchEntries() {
  loading.value = true;
  error.value = false;
  const result = await calendarService.getEntries(selectedDate.value, selectedDate.value);
  loading.value = false;
  if (result.ok) {
    entries.value = result.value ?? [];
  } else {
    error.value = true;
  }
}

watch(selectedDate, fetchEntries, { immediate: true });
</script>

<template>
  <div class="grid grid-rows-[4rem_1fr] min-h-screen">
    <div/>

    <div class="flex flex-col items-center gap-10 px-6 py-12">

      <!-- Date header -->
      <div class="flex flex-col items-center gap-3 w-full max-w-3xl">
        <div class="flex items-center gap-4 w-full justify-center">
          <nuxt-link-locale
            :to="{ path: '/dashboard', query: { date: prevDate } }"
            class="btn btn-ghost btn-circle"
          >
            <i class="fa-solid fa-chevron-left"/>
          </nuxt-link-locale>

          <div class="text-center min-w-64">
            <div class="flex items-center justify-center gap-2 mb-0.5">
              <span v-if="isToday" class="badge badge-primary badge-sm uppercase tracking-widest font-semibold">
                {{ $t('dashboard.today') }}
              </span>
            </div>
            <h1 class="text-4xl font-bold tracking-tight">{{ weekday }}</h1>
            <p class="text-base-content/50 text-lg mt-0.5">{{ dateLabel }}</p>
          </div>

          <nuxt-link-locale
            :to="{ path: '/dashboard', query: { date: nextDate } }"
            class="btn btn-ghost btn-circle"
          >
            <i class="fa-solid fa-chevron-right"/>
          </nuxt-link-locale>
        </div>

        <nuxt-link-locale
          v-if="!isToday"
          :to="'/dashboard'"
          class="btn btn-ghost btn-sm gap-1.5 text-base-content/50 hover:text-base-content"
        >
          <i class="fa-solid fa-rotate-left text-xs"/>
          {{ $t('dashboard.back_to_today') }}
        </nuxt-link-locale>
      </div>

      <!-- Divider -->
      <div class="divider self-stretch max-w-3xl mx-auto text-base-content/30 text-sm uppercase tracking-widest font-semibold">
        {{ $t('dashboard.on_menu') }}
      </div>

      <!-- Loading -->
      <div v-if="loading" class="carousel carousel-center w-full gap-6 px-8">
        <div v-for="i in 3" :key="i" class="carousel-item">
          <div class="card bg-base-100 w-80 shadow-sm animate-pulse">
            <div class="bg-base-300 h-52 w-full rounded-t-2xl"/>
            <div class="card-body gap-3">
              <div class="bg-base-300 h-4 rounded w-3/4"/>
              <div class="bg-base-300 h-6 rounded w-1/2"/>
              <div class="bg-base-300 h-3 rounded w-full"/>
              <div class="bg-base-300 h-3 rounded w-5/6"/>
              <div class="bg-base-300 h-9 rounded-lg w-full mt-2"/>
            </div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="flex flex-col items-center gap-4 text-base-content/40 py-16">
        <i class="fa-solid fa-triangle-exclamation text-5xl text-error/60"/>
        <p class="text-lg">{{ $t('dashboard.error') }}</p>
        <button class="btn btn-ghost btn-sm" @click="fetchEntries">
          <i class="fa-solid fa-rotate-right"/>
          {{ $t('component.fse.retry') }}
        </button>
      </div>

      <!-- Empty -->
      <div v-else-if="entries.filter(e => e.recipe).length === 0" class="flex flex-col items-center gap-5 text-base-content/40 py-16">
        <div class="w-24 h-24 rounded-full bg-base-200 flex items-center justify-center">
          <i class="fa-solid fa-bowl-food text-4xl"/>
        </div>
        <div class="text-center">
          <p class="text-xl font-semibold text-base-content/60">{{ $t('dashboard.empty') }}</p>
          <p class="text-sm mt-1">{{ $t('dashboard.empty_hint') }}</p>
        </div>
        <nuxt-link-locale :to="'/dashboard/schedule'" class="btn btn-primary btn-sm">
          <i class="fa-solid fa-calendar-plus"/>
          {{ $t('dashboard.go_to_schedule') }}
        </nuxt-link-locale>
      </div>

      <!-- Carousel -->
      <div v-else class="relative w-full">
        <div class="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-base-200 to-transparent z-10 pointer-events-none rounded-l"/>
        <div class="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-base-200 to-transparent z-10 pointer-events-none rounded-r"/>
        <div class="carousel carousel-center w-full gap-6 px-16 pb-2">
          <div
            v-for="entry in entries.filter(e => e.recipe)"
            :key="entry.id"
            class="carousel-item"
          >
            <recipe-card-component :data="entry.recipe"/>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
