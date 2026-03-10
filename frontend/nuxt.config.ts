// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

const nativeElements = ["calendar-date", "calendar-month"]

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ["./app/assets/tailwind.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  app: {
    baseURL: '/sommerprojekt-wmc-forkcast',
  },
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => nativeElements.includes(tag)
    }
  }
})
