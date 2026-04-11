import HeroBlock from "../../components/blocks/HeroBlock";
import TitleBlock from "../../components/blocks/TitleBlock";
import ImgSet1bBlock from "../../components/blocks/ImgSet1bBlock";
import ImgSet2aBlock from "../../components/blocks/ImgSet2aBlock";
import ImgSet2bBlock from "../../components/blocks/ImgSet2bBlock";
import ImgSet3bBlock from "../../components/blocks/ImgSet3bBlock";
import ImgTextBlock from "../../components/blocks/ImgTextBlock";
import QuoteBlock from "../../components/blocks/QuoteBlock";
import DiscoverMoreBlock from "../../components/blocks/DiscoverMoreBlock";
import projects from "../../data/projects.json";
import { usePagePreloader } from "../../hooks/usePagePreloader";
import { pickResponsiveSrc } from "../../utils/imgSrcSet";
import { useTranslation } from "../../hooks/useTranslation";
import { localizeProject } from "../../utils/projectLocale";

const BASE = "/images/projects/patterned-glass-notebook";

const project = projects.find((p) => p.id === "patterned-glass-notebook");
const PRELOAD_IMAGES = [
  pickResponsiveSrc(`${BASE}/08.webp`), // HeroBlock (CSS background)
  `${BASE}/title.svg`,
];

export default function PatternedGlassNotebook() {
  usePagePreloader(PRELOAD_IMAGES);
  const { language } = useTranslation();
  const lp = localizeProject(project, language);

  return (
    <main className="project-detail project-detail--blocks">
      <HeroBlock image={`${BASE}/08.webp`} project={lp} />

      <TitleBlock
        labelColor="var(--sage-300)"
        title={lp.title}
        description={lp.description}
        bgColor="var(--sage-700)"
        emptyColor="var(--sage-950)"
        fillColor="var(--sage-100)"
      />

      <ImgSet2aBlock
        items={[
          {
            src: `${BASE}/03.webp`,
            title: { en: "Everyday Object", zh: "日常物件" },
            subtitle: "(02)",
          },
          {
            src: `${BASE}/01.webp`,
            title: { en: "Memory in Material", zh: "物質中的記憶" },
            subtitle: "(01)",
          },
        ]}
        reverse
      />

      <QuoteBlock
        text={{
          en: "What we call the beginning is often the end, and to make an end is to make a beginning.",
          zh: "我們所謂的開始，往往就是終點；而結束，即是另一個開始。",
        }}
        author="T. S. Eliot"
        image={`${BASE}/title.svg`}
      />

      <ImgSet3bBlock
        items={[
          {
            src: `${BASE}/14.webp`,
            title: { en: "A Study of Texture", zh: "質感研究" },
            subtitle: "(03)",
          },
          {
            src: `${BASE}/13.webp`,
            title: { en: "Surface Detail", zh: "表面細節" },
            subtitle: "(04)",
          },
          {
            src: `${BASE}/12.webp`,
            title: { en: "Debossed Brass", zh: "黃銅壓紋" },
            subtitle: "(05)",
          },
        ]}
      />

      <ImgSet1bBlock
        src={`${BASE}/11.webp`}
        title={{ en: "Material Expression", zh: "材質表現" }}
        subtitle="(06)"
        reverse
      />

      <ImgSet2bBlock
        items={[
          {
            src: `${BASE}/04.webp`,
            title: { en: "Exposed Smyth Sewn Binding", zh: "裸背縫線裝幀" },
            subtitle: "(07)",
          },
          {
            src: `${BASE}/05.webp`,
            title: { en: "Memory in Glass", zh: "玻璃中的記憶" },
            subtitle: "(08)",
          },
        ]}
      />

      <ImgSet2aBlock
        items={[
          {
            src: `${BASE}/15.webp`,
            title: { en: "Quiet Detail", zh: "靜默細節" },
            subtitle: "(10)",
          },
          {
            src: `${BASE}/06.webp`,
            title: { en: "Form and Tactility", zh: "形式與觸感" },
            subtitle: "(09)",
          },
        ]}
        reverse
      />

      <ImgSet1bBlock
        src={`${BASE}/09.webp`}
        title={{ en: "Surface and Light", zh: "光與表面" }}
        subtitle="(11)"
      />

      <ImgTextBlock
        image={`${BASE}/16.webp`}
        title={{ en: "Patterned Glass Notebook", zh: "玻璃壓花筆記本" }}
        text={{
          en: [
            "This work preserves a fragment of everyday material culture, translating it into a contemporary form.",
            "Through texture, light, and touch, it invites a quiet reflection on memory and the value of things once familiar.",
          ],
          zh: [
            "本作品保存了日常物質文化的片段，將其轉化為當代形式。",
            "透過質感、光線與觸覺，喚起對記憶與曾經熟悉之物的靜默省思。",
          ],
        }}
        bgColor="var(--sage-700)"
        textColor="var(--sage-300)"
        titleColor="var(--sage-100)"
      />

      <DiscoverMoreBlock currentId="patterned-glass-notebook" />
    </main>
  );
}
