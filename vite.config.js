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

const BASE_URL = 'https://yidatsai.com'

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function injectMeta(html, { title, description, ogImage, ogUrl, ogType }) {
  return html
    .replace(/(<title>)[^<]*(<\/title>)/, `$1${escapeHtml(title)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/,  `$1${escapeHtml(title)}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/,  `$1${escapeHtml(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/,  `$1${escapeHtml(description)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/,  `$1${escapeHtml(description)}$2`)
    .replace(/(<meta property="og:image" content=")[^"]*(")/,  `$1${ogImage}$2`)
    .replace(/(<meta name="twitter:image" content=")[^"]*(")/,  `$1${ogImage}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/,  `$1${ogUrl}$2`)
    .replace(/(<link rel="canonical"[^>]*href=")[^"]*(")/,  `$1${ogUrl}$2`)
    .replace(/(<meta property="og:type" content=")[^"]*(")/,  `$1${ogType}$2`)
}

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
      postProcess(renderedRoute) {
        const projectMatch = renderedRoute.route.match(/^\/projects\/(.+)$/)
        if (projectMatch) {
          const projectId = projectMatch[1]
          const projects = require('./src/data/projects.json')
          const project = projects.find(p => p.id === projectId)
          if (project) {
            renderedRoute.html = injectMeta(renderedRoute.html, {
              title: `${project.title} | YI-DA TSAI`,
              description: project.description,
              ogImage: `${BASE_URL}/images/projects/${project.id}/${project.ogImage ?? project.cover}`,
              ogUrl: `${BASE_URL}/projects/${project.id}`,
              ogType: 'article',
            })
          }
        }
        return renderedRoute
      },
    }),
  ].filter(Boolean),
})
