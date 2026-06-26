<script setup lang="ts">
import { joinURL } from "ufo";
import useAuthService from "~/assets/service/auth-service";
import { useAuthStore } from "~/assets/store/auth-store";
import LanguageSwitcherComponent from "~/components/LanguageSwitcherComponent.vue";
import ThemeSwitcherComponent from "~/components/ThemeSwitcherComponent.vue";

// Client-only navbar: serve the SVG logo directly (base-path aware) instead of
// via NuxtImg, whose /_ipx/ URL wouldn't be prerendered/generated for a static host.
const logoSrc = joinURL(useRuntimeConfig().app.baseURL, "/logo.svg");
const route = useRoute();
const cf = useRuntimeConfig();
const isScrolled = ref(false);

const handleScroll = () => {
  // Paths carry a locale prefix for non-default locales (e.g. /de/auth/login),
  // so match on the suffix; the home entry "/" also matches "/de", "/de/".
  const path = route.fullPath;
  const allowed = cf.public.scrollAllowedPages.some((p: string) =>
    p === "/" ? /^\/([a-z]{2})?\/?$/.test(path) : path.endsWith(p)
  );
  if (!allowed) {
    isScrolled.value = true;
    return
  }
  isScrolled.value = window.scrollY > 0;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
});
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

const router = useRouter();
const localePath = useLocalePath();
const authService = useAuthService();
const authStore = useAuthStore();
const user = computed(() => authStore.user ?? null);

// Hover opens the date picker; a date click force-closes it (a CSS dropdown-hover
// would stay stuck open while the cursor is still over the popover).
const pickerOpen = ref(false);

async function logout() {
  await authService.logout();
  await router.push(localePath("/"));
}

function blur() {
  (document.activeElement as HTMLElement).blur();
}

function onCalendarClick(event: Event) {
  const date = (event.target as any).value;
  pickerOpen.value = false;
  blur();
  router.push(localePath({ path: '/dashboard', query: { date } }));
}
</script>

<template>
  <div :class="['fixed top-0 navbar transition-colors duration-300', { 'navbar-scrolled': isScrolled }, { 'bg-transparent': !isScrolled }]">
    <div :class="['flex-1', { 'text-[#E6E4E3FF]' : !isScrolled}]">
      <nuxt-link-locale to="/" class="btn btn-ghost text-xl">
        <img :src="logoSrc" width="30" alt="" />
        <span>{{$t('component.navbar.title')}}</span>
      </nuxt-link-locale>
    </div>
    <div class="flex-none">
      <language-switcher-component :class="[{ 'text-[#E6E4E3FF]' : !isScrolled}]"/>
      <theme-switcher-component :class="[{ 'text-[#E6E4E3FF]' : !isScrolled}]"/>

      <!-- Picker: click goes to today's dashboard; hover reveals a date picker that jumps to the chosen day -->
      <div class="dropdown dropdown-end" :class="[{ 'dropdown-open': pickerOpen }, { 'text-[#E6E4E3FF]' : !isScrolled}]"
           @mouseenter="pickerOpen = true" @mouseleave="pickerOpen = false">
        <nuxt-link-locale to="/dashboard" class="btn btn-ghost btn-circle">
          <i class="fa-solid fa-utensils"/>
        </nuxt-link-locale>
        <div tabindex="0" class="dropdown-content z-1 pt-3">
          <div class="card card-compact bg-base-100 shadow">
            <calendar-date class="cally card-body p-0" @change="onCalendarClick">
              <div class="p-2 py-1" slot="previous"><i class="fa-solid fa-angle-left"/></div>
              <div class="p-2 py-1" slot="next"><i class="fa-solid fa-angle-right"/></div>
              <calendar-month></calendar-month>
            </calendar-date>
          </div>
        </div>
      </div>

      <div :class="['tooltip tooltip-bottom [--tt-bg:var(--color-base-200)] before:text-base-content', { 'text-[#E6E4E3FF]' : !isScrolled}]" :data-tip="$t('component.navbar.calendar.schedule')">
        <nuxt-link-locale to="/dashboard/schedule" class="btn btn-ghost btn-circle">
          <i class="fa-solid fa-calendar"/>
        </nuxt-link-locale>
      </div>

      <div :class="['tooltip tooltip-bottom [--tt-bg:var(--color-base-200)] before:text-base-content', { 'text-[#E6E4E3FF]' : !isScrolled}]" :data-tip="$t('component.navbar.user.shopping_list')">
        <nuxt-link-locale to="/dashboard/shopping-list" class="btn btn-ghost btn-circle">
          <i class="fa-solid fa-cart-shopping"/>
        </nuxt-link-locale>
      </div>
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar placeholder">
          <div v-if="!user?.profilePicture" class="bg-primary text-primary-content rounded-full w-9 flex items-center justify-center">
            <span class="text-sm font-bold">{{ user?.name?.charAt(0).toUpperCase() }}</span>
          </div>
          <div v-else class="rounded-full w-9">
            <img :src="`data:image/png;base64,${user.profilePicture}`" :alt="user?.name ?? ''" />
          </div>
        </div>
        <ul tabindex="-1" class="menu menu-md dropdown-content bg-base-100 rounded-box z-1 mt-3 p-2 shadow min-w-max w-40">
          <li>
            <nuxt-link-locale @click="blur" to="/dashboard/account">
              <i class="fa-solid fa-user"/>
              <span>{{$t('component.navbar.user.account')}}</span>
            </nuxt-link-locale>
          </li>
          <li>
            <span @click="logout">
              <i class="fa-solid fa-arrow-right-from-bracket"/>
              <span>{{$t('component.navbar.user.logout')}}</span>
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>