import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// https://vite.dev/config/
const isGithubPages = process.env.GITHUB_PAGES === 'true'
const base = isGithubPages ? '/kondate-loop/' : '/'

// Plugin to rewrite manifest.webmanifest paths for GitHub Pages
function manifestRewritePlugin(): Plugin {
  return {
    name: 'manifest-rewrite',
    writeBundle(options) {
      if (!isGithubPages || !options.dir) return

      const manifestPath = path.join(options.dir, 'manifest.webmanifest')
      if (fs.existsSync(manifestPath)) {
        let manifest = fs.readFileSync(manifestPath, 'utf-8')
        const parsed = JSON.parse(manifest)

        // Rewrite start_url
        parsed.start_url = base

        // Rewrite icon paths
        if (parsed.icons) {
          parsed.icons = parsed.icons.map((icon: { src: string }) => ({
            ...icon,
            src: icon.src.startsWith('/') ? `${base}${icon.src.slice(1)}` : icon.src
          }))
        }

        fs.writeFileSync(manifestPath, JSON.stringify(parsed, null, 2))
      }
    }
  }
}

export default defineConfig({
  base,
  appType: 'spa',
  plugins: [react(), manifestRewritePlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    allowedHosts: true,
  },
})
