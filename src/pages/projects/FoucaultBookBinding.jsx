import HeroBlock from "../../components/blocks/HeroBlock";
import TitleBlock from "../../components/blocks/TitleBlock";
import ImgSet2aBlock from "../../components/blocks/ImgSet2aBlock";
import ImgSet2bBlock from "../../components/blocks/ImgSet2bBlock";
import ImgSet3bBlock from "../../components/blocks/ImgSet3bBlock";
import ImgSet1aBlock from "../../components/blocks/ImgSet1aBlock";
import ImgTextBlock from "../../components/blocks/ImgTextBlock";
import QuoteBlock from "../../components/blocks/QuoteBlock";
import ImgSet4aBlock from "../../components/blocks/ImgSet4aBlock";
import DiscoverMoreBlock from "../../components/blocks/DiscoverMoreBlock";
import projects from "../../data/projects.json";
import { usePagePreloader } from "../../hooks/usePagePreloader";
import { pickResponsiveSrc } from "../../utils/imgSrcSet";
import { useTranslation } from "../../hooks/useTranslation";
import { localizeProject } from "../../utils/projectLocale";

const BASE = "/images/projects/foucault-book-binding";

const project = projects.find((p) => p.id === "foucault-book-binding");
const PRELOAD_IMAGES = [
  pickResponsiveSrc(`${BASE}/01.webp`), // HeroBlock (CSS background)
  `${BASE}/title.svg`,
];

export default function FoucaultBookBinding() {
  usePagePreloader(PRELOAD_IMAGES);
  const { language } = useTranslation();
  const lp = localizeProject(project, language);

  return (
    <main className="project-detail project-detail--blocks">
      <HeroBlock image={`${BASE}/01.webp`} project={lp} />

      <TitleBlock
        title={lp.title}
        description={lp.description}
        bgColor="var(--gray-100)"
        emptyColor="var(--gray-300)"
        fillColor="var(--gray-900)"
      />

      <ImgSet3bBlock
        items={[
          {
            src: `${BASE}/06.webp`,
            title: { en: "Exposed Smyth Sewn Binding", zh: "裸背縫線裝幀" },
            subtitle: "(01)",
          },
          {
            src: `${BASE}/16.webp`,
            title: { en: "The Order of Things", zh: "事物的秩序" },
            subtitle: "(02)",
          },
          {
            src: `${BASE}/20.webp`,
            title: { en: "Structural Order", zh: "結構秩序" },
            subtitle: "(03)",
          },
        ]}
      />

      <QuoteBlock
        text={{
          en: "Order is, at one and the same time, that which is given in things and that which must be discovered.",
          zh: "秩序既是事物本身所賦予的，也是有待我們去發現的。",
        }}
        author="Michel Foucault"
        image={`${BASE}/title.svg`}
      />

      <ImgSet2aBlock
        items={[
          {
            src: `${BASE}/11.webp`,
            title: { en: "The Archaeology of Knowledge", zh: "知識的考掘學" },
            subtitle: "(04)",
          },
          {
            src: `${BASE}/07.webp`,
            title: { en: "Typographic Hierarchy", zh: "字型排版層級" },
            subtitle: "(05)",
          },
        ]}
      />

      <ImgSet2bBlock
        items={[
          {
            src: `${BASE}/04.webp`,
            title: { en: "Poster Design", zh: "海報設計" },
            subtitle: "(07)",
          },
          {
            src: `${BASE}/05.webp`,
            title: { en: "Systematic Arrangement", zh: "系統化排列" },
            subtitle: "(06)",
          },
        ]}
        reverse
      />

      <ImgSet4aBlock
        images={[`${BASE}/17.webp`, `${BASE}/12.webp`]}
        title={{ en: "System of Thought", zh: "思想體系" }}
        subtitle="(08)"
      />

      <ImgSet1aBlock
        src={`${BASE}/09.webp`}
        title={{ en: "Between Text and Structure", zh: "文字與結構之間" }}
        subtitle="(09)"
      />

      <ImgSet4aBlock
        images={[
          `${BASE}/13.webp`,
          `${BASE}/18.webp`,
          `${BASE}/19.webp`,
          `${BASE}/14.webp`,
        ]}
        title={{ en: "Knowledge Mapping", zh: "知識圖譜" }}
        subtitle="(10)"
      />

      <ImgTextBlock
        image={`${BASE}/02.webp`}
        title={{ en: "Michel Foucault Book Design", zh: "傅柯書籍裝幀設計" }}
        text={{
          en: [
            "This work traces the underlying structures through which knowledge is formed and understood.",
            "Through form, hierarchy, and composition, it reflects a quiet order embedded within systems of thought.",
          ],
          zh: [
            "本作品追溯知識得以形成與理解的底層結構。",
            "透過形式、層級與構圖，映照出思想體系中內蘊的靜默秩序。",
          ],
        }}
        bgColor="var(--gray-100)"
        textColor="var(--gray-600)"
        titleColor="var(--gray-900)"
      />

      <DiscoverMoreBlock currentId="foucault-book-binding" />
    </main>
  );
}
