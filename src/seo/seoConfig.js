export const SITE = {
  name: "Yi-Da Tsai 蔡易達",
  baseUrl: "https://yidatsai.com",
  defaultDescription:
    "Yi-Da Tsai (蔡易達) is a multidisciplinary designer based in Taipei, Taiwan, working across visual design, typography, editorial design, and frontend development.",
  defaultOgImage: "https://yidatsai.com/images/og-default.jpg?v=2",
  sameAs: [
    "https://x.com/Yida_Tsai",
    "https://www.behance.net/sth_of_yidatsai",
    "https://github.com/sth-of-yidatsai",
  ],
};

// ── Entity IDs ──────────────────────────────────────────────────
const PERSON_ID = `${SITE.baseUrl}/#person`;
const WEBSITE_ID = `${SITE.baseUrl}/#website`;

// ── FAQ content (bilingual) ─────────────────────────────────────
// Used both for FAQPage JSON-LD and the FaqSection component.
export const FAQ_DATA = {
  en: {
    title: "About Me",
    items: [
      {
        question: "Who is Yi-Da Tsai ?",
        answer:
          "Yi-Da Tsai (蔡易達) is a multidisciplinary designer based in Taipei, Taiwan, working across visual design, typography, editorial design, and frontend development. He graduated from the Department of Visual Communication Design at National Taiwan University of Arts.",
      },
      {
        question: "What design services does Yi-Da Tsai offer ?",
        answer:
          "Yi-Da Tsai offers interface design (UI/UX), web development, brand and visual design, editorial and print design, and creative direction. Services include logo design, brand identity, packaging, print materials, website design, and design systems.",
      },
      {
        question: "Where is Yi-Da Tsai based ?",
        answer:
          "Yi-Da Tsai is based in Taipei, Taiwan, and works with clients across Taiwan and internationally.",
      },
      {
        question: "What programming frameworks does Yi-Da Tsai use ?",
        answer:
          "Yi-Da Tsai uses React for frontend development, building scalable and interactive digital systems.",
      },
      {
        question: "What notable projects has Yi-Da Tsai completed ?",
        answer:
          "Yi-Da Tsai's notable projects include The Book of Formosa Font (2022), a typographic exploration of Taiwan's biodiversity; Patterned Glass — Notebook & Box Design (2024), reinterpreting traditional glass craftsmanship; and Foucault — A Study in Knowledge & Order (2024), an editorial design of Michel Foucault's philosophical works.",
      },
    ],
  },
  zh: {
    title: "關於我",
    items: [
      {
        question: "蔡易達是誰？",
        answer:
          "蔡易達（Yi-Da Tsai）是現居台灣台北的跨領域設計師，專注於視覺設計、字體設計、編輯設計與前端開發。畢業於國立臺灣藝術大學視覺傳達設計學系。",
      },
      {
        question: "蔡易達提供哪些設計服務？",
        answer:
          "蔡易達提供介面設計（UI/UX）、網頁開發、品牌與視覺設計、編輯與印刷設計，以及創意指導等服務。包含標誌設計、品牌識別、包裝設計、印刷物、網站設計與設計系統。",
      },
      {
        question: "蔡易達在哪裡工作？",
        answer: "蔡易達現居台灣台北，並與台灣及國際客戶合作。",
      },
      {
        question: "蔡易達使用哪些前端技術？",
        answer:
          "蔡易達使用 React 進行前端開發，打造可擴展且具互動性的數位系統。",
      },
      {
        question: "蔡易達有哪些代表作品？",
        answer:
          "蔡易達的代表作品包含：《福爾摩沙字體書籍設計》（2022），探索台灣生物多樣性的字體設計；《玻璃壓花 — 筆記本與盒裝設計》（2024），重新詮釋台灣傳統玻璃工藝；以及《傅柯 — 知識與秩序的探索》（2024），詮釋傅柯哲學著作的裝幀設計。",
      },
    ],
  },
};

