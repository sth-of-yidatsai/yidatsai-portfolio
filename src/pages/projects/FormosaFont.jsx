import HeroBlock from "../../components/blocks/HeroBlock";
import TitleBlock from "../../components/blocks/TitleBlock";
import CarouselBlock from "../../components/blocks/CarouselBlock";
import ImgSet2aBlock from "../../components/blocks/ImgSet2aBlock";
import ImgSet3aBlock from "../../components/blocks/ImgSet3aBlock";
import ImgSet3bBlock from "../../components/blocks/ImgSet3bBlock";
import ImgTextBlock from "../../components/blocks/ImgTextBlock";
import QuoteBlock from "../../components/blocks/QuoteBlock";
import GlyphBlock from "../../components/blocks/GlyphBlock";
import projects from "../../data/projects.json";
import { usePagePreloader } from "../../hooks/usePagePreloader";

const BASE = "/images/projects/formosa-font";
const FONT_BASE = "/images/fonts/formosa-fonts";

// 各字型獨立定義在 module 層級，確保 ref 穩定（GlyphBlock useEffect deps）
const FONT_LYCORIS = [
  { name: "FormosaLycoris", url: `${FONT_BASE}/Lycoris.woff2` },
];
const FONT_LILIUM = [
  { name: "FormosaLilium", url: `${FONT_BASE}/Lilium.woff2` },
];
const FONT_MELASTOMA = [
  { name: "FormosaMelastoma", url: `${FONT_BASE}/Melastoma.woff2` },
];
const FONT_LYCOPODIUM = [
  { name: "FormosaLycopodium", url: `${FONT_BASE}/Lycopodium.woff2` },
];
const project = projects.find((p) => p.id === "formosa-font");
const PRELOAD_IMAGES = [
  `${BASE}/cover.webp`,
  ...project.images.map((f) => `${BASE}/${f}`),
  `${BASE}/title.svg`,
];

export default function FormosaFont() {
  usePagePreloader(PRELOAD_IMAGES);

  return (
    <main className="project-detail project-detail--blocks">
      <HeroBlock image={`${BASE}/04.webp`} project={project} />

      <TitleBlock
        title={project.title}
        description={project.description}
        bgColor="var(--linen-300)"
        emptyColor="var(--gray-400)"
        fillColor="var(--gray-800)"
      />

      <ImgSet3aBlock
        items={[
          {
            src: `${BASE}/03.webp`,
            title: "Formosa Font",
            subtitle: "Book Cover",
          },
          {
            src: `${BASE}/06.webp`,
            title: "Typography",
            subtitle: "Type Design",
          },
          {
            src: `${BASE}/07.webp`,
            title: "Botanical",
            subtitle: "Illustration",
          },
        ]}
      />

      <QuoteBlock
        text="Taiwan was once known as “Ilha Formosa,” meaning “beautiful island” in Portuguese."
        author="Portuguese sailors, 16th century"
        image={`${BASE}/title.svg`}
      />

      <CarouselBlock
        images={[
          `${BASE}/15.webp`,
          `${BASE}/18.webp`,
          `${BASE}/12.webp`,
          `${BASE}/14.webp`,
          `${BASE}/16.webp`,
        ]}
      />

      <ImgSet3bBlock
        items={[
          {
            src: `${BASE}/05.webp`,
            title: "Formosa Font",
            subtitle: "Book Cover",
          },
          {
            src: `${BASE}/10.webp`,
            title: "Typography",
            subtitle: "Type Design",
          },
          {
            src: `${BASE}/11.webp`,
            title: "Botanical",
            subtitle: "Illustration",
          },
        ]}
      />
      <ImgSet2aBlock
        items={[
          {
            src: `${BASE}/17.webp`,
            title: "Formosa Font",
            subtitle: "Book Cover",
          },
          {
            src: `${BASE}/13.webp`,
            title: "Typography",
            subtitle: "Type Design",
          },
        ]}
      />

      <ImgTextBlock
        image={`${BASE}/09.webp`}
        title="Formosa Fonts"
        text={[
          "Formosa Font is a botanical typeface collection inspired by Taiwan’s diverse plant life.",
          "While the complete series includes eight typefaces, this presentation highlights four selected works developed as my primary contributions. The remaining typefaces were created in collaboration with another designer.",
        ]}
        bgColor="var(--linen-300)"
        textColor="var(--gray-600)"
        titleColor="var(--gray-800)"
        reverse
      />

      <GlyphBlock fonts={FONT_LYCORIS} title="Lycoris" />
      <GlyphBlock fonts={FONT_LILIUM} title="Lilium" />
      <GlyphBlock fonts={FONT_MELASTOMA} title="Melastoma" />
      <GlyphBlock fonts={FONT_LYCOPODIUM} title="Lycopodium" />
    </main>
  );
}
