// content.config.ts - content collection configuration
import { defineContentConfig, defineCollection } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    legal: defineCollection({
      type: 'page',
      source: 'app/content/**'
    })
  }
})
