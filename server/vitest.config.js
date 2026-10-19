import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    pool: 'forks', // Обходной путь для нативных модулей (better-sqlite3)
    poolOptions: {
      forks: {
        singleFork: true,
        maxForks: 1,
        minForks: 1,
      },
    },
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.js'],
      exclude: ['src/server.js'],
    },
  },
})