export const PAGE_META = {
  home: {
    en: {
      title: "Yi-Da Tsai 蔡易達｜Visual Designer & Frontend Developer",
      description:
        "Yi-Da Tsai is a multidisciplinary designer based in Taipei, Taiwan, working across visual design, typography, editorial design, and frontend development.",
      ogImage: "https://yidatsai.com/images/og-default.jpg?v=2",
      ogLocale: "en_US",
    },
    zh: {
      title: "蔡易達｜視覺設計師與前端工程師",
      description:
        "蔡易達（Yi-Da Tsai）是台灣台北的跨領域設計師，專注於視覺設計、字體設計、編輯設計與前端開發。",
      ogImage: "https://yidatsai.com/images/og-default.jpg?v=2",
      ogLocale: "zh_TW",
    },
  },
  about: {
    en: {
      title: "About | YI-DA TSAI 蔡易達",
      description:
        "About Yi-Da Tsai — a Taipei-based multidisciplinary designer working across visual design, typography, editorial design, and frontend development, extending design into interactive digital systems with React.",
      ogLocale: "en_US",
    },
    zh: {
      title: "關於 | 蔡易達 YI-DA TSAI",
      description:
        "關於蔡易達 — 現居台北的跨領域設計師，專注於視覺設計、字體設計、編輯設計與前端開發，並透過 React 將設計延伸至可互動的數位系統。",
      ogLocale: "zh_TW",
    },
  },
  projects: {
    en: {
      title: "Projects | YI-DA TSAI 蔡易達",
      description:
        "Design projects by Yi-Da Tsai, spanning visual design, typography, editorial design, and frontend development.",
      ogLocale: "en_US",
    },
    zh: {
      title: "專案 | 蔡易達 YI-DA TSAI",
      description:
        "蔡易達（Yi-Da Tsai）的設計作品，涵蓋視覺設計、字體設計、編輯設計與前端開發等跨領域實踐。",
      ogLocale: "zh_TW",
    },
  },
  explore: {
    en: {
      title: "Explore | YI-DA TSAI",
      description:
        "Interactive visual experiments and creative explorations by Yi-Da Tsai, a multidisciplinary designer in Taipei working at the intersection of code and design.",
    },
    zh: {
      title: "Explore | 蔡易達 YI-DA TSAI",
      description: "蔡易達的互動視覺實驗與創意探索，結合程式與設計的跨界嘗試。",
    },
  },
  contact: {
    en: {
      title: "Contact | YI-DA TSAI",
      description:
        "Contact Yi-Da Tsai to discuss your design project. Services include visual design, web design, brand identity, editorial design, and frontend development. Based in Taipei, working internationally.",
    },
    zh: {
      title: "聯絡 | 蔡易達 YI-DA TSAI",
      description:
        "與蔡易達聯繫，討論您的設計需求。提供視覺設計、網頁設計、品牌識別、編輯設計與前端開發服務，現居台北，接受國際委案。",
    },
  },
  notFound: {
    en: {
      title: "Not Found | YI-DA TSAI",
      description: "Page not found.",
    },
    zh: {
      title: "找不到頁面 | YI-DA TSAI",
      description: "找不到此頁面。",
    },
  },
};

// ── Internal helpers ────────────────────────────────────────────

const BREADCRUMB_LABELS = {
  home: { en: "Home", zh: "首頁" },
  about: { en: "About", zh: "關於" },
  projects: { en: "Projects", zh: "專案" },
  explore: { en: "Explore", zh: "探索" },
  contact: { en: "Contact", zh: "聯絡" },
};

function _breadcrumbItems(pageKey, lang) {
  const l = lang === "zh" ? "zh" : "en";
  return [
    {
      "@type": "ListItem",
      position: 1,
      name: BREADCRUMB_LABELS.home[l],
      item: `${SITE.baseUrl}/${l}/`,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: BREADCRUMB_LABELS[pageKey][l],
      item: `${SITE.baseUrl}/${l}/${pageKey}`,
    },
  ];
}

function _faqEntities(lang) {
  const l = lang === "zh" ? "zh" : "en";
  return (FAQ_DATA[l] ?? FAQ_DATA.en).items.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  }));
}

// ── Public utilities ────────────────────────────────────────────

export function buildAlternateUrls(canonicalUrl) {
  try {
    const url = new URL(canonicalUrl);
    const match = url.pathname.match(/^\/(en|zh)(\/.*)?$/);
    if (!match) return null;
    const suffix = match[2] || "/";
    return {
      en: `${SITE.baseUrl}/en${suffix}`,
      zh: `${SITE.baseUrl}/zh${suffix}`,
      xDefault: `${SITE.baseUrl}/en${suffix}`,
    };
  } catch {
    return null;
  }
}

export function getPageMeta(key, language = "en") {
  const page = PAGE_META[key];
  if (!page) return {};
  return page[language] ?? page.en ?? {};
}

