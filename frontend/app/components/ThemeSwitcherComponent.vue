<script setup lang="ts">
import { useTheme, type ThemeChoice } from "~/composables/useTheme";

const { choice, setTheme } = useTheme();

const options: { value: ThemeChoice; icon: string }[] = [
  { value: "system", icon: "fa-desktop" },
  { value: "light", icon: "fa-sun" },
  { value: "dark", icon: "fa-moon" },
];

const currentIcon = computed(
  () => options.find((o) => o.value === choice.value)?.icon ?? "fa-circle-half-stroke",
);

function pick(value: ThemeChoice) {
  setTheme(value);
  (document.activeElement as HTMLElement).blur();
}
</script>

<template>
  <div class="dropdown dropdown-end">
    <div tabindex="0" role="button" aria-label="Theme" :data-tip="$t('component.navbar.theme')"
         class="btn btn-ghost btn-circle tooltip tooltip-bottom [--tt-bg:var(--color-base-200)] before:text-base-content before:font-normal">
      <i class="fa-solid" :class="currentIcon"/>
    </div>
    <ul tabindex="0" class="menu menu-md dropdown-content bg-base-100 rounded-box z-1 mt-3 p-2 shadow text-base-content">
      <li v-for="o in options" :key="o.value">
        <span @click="pick(o.value)" :class="{ 'menu-active': choice === o.value }">
          <i class="fa-solid w-4 text-center" :class="o.icon"/>
          <span>{{ $t('component.navbar.theme.' + o.value) }}</span>
        </span>
      </li>
    </ul>
  </div>
</template>
