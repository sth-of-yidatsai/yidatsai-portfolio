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

const BASE = "/images/projects/foucault-book-binding";

const project = projects.find((p) => p.id === "foucault-book-binding");
const PRELOAD_IMAGES = [
  `${BASE}/cover.webp`,
  ...project.images.map((f) => `${BASE}/${f}`),
];

export default function FoucaultBookBinding() {
  usePagePreloader(PRELOAD_IMAGES);

  return (
    <main className="project-detail project-detail--blocks">
      <HeroBlock image={`${BASE}/01.webp`} project={project} />

      <TitleBlock
        title={project.title}
        description={project.description}
        bgColor="var(--gray-100)"
        emptyColor="var(--gray-300)"
        fillColor="var(--gray-900)"
      />

      <ImgSet3bBlock
        items={[
          {
            src: `${BASE}/06.webp`,
            title: "Cover Detail",
            subtitle: "(01)",
          },
          {
            src: `${BASE}/17.webp`,
            title: "Typography",
            subtitle: "(02)",
          },
          {
            src: `${BASE}/03.webp`,
            title: "Spine Design",
            subtitle: "(03)",
          },
        ]}
      />

      <QuoteBlock
        text="Order is, at one and the same time, that which is given in things and that which must be discovered."
        author="Michel Foucault"
        image={`${BASE}/title.svg`}
      />

      <ImgSet2aBlock
        items={[
          {
            src: `${BASE}/12.webp`,
            title: "The Order of Things",
            subtitle: "(04)",
          },
          {
            src: `${BASE}/08.webp`,
            title: "The Archaeology of Knowledge",
            subtitle: "(05)",
          },
        ]}
      />

      <ImgSet2bBlock
        items={[
          {
            src: `${BASE}/04.webp`,
            title: "The Order of Things",
            subtitle: "(07)",
          },
          {
            src: `${BASE}/05.webp`,
            title: "The Archaeology of Knowledge",
            subtitle: "(06)",
          },
        ]}
        reverse
      />

      <ImgSet4aBlock
        images={[`${BASE}/18.webp`, `${BASE}/13.webp`]}
        title="Structural Form"
        subtitle="(08)"
      />

      <ImgSet1aBlock
        src={`${BASE}/10.webp`}
        title="Structural Form"
        subtitle="(09)"
        reverse
      />

      <ImgSet4aBlock
        images={[
          `${BASE}/14.webp`,
          `${BASE}/19.webp`,
          `${BASE}/20.webp`,
          `${BASE}/15.webp`,
        ]}
        title="Structural Form"
        subtitle="(10)"
      />

      <ImgTextBlock
        image={`${BASE}/02.webp`}
        title="Michel Foucault Book Design"
        text={[
          "This work traces the underlying structures through which knowledge is formed and understood.",
          "Through form, hierarchy, and composition, it reflects a quiet order embedded within systems of thought.",
        ]}
        bgColor="var(--gray-100)"
        textColor="var(--gray-600)"
        titleColor="var(--gray-900)"
      />

      <DiscoverMoreBlock currentId="foucault-book-binding" />
    </main>
  );
}
