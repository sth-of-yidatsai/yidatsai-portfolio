export const SITE = {
  name: "Yi-Da Tsai 蔡易達",
  baseUrl: "https://yidatsai.com",
  defaultDescription:
    "Yi-Da Tsai (蔡易達) is a visual designer and frontend developer based in Taipei, Taiwan, specializing in typography, editorial design, and digital experiences.",
  defaultOgImage: "https://yidatsai.com/images/og-default.jpg",
};

export const PAGE_META = {
  home: {
    en: {
      title: "Yi-Da Tsai 蔡易達｜Visual Designer & Frontend Developer",
      description:
        "Yi-Da Tsai is a visual designer and frontend developer based in Taipei, Taiwan, specializing in typography, editorial design, and digital experiences.",
      ogImage: "https://yidatsai.com/images/og-default.jpg",
      ogLocale: "en_US",
    },
    zh: {
      title: "蔡易達｜視覺設計師與前端工程師",
      description:
        "蔡易達（Yi-Da Tsai）是台灣台北的視覺設計師與前端工程師，專注於字體排印、編輯設計與數位體驗。",
      ogImage: "https://yidatsai.com/images/og-default.jpg",
      ogLocale: "zh_TW",
    },
  },
  about: {
    en: {
      title: "About | YI-DA TSAI 蔡易達",
      description:
        "Yi-Da Tsai is a multidisciplinary designer based in Taipei, working between visual design and digital experience.",
      ogLocale: "en_US",
    },
    zh: {
      title: "關於 | 蔡易達 YI-DA TSAI",
      description:
        "蔡易達（Yi-Da Tsai）是台灣台北的視覺設計師，專注於編輯設計、書籍裝幀與字體排印系統。",
      ogLocale: "zh_TW",
    },
  },
  projects: {
    en: {
      title: "Projects | YI-DA TSAI 蔡易達",
      description:
        "Design projects by Yi-Da Tsai, covering editorial design, bookbinding, typography, and visual identity.",
      ogLocale: "en_US",
    },
    zh: {
      title: "作品集 | 蔡易達 YI-DA TSAI",
      description:
        "蔡易達（Yi-Da Tsai）的設計作品集，涵蓋編輯設計、書籍裝幀、字體排印與視覺識別。",
      ogLocale: "zh_TW",
    },
  },
  playground: {
    en: {
      title: "Playground | YI-DA TSAI",
      description:
        "Interactive experiments and explorations by graphic designer Yi-Da Tsai.",
    },
    zh: {
      title: "Playground | 蔡易達 YI-DA TSAI",
      description: "蔡易達的互動實驗與視覺探索。",
    },
  },
  contact: {
    en: {
      title: "Contact | YI-DA TSAI",
      description: "Get in touch with Yi-Da Tsai.",
    },
    zh: {
      title: "聯絡 | 蔡易達 YI-DA TSAI",
      description: "與蔡易達聯繫，討論您的設計需求。",
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

/**
 * Given a canonical URL like https://yidatsai.com/en/about,
 * returns the en + zh alternate URLs and x-default.
 */
export function buildAlternateUrls(canonicalUrl) {
  try {
    const url = new URL(canonicalUrl);
    const match = url.pathname.match(/^\/(en|zh)(\/.*)?$/);
    if (!match) return null;
    const suffix = match[2] || '/';
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
    language === "zh" && project.title_zh
      ? project.title_zh
      : project.title;
  const description =
    language === "zh" && project.description_zh
      ? project.description_zh
      : project.description;

  return {
    title: `${title} | YI-DA TSAI`,
    description: description ?? SITE.defaultDescription,
    ogImage: `${SITE.baseUrl}/images/projects/${project.id}/${project.ogImage ?? project.cover}`,
    ogLocale: language === "zh" ? "zh_TW" : "en_US",
    ogType: "article",
    keywords: [
      ...(language === "zh" && project.category_zh ? project.category_zh : project.category ?? []),
      ...(language === "zh" && project.tags_zh ? project.tags_zh : project.tags ?? []),
    ].join(", "),
    jsonLd: buildProjectJsonLd(project, language),
  };
}

export function buildProjectJsonLd(project, language = "en") {
  const title =
    language === "zh" && project.title_zh ? project.title_zh : project.title;
  const description =
    language === "zh" && project.description_zh
      ? project.description_zh
      : project.description;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        name: title,
        description: description,
        creator: {
          "@type": "Person",
          name: "Yi-Da Tsai",
          alternateName: "蔡易達",
          url: SITE.baseUrl,
        },
        dateCreated: String(project.year),
        image: `${SITE.baseUrl}/images/projects/${project.id}/${project.cover}`,
        url: `${SITE.baseUrl}/${language}/projects/${project.id}`,
        genre: project.category,
        keywords: project.tags?.join(", "),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${SITE.baseUrl}/${language}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: language === "zh" ? "作品集" : "Projects",
            item: `${SITE.baseUrl}/${language}/projects`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: title,
            item: `${SITE.baseUrl}/${language}/projects/${project.id}`,
          },
        ],
      },
    ],
  };
}
