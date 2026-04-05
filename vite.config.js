import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'
import process from 'process'

// vite-plugin-prerender's .mjs has a `require` bug — force CJS version
const require = createRequire(import.meta.url)
const vitePrerender = require('vite-plugin-prerender')
const { PuppeteerRenderer } = vitePrerender

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Vercel / CI environments don't have Puppeteer's system dependencies.
// Prerender runs locally only; Googlebot executes JS so SEO is still effective.
const isCI = !!process.env.VERCEL || !!process.env.CI

export default defineConfig({
  plugins: [
    react(),
    !isCI && vitePrerender({
      staticDir: path.resolve(__dirname, 'dist'),
      routes: [
        '/',
        '/about',
        '/projects',
        '/playground',
        '/contact',
        '/projects/formosa-font',
        '/projects/patterned-glass-notebook',
        '/projects/foucault-book-binding',
      ],
      renderer: new PuppeteerRenderer({
        renderAfterTime: 3000,
      }),
    }),
  ].filter(Boolean),
})
