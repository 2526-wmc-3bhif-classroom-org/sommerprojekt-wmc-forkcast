// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  css: ["./app/assets/tailwind.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  app: {
    baseURL: '/sommerprojekt-wmc-forkcast'
  }
})
