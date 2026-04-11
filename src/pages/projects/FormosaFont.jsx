import HeroBlock from "../../components/blocks/HeroBlock";
import TitleBlock from "../../components/blocks/TitleBlock";
import CarouselBlock from "../../components/blocks/CarouselBlock";
import ImgSet2aBlock from "../../components/blocks/ImgSet2aBlock";
import ImgSet3aBlock from "../../components/blocks/ImgSet3aBlock";
import ImgSet3bBlock from "../../components/blocks/ImgSet3bBlock";
import ImgTextBlock from "../../components/blocks/ImgTextBlock";
import QuoteBlock from "../../components/blocks/QuoteBlock";
import GlyphBlock from "../../components/blocks/GlyphBlock";
import DiscoverMoreBlock from "../../components/blocks/DiscoverMoreBlock";
import SpaceBlock from "../../components/blocks/SpaceBlock";
import projects from "../../data/projects.json";
import { usePagePreloader } from "../../hooks/usePagePreloader";
import { pickResponsiveSrc } from "../../utils/imgSrcSet";
import { useTranslation } from "../../hooks/useTranslation";
import { localizeProject } from "../../utils/projectLocale";

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
  pickResponsiveSrc(`${BASE}/04.webp`), // HeroBlock (CSS background)
  `${BASE}/title.svg`,
];

export default function FormosaFont() {
  usePagePreloader(PRELOAD_IMAGES);
  const { language } = useTranslation();
  const lp = localizeProject(project, language);

  return (
    <main className="project-detail project-detail--blocks">
      <HeroBlock image={`${BASE}/04.webp`} project={lp} />

      <TitleBlock
        title={lp.title}
        description={lp.description}
        bgColor="var(--linen-300)"
        emptyColor="var(--gray-400)"
        fillColor="var(--gray-800)"
      />

      <ImgSet3aBlock
        items={[
          {
            src: `${BASE}/03.webp`,
            title: { en: "Botanical Typeface Series", zh: "植物字型系列" },
            subtitle: "(01)",
          },
          {
            src: `${BASE}/06.webp`,
            title: { en: "Cover Design", zh: "封面設計" },
            subtitle: "(02)",
          },
          {
            src: `${BASE}/07.webp`,
            title: { en: "Back Cover Design", zh: "封底設計" },
            subtitle: "(03)",
          },
        ]}
      />

      <QuoteBlock
        text={{
          en: 'Taiwan was once known as \u201cIlha Formosa,\u201d meaning \u201cbeautiful island\u201d in Portuguese.',
          zh: "台灣曾被葡萄牙人稱為「Ilha Formosa」，意為「美麗之島」。",
        }}
        author={{ en: "Portuguese sailors, 16th century", zh: "葡萄牙水手，十六世紀" }}
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
            title: { en: "Spine", zh: "書脊" },
            subtitle: "(04)",
          },
          {
            src: `${BASE}/10.webp`,
            title: { en: "Foil Stamping", zh: "燙金工藝" },
            subtitle: "(05)",
          },
          {
            src: `${BASE}/11.webp`,
            title: { en: "Gold Foil Detail", zh: "燙金細節" },
            subtitle: "(06)",
          },
        ]}
      />

      <ImgSet2aBlock
        items={[
          {
            src: `${BASE}/17.webp`,
            title: { en: "Interior", zh: "內頁" },
            subtitle: "(07)",
          },
          {
            src: `${BASE}/13.webp`,
            title: { en: "Paper Texture", zh: "紙張質感" },
            subtitle: "(08)",
          },
        ]}
      />

      <ImgTextBlock
        image={`${BASE}/09.webp`}
        title={{ en: "Formosa Fonts", zh: "福爾摩沙字型" }}
        text={{
          en: [
            "Formosa Font is a botanical typeface collection inspired by Taiwan's diverse plant life.",
            "While the complete series includes eight typefaces, this presentation highlights four selected works developed as my primary contributions. The remaining typefaces were created in collaboration with another designer.",
          ],
          zh: [
            "福爾摩沙字型是一套以台灣多元植物為靈感來源的植物風格字型集。",
            "完整系列共收錄八款字型，本頁展示其中四款由本人主導設計的作品，其餘字型由另一位設計師共同創作完成。",
          ],
        }}
        bgColor="var(--linen-300)"
        textColor="var(--gray-600)"
        titleColor="var(--gray-800)"
        reverse
      />

      <GlyphBlock fonts={FONT_LYCORIS} title="Lycoris" />
      <GlyphBlock fonts={FONT_LILIUM} title="Lilium" />
      <GlyphBlock fonts={FONT_MELASTOMA} title="Melastoma" />
      <GlyphBlock fonts={FONT_LYCOPODIUM} title="Lycopodium" />

      <SpaceBlock space="var(--space-xl)" />

      <DiscoverMoreBlock currentId="formosa-font" />
    </main>
  );
}
