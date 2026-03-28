import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/._*', // macOS metadata files (external SSD artifact)
    ],
  },
})
