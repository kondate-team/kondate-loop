import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
const isGithubPages = process.env.GITHUB_PAGES === 'true'

export default defineConfig({
  base: isGithubPages ? '/kondate/' : '/',
  appType: 'spa',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
