# 蔡易達 Yi-Da Tsai — Portfolio

Personal portfolio of **Yi-Da Tsai (蔡易達)**, a visual designer and frontend developer based in Taipei, Taiwan, focused on typography, editorial design, and interactive web experiences.

Live site: https://yidatsai.com

## Tech

- React + Vite
- GSAP ScrollTrigger, Lenis smooth scroll
- File-based project pages with reusable block components
- Bilingual (en / zh-TW) routing with prerendered static HTML for SEO

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build     # generates sitemap, builds, and prerenders static HTML
npm run preview
```

## Structure

- `src/pages/` — route-level pages (Home, About, Projects, ProjectDetail, Contact)
- `src/pages/projects/` — individual project detail pages composed from `src/components/blocks/`
- `src/components/sections/` — section-level components per page
- `src/seo/seoConfig.js` — centralized SEO meta + JSON-LD
- `src/locales/{en,zh}.json` — translations
- `scripts/generate-sitemap.js` — builds `public/sitemap.xml` at prebuild time