export function buildProjectMeta(project, language = "en") {
  if (!project) return getPageMeta("projects", language);

  const title =
    language === "zh" && project.title_zh ? project.title_zh : project.title;
  const description =
    language === "zh" && project.description_zh
      ? project.description_zh
      : project.description;

  return {
    title: `${title} | YI-DA TSAI`,
    description: description ?? SITE.defaultDescription,
    ogUrl: `${SITE.baseUrl}/${language}/projects/${project.id}`,
    ogImage: `${SITE.baseUrl}/images/projects/${project.id}/${project.ogImage ?? project.cover}`,
    ogLocale: language === "zh" ? "zh_TW" : "en_US",
    ogType: "article",
    keywords: [
      ...(language === "zh" && project.category_zh
        ? project.category_zh
        : (project.category ?? [])),
      ...(language === "zh" && project.tags_zh
        ? project.tags_zh
        : (project.tags ?? [])),
    ].join(", "),
    jsonLd: buildProjectJsonLd(project, language),
  };
}

// ── JSON-LD builders ────────────────────────────────────────────

/**
 * Home page: WebPage with speakable spec, linked to the Person entity.
 * The full Person + WebSite entities live in index.html as static JSON-LD.
 */
export function buildHomeJsonLd(language = "en") {
  const l = language === "zh" ? "zh" : "en";
  const meta = PAGE_META.home[l] ?? PAGE_META.home.en;
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE.baseUrl}/${l}/`,
    url: `${SITE.baseUrl}/${l}/`,
    name: meta.title,
    description: meta.description,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": PERSON_ID },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".sr-only", "[data-speakable]"],
    },
  };
}

/**
 * BreadcrumbList only — for pages without a richer page schema
 * (contact, explore). About and Projects use their own builders.
 */
export function buildBreadcrumbJsonLd(pageKey, language = "en") {
  if (pageKey === "home" || !BREADCRUMB_LABELS[pageKey]) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: _breadcrumbItems(pageKey, language),
  };
}

/**
 * About page: ProfilePage + FAQPage + BreadcrumbList.
 * mainEntity references the Person @id defined in index.html.
 */
export function buildAboutJsonLd(language = "en") {
  const l = language === "zh" ? "zh" : "en";
  const meta = PAGE_META.about[l] ?? PAGE_META.about.en;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        url: `${SITE.baseUrl}/${l}/about`,
        name: meta.title,
        description: meta.description,
        mainEntity: { "@id": PERSON_ID },
      },
      {
        "@type": "FAQPage",
        mainEntity: _faqEntities(l),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: _breadcrumbItems("about", l),
      },
    ],
  };
}

/**
 * Projects listing page: ItemList + BreadcrumbList.
 */
export function buildProjectsJsonLd(projects = [], language = "en") {
  const l = language === "zh" ? "zh" : "en";
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: l === "zh" ? "蔡易達設計作品" : "Design Projects by Yi-Da Tsai",
        url: `${SITE.baseUrl}/${l}/projects`,
        itemListElement: projects.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: l === "zh" && p.title_zh ? p.title_zh : p.title,
          url: `${SITE.baseUrl}/${l}/projects/${p.id}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: _breadcrumbItems("projects", l),
      },
    ],
  };
}

/**
 * Project detail page: CreativeWork + BreadcrumbList.
 * Creator references Person @id — no duplicate entity definition.
 */
export function buildProjectJsonLd(project, language = "en") {
  const title =
    language === "zh" && project.title_zh ? project.title_zh : project.title;
  const description =
    language === "zh" && project.description_zh
      ? project.description_zh
      : project.description;
  const l = language === "zh" ? "zh" : "en";

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        name: title,
        description: description,
        creator: { "@id": PERSON_ID },
        dateCreated: String(project.year),
        dateModified: String(project.year),
        image: `${SITE.baseUrl}/images/projects/${project.id}/${project.cover}`,
        url: `${SITE.baseUrl}/${l}/projects/${project.id}`,
        genre: project.category,
        keywords: project.tags?.join(", "),
        about: project.tags?.map((tag) => ({ "@type": "Thing", name: tag })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: BREADCRUMB_LABELS.home[l],
            item: `${SITE.baseUrl}/${l}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: BREADCRUMB_LABELS.projects[l],
            item: `${SITE.baseUrl}/${l}/projects`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: title,
            item: `${SITE.baseUrl}/${l}/projects/${project.id}`,
          },
        ],
      },
    ],
  };
}
