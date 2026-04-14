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
      routes: (() => {
        const projects = require('./src/data/projects.json')
        const staticRoutes = ['/about', '/projects', '/explore', '/contact']
        const projectRoutes = projects.map(p => `/projects/${p.id}`)
        const allPaths = [...staticRoutes, ...projectRoutes]
        return [
          '/en/',
          '/zh/',
          ...allPaths.map(p => `/en${p}`),
          ...allPaths.map(p => `/zh${p}`),
        ]
      })(),
      renderer: new PuppeteerRenderer({
        renderAfterTime: 3000,
      }),
      postProcess(renderedRoute) {
        const { PAGE_META } = require('./src/seo/seoConfig.js')
        const route = renderedRoute.route

        // Project detail pages
        const projectMatch = route.match(/^\/(en|zh)\/projects\/(.+)$/)
        if (projectMatch) {
          const lang = projectMatch[1]
          const projectId = projectMatch[2]
          const projects = require('./src/data/projects.json')
          const project = projects.find(p => p.id === projectId)
          if (project) {
            const title = lang === 'zh' && project.title_zh ? project.title_zh : project.title
            const description = lang === 'zh' && project.description_zh ? project.description_zh : project.description
            renderedRoute.html = injectMeta(renderedRoute.html, {
              title: `${title} | YI-DA TSAI`,
              description,
              ogImage: `${BASE_URL}/images/projects/${project.id}/${project.ogImage ?? project.cover}`,
              ogUrl: `${BASE_URL}/${lang}/projects/${project.id}`,
              ogType: 'article',
            })
          }
          return renderedRoute
        }

        // Set <html lang> based on route language
        const langMatch = route.match(/^\/(en|zh)/)
        if (langMatch) {
          const routeLang = langMatch[1]
          renderedRoute.html = renderedRoute.html.replace(
            /(<html[^>]*)\slang="[^"]*"/,
            `$1 lang="${routeLang === 'zh' ? 'zh-TW' : 'en'}"`
          )
        }

        // Static pages: home, about, projects, explore, contact
        const staticMatch = route.match(/^\/(en|zh)(\/.*)?$/)
        if (staticMatch) {
          const lang = staticMatch[1]
          const suffix = (staticMatch[2] ?? '/').replace(/^\//, '')
          const pageKey = suffix === '' || suffix === '/' ? 'home'
            : suffix === 'about' ? 'about'
            : suffix === 'projects' ? 'projects'
            : suffix === 'explore' ? 'explore'
            : suffix === 'contact' ? 'contact'
            : null
          if (pageKey) {
            const pageMeta = PAGE_META[pageKey]?.[lang] ?? PAGE_META[pageKey]?.en
            const ogUrl = pageKey === 'home'
              ? `${BASE_URL}/${lang}/`
              : `${BASE_URL}/${lang}/${suffix}`
            renderedRoute.html = injectMeta(renderedRoute.html, {
              title: pageMeta?.title ?? 'YI-DA TSAI',
              description: pageMeta?.description ?? '',
              ogImage: `${BASE_URL}/images/og-default.jpg?v=2`,
              ogUrl,
              ogType: 'website',
            })
          }
        }

        return renderedRoute
      },
    }),
  ].filter(Boolean),
})
