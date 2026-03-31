import { useEffect } from "react";
import { SITE } from "../seo/seoConfig";

/**
 * Imperatively manages <head> meta tags for SEO.
 * All injected elements are marked with data-seo="managed" for clean removal on navigation.
 */
export function useMeta({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  ogType = "website",
  twitterCard = "summary_large_image",
  keywords,
  jsonLd,
} = {}) {
  useEffect(() => {
    const currentUrl = window.location.href;
    const resolvedOgUrl = ogUrl ?? currentUrl;
    const resolvedOgTitle = ogTitle ?? title ?? SITE.name;
    const resolvedOgDescription = ogDescription ?? description ?? SITE.defaultDescription;
    const resolvedOgImage = ogImage ?? SITE.defaultOgImage;

    const created = [];

    function setMeta(attrs) {
      const el = document.createElement("meta");
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      el.setAttribute("data-seo", "managed");
      document.head.appendChild(el);
      created.push(el);
    }

    function setLink(attrs) {
      const el = document.createElement("link");
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      el.setAttribute("data-seo", "managed");
      document.head.appendChild(el);
      created.push(el);
    }

    // Description
    if (description) setMeta({ name: "description", content: description });
    if (keywords) setMeta({ name: "keywords", content: keywords });

    // Open Graph
    setMeta({ property: "og:title", content: resolvedOgTitle });
    setMeta({ property: "og:description", content: resolvedOgDescription });
    setMeta({ property: "og:image", content: resolvedOgImage });
    setMeta({ property: "og:url", content: resolvedOgUrl });
    setMeta({ property: "og:type", content: ogType });
    setMeta({ property: "og:site_name", content: SITE.name });

    // Twitter Card
    setMeta({ name: "twitter:card", content: twitterCard });
    setMeta({ name: "twitter:title", content: resolvedOgTitle });
    setMeta({ name: "twitter:description", content: resolvedOgDescription });
    setMeta({ name: "twitter:image", content: resolvedOgImage });

    // Canonical — upsert a single element
    let canonical = document.querySelector("link[rel='canonical'][data-seo='managed']");
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      canonical.setAttribute("data-seo", "managed");
      document.head.appendChild(canonical);
      created.push(canonical);
    }
    canonical.setAttribute("href", resolvedOgUrl);

    // JSON-LD structured data
    let jsonLdScript = null;
    if (jsonLd) {
      jsonLdScript = document.createElement("script");
      jsonLdScript.type = "application/ld+json";
      jsonLdScript.setAttribute("data-seo", "managed");
      jsonLdScript.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(jsonLdScript);
      created.push(jsonLdScript);
    }

    return () => {
      created.forEach((el) => el.parentNode?.removeChild(el));
    };
  }, [title, description, ogTitle, ogDescription, ogImage, ogUrl, ogType, twitterCard, keywords, jsonLd]);
}
