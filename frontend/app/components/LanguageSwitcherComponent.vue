<script setup lang="ts">
const { locales, locale, setLocale } = useI18n();

function changeLanguage(code: any) {
  if (locale.value == code) return;
  setLocale(code);
  (document.activeElement as HTMLElement).blur();
}
</script>

<template>
  <div class="dropdown dropdown-end">
    <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
      <i class="fa-solid fa-language"/>
    </div>
    <ul tabindex="0" class="menu menu-md dropdown-content bg-base-100 rounded-box z-1 mt-3 p-2 shadow">
      <li v-for="l in locales">
        <span @click="changeLanguage(l.code)">
          <i class="fa-solid fa-language"/>
          <span>{{ l.name }}</span>
        </span>
      </li>
    </ul>
  </div>
</template>