<script setup lang="ts">
import { joinURL } from "ufo";

// This navbar is rendered client-only, so a NuxtImg <img> here is never in the
// prerendered HTML and its /_ipx/ URL never gets generated → 404 on a static host.
// The logo is an SVG (no optimization needed), so serve the public file directly,
// base-path aware.
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
</script>
<template>
  <div :class="['fixed top-0 navbar transition-colors duration-300 ', { 'navbar-scrolled': isScrolled }, { 'bg-transparent': !isScrolled }]">
    <div :class="['flex-1', { 'text-[#E6E4E3FF]' : !isScrolled}]">
      <nuxt-link-locale to="/" class="btn btn-ghost text-xl">
        <img :src="logoSrc" width="30" alt="" />
        <span>{{$t('component.navbar.title')}}</span>
      </nuxt-link-locale>
    </div>
    <div class="flex-none">
      <language-switcher-component :class="['mr-2', { 'text-[#E6E4E3FF]' : !isScrolled}]"/>
      <theme-switcher-component :class="['mr-2', { 'text-[#E6E4E3FF]' : !isScrolled}]"/>

      <nuxt-link-locale to="/auth/signup" class="btn btn-primary mr-2">
        <i class="fa-solid fa-user-plus"/>
        <span class="hidden md:block md:ml-1">
          {{$t('component.navbar.prompt_signup')}}
        </span>
      </nuxt-link-locale>
      <nuxt-link-locale to="/auth/login" class="btn btn-soft">
        <i class="fa-solid fa-user-check"/>
        <span class="hidden md:block md:ml-1">
          {{$t('component.navbar.prompt_login')}}
        </span>
      </nuxt-link-locale>
    </div>
  </div>
</template>