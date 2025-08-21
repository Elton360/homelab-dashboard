import { fileURLToPath } from 'url'
import graphql from '@rollup/plugin-graphql'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const fromRoot = (path) => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig(({ mode }) => ({
  plugins: [react(), graphql()],
  resolve: {
    alias: {
      // Internal-only services, configured per deployment (gitignored),
      // are only bundled with `--mode internal`
      '@internal-services':
        mode === 'internal'
          ? fromRoot('./src/internal/services.jsx')
          : fromRoot('./src/internal.empty.js'),
    },
  },
}))
