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
      "Yi-Da Tsai (蔡易達) is a visual designer and frontend developer based in Taipei, Taiwan, specializing in typography, editorial design, and digital experiences.",
    ogImage: "https://yidatsai.com/images/og-default.jpg",
  },
  about: {
    title: "About | YI-DA TSAI",
    description:
      "Learn about Yi-Da Tsai — a graphic designer with a focus on editorial, book design, and typographic systems.",
  },
  projects: {
    title: "Projects | YI-DA TSAI",
    description:
      "Selected works by Yi-Da Tsai across editorial design, book binding, typography, and visual identity.",
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
    ogImage: `${SITE.baseUrl}/images/projects/${project.id}/${project.cover}`,
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
