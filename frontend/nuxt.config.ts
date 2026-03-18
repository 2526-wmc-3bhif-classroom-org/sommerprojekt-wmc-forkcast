// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

const nativeElements = ["calendar-date", "calendar-month"]

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ["./app/assets/css/tailwind.css", "./app/assets/css/animations.css", "./app/assets/css/app.css"],
  modules: [
    "@nuxtjs/i18n",
    '@nuxt/image',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    'pinia-plugin-persistedstate'
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  app: {
    baseURL: '/sommerprojekt-wmc-forkcast'
  },
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => nativeElements.includes(tag)
    }
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api'
    }
  },
  i18n: {
    locales: [
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json'},
      { code: 'de', language: 'de-AT', name: 'Deutsch', file: 'de.json'}
    ],
    defaultLocale: 'en'
  }
})