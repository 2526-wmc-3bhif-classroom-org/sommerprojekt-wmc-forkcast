// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
import fs from 'node:fs';
import path from 'node:path';

const nativeElements = ["calendar-date", "calendar-month"]

const privacyPolicyPath = path.resolve('./app/pages/privacy-policy.vue');
let privacyPolicyLastUpdated = new Date().toISOString(); 

try {
  if (fs.existsSync(privacyPolicyPath)) {
    const stats = fs.statSync(privacyPolicyPath);
    privacyPolicyLastUpdated = stats.mtime.toISOString();
  }
} catch (e) {
  console.warn('Could not read privacy policy file stats:', e);
}

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
      privacyPolicyLastUpdated,
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api'
    }
  },
  i18n: {
    locales: [
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json'},
      { code: 'de', language: 'de-AT', name: 'Deutsch', file: 'de.json'}
    ],
    defaultLocale: 'en'
  },
  image: {

  }
})