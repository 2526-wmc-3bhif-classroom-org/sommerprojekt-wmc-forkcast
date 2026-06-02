// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import * as fs from "node:fs";

const nativeElements = ["calendar-date", "calendar-month", "calendar-range"]

export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: {enabled: true},
    css: ["./app/assets/css/tailwind.css", "./app/assets/css/animations.css", "./app/assets/css/app.css"],
    modules: [
        "@nuxtjs/i18n",
        '@nuxt/image',
        '@pinia/nuxt',
        'pinia-plugin-persistedstate/nuxt',
        'pinia-plugin-persistedstate',
        '@nuxtjs/mdc'
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
            {code: 'en', language: 'en-US', name: 'English', file: 'en.json'},
            {code: 'de', language: 'de-AT', name: 'Deutsch', file: 'de.json'},
            {code: 'es', language: 'es-ES', name: 'Español', file: 'es.json'},
            {code: 'zh', language: 'zh-CN', name: '中文', file: 'zh.json'},
            {code: 'fr', language: 'fr-FR', name: 'Français', file: 'fr.json'},
            {code: 'tr', language: 'tr-TR', name: 'Türkçe', file: 'tr.json'}
        ],
        defaultLocale: 'en'
    },
    routeRules: {
        '/dashboard/**': { prerender: false },
        '/dashboard': { prerender: false },
    },
    nitro: {
        prerender: {
            ignore: [/dashboard/],
            routes: fs.readdirSync(path.resolve(__dirname, 'app/content'))
                .filter(file => file.endsWith('.md'))
                .map(file => `/${file.replace('.md', '')}`)
        }
    }
})