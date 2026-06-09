<script setup lang="ts">
definePageMeta({
  showFooter: false,
})

import { useCalendarStore } from '~/assets/store/calendar-store';
import { useAuthStore } from '~/assets/store/auth-store';

const route = useRoute();
const localePath = useLocalePath();
const calendarStore = useCalendarStore();
const { locale } = useI18n();

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
  const [year, month, day] = selectedDate.value.split('-').map(Number) as [number, number, number];
  return new Date(year, month - 1, day);
});

const weekday = computed(() =>
  new Intl.DateTimeFormat(locale.value, { weekday: 'long' }).format(parsedDate.value)
);

const dateLabel = computed(() =>
  new Intl.DateTimeFormat(locale.value, { month: 'long', day: 'numeric' }).format(parsedDate.value)
);

function offsetDate(base: string, days: number): string {
  const [year, month, day] = base.split('-').map(Number) as [number, number, number];
  return toLocalDateStr(new Date(year, month - 1, day + days));
}

const prevDate = computed(() => offsetDate(selectedDate.value, -1));
const nextDate = computed(() => offsetDate(selectedDate.value, 1));

const entries = computed(() => calendarStore.entriesByDate[selectedDate.value] ?? []);
const loading = ref(true);
const error = ref(false);

const authenticated = computed(() => !useAuthStore().loading && useAuthStore().jwt !== undefined);

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

async function fetchEntries() {
  if (!authenticated.value) return;
  const weekStart = getWeekStart(parsedDate.value);
  const weekStartKey = toLocalDateStr(weekStart);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekEndKey = toLocalDateStr(weekEnd);

  const alreadyCached = calendarStore.fetchedWeeks.has(weekStartKey);
  if (!alreadyCached) loading.value = true;
  error.value = false;
  const result = await calendarStore.getEntries(weekStartKey, weekEndKey);
  loading.value = false;
  if (!result.ok && !result.needsAuth) error.value = true;
}

watch(selectedDate, fetchEntries, { immediate: true });
watch(authenticated, (auth) => { if (auth) fetchEntries(); });

const vPreventBackGesture = {
  mounted(el: HTMLElement) {
    el.addEventListener('wheel', (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
      const atStart = el.scrollLeft <= 0 && e.deltaX < 0
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth && e.deltaX > 0
      if (atStart || atEnd) e.preventDefault()
    }, { passive: false })
  },
}
</script>

<template>
  <div class="grid grid-rows-[4rem_1fr] min-h-screen">
    <div/>

    <div class="flex flex-col items-center gap-10 py-12">

      <!-- Date header -->
      <div class="flex flex-col items-center gap-3 w-full max-w-3xl px-6 opacity-0 animate-fade-in-slide-in-up">
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
      <div class="divider self-stretch max-w-3xl w-full mx-auto px-6 text-base-content/30 text-sm uppercase tracking-widest font-semibold opacity-0 animate-fade-in-slide-in-up-delay">
        {{ $t('dashboard.on_menu') }}
      </div>

      <!-- Loading -->
      <div v-if="loading" v-prevent-back-gesture class="carousel carousel-center w-full max-w-[100vw] min-w-0 gap-6 px-6" style="justify-content: safe center">
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
      <div v-else-if="entries.filter(e => e.recipe).length === 0" class="flex flex-col items-center gap-5 text-base-content/40 py-16 opacity-0 animate-fade-in-slide-in-up-delay">
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

      <!-- Cards -->
      <div v-else v-prevent-back-gesture class="carousel carousel-center w-full max-w-[100vw] min-w-0 gap-6 px-6 opacity-0 animate-fade-in-slide-in-up-delay" style="justify-content: safe center">
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
</template>
