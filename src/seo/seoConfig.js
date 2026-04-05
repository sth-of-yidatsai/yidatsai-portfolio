export const SITE = {
  name: "Yi-Da Tsai 蔡易達",
  baseUrl: "https://yidatsai.com",
  defaultDescription:
    "Yi-Da Tsai (蔡易達) is a visual designer and frontend developer based in Taipei, Taiwan, specializing in typography, editorial design, and digital experiences.",
  defaultOgImage: "https://yidatsai.com/images/og-default.jpg",
};

export const PAGE_META = {
  home: {
    title: "Yi-Da Tsai 蔡易達｜Visual Designer & Frontend Developer",
    description:
      "Yi-Da Tsai（蔡易達）是台灣台北的視覺設計師與前端工程師，專注於字體設計、編輯設計與數位體驗。",
    ogImage: "https://yidatsai.com/images/og-default.jpg",
  },
  about: {
    title: "About | YI-DA TSAI 蔡易達",
    description:
      "蔡易達（Yi-Da Tsai）是台灣台北的視覺設計師，專注於編輯設計、書籍裝幀與字體排印系統。",
  },
  projects: {
    title: "Projects | YI-DA TSAI 蔡易達",
    description:
      "蔡易達（Yi-Da Tsai）的設計作品集，涵蓋編輯設計、書籍裝幀、字體排印與視覺識別。",
  },
  playground: {
    title: "Playground | YI-DA TSAI",
    description:
      "Interactive experiments and explorations by graphic designer Yi-Da Tsai.",
  },
  contact: {
    title: "Contact | YI-DA TSAI",
    description: "Get in touch with Yi-Da Tsai.",
  },
  notFound: {
    title: "Not Found | YI-DA TSAI",
    description: "Page not found.",
  },
};

export function buildProjectMeta(project) {
  if (!project) return PAGE_META.projects;
  return {
    title: `${project.title} | YI-DA TSAI`,
    description: project.description ?? SITE.defaultDescription,
    ogImage: `${SITE.baseUrl}/images/projects/${project.id}/${project.ogImage ?? project.cover}`,
    ogType: "article",
    keywords: [
      ...(project.category ?? []),
      ...(project.tags ?? []),
    ].join(", "),
    jsonLd: buildProjectJsonLd(project),
  };
}

export function buildProjectJsonLd(project) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    creator: {
      "@type": "Person",
      name: "Yi-Da Tsai",
      alternateName: "蔡易達",
      url: SITE.baseUrl,
    },
    dateCreated: String(project.year),
    image: `${SITE.baseUrl}/images/projects/${project.id}/${project.cover}`,
    url: `${SITE.baseUrl}/projects/${project.id}`,
    genre: project.category,
    keywords: project.tags?.join(", "),
  };
}
