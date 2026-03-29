import HeroBlock from "../../components/blocks/HeroBlock";
import TitleBlock from "../../components/blocks/TitleBlock";
import ImgSet1bBlock from "../../components/blocks/ImgSet1bBlock";
import ImgSet2aBlock from "../../components/blocks/ImgSet2aBlock";
import ImgSet2bBlock from "../../components/blocks/ImgSet2bBlock";
import ImgSet3aBlock from "../../components/blocks/ImgSet3aBlock";
import ImgSet3bBlock from "../../components/blocks/ImgSet3bBlock";
import ImgTextBlock from "../../components/blocks/ImgTextBlock";
import QuoteBlock from "../../components/blocks/QuoteBlock";
import DiscoverMoreBlock from "../../components/blocks/DiscoverMoreBlock";
import SpaceBlock from "../../components/blocks/SpaceBlock";
import projects from "../../data/projects.json";
import { usePagePreloader } from "../../hooks/usePagePreloader";

const BASE = "/images/projects/patterned-glass-notebook";

const project = projects.find((p) => p.id === "patterned-glass-notebook");
const PRELOAD_IMAGES = [
  `${BASE}/cover.webp`,
  ...project.images.map((f) => `${BASE}/${f}`),
];

export default function PatternedGlassNotebook() {
  usePagePreloader(PRELOAD_IMAGES);

  return (
    <main className="project-detail project-detail--blocks">
      <HeroBlock image={`${BASE}/08.webp`} project={project} />

      <TitleBlock
        labelColor="var(--sage-300)"
        title={project.title}
        description={project.description}
        bgColor="var(--sage-700)"
        emptyColor="var(--sage-950)"
        fillColor="var(--sage-100)"
      />

      <ImgSet2aBlock
        items={[
          {
            src: `${BASE}/03.webp`,
            title: "Everyday Object",
            subtitle: "(02)",
          },
          {
            src: `${BASE}/01.webp`,
            title: "Memory in Material",
            subtitle: "(01)",
          },
        ]}
        reverse
      />

      <QuoteBlock
        text="What we call the beginning is often the end, and to make an end is to make a beginning."
        author="T. S. Eliot"
        image={`${BASE}/title.svg`}
      />

      <ImgSet3bBlock
        items={[
          {
            src: `${BASE}/14.webp`,
            title: "A Study of Texture",
            subtitle: "(03)",
          },
          {
            src: `${BASE}/13.webp`,
            title: "Surface Detail",
            subtitle: "(04)",
          },
          {
            src: `${BASE}/12.webp`,
            title: "Debossed Brass",
            subtitle: "(05)",
          },
        ]}
      />

      <ImgSet1bBlock
        src={`${BASE}/11.webp`}
        title="Material Expression"
        subtitle="(06)"
        reverse
      />

      <ImgSet2bBlock
        items={[
          {
            src: `${BASE}/04.webp`,
            title: "Exposed Smyth Sewn Binding",
            subtitle: "(07)",
          },
          {
            src: `${BASE}/05.webp`,
            title: "Memory in Glass",
            subtitle: "(08)",
          },
        ]}
      />

      <ImgSet2aBlock
        items={[
          {
            src: `${BASE}/15.webp`,
            title: "Quiet Detail",
            subtitle: "(10)",
          },
          {
            src: `${BASE}/06.webp`,
            title: "Form and Tactility",
            subtitle: "(09)",
          },
        ]}
        reverse
      />

      <ImgSet1bBlock
        src={`${BASE}/09.webp`}
        title="Surface and Light"
        subtitle="(11)"
      />

      <ImgTextBlock
        image={`${BASE}/16.webp`}
        title="Patterned Glass Notebook"
        text={[
          "This work preserves a fragment of everyday material culture, translating it into a contemporary form.",
          "Through texture, light, and touch, it invites a quiet reflection on memory and the value of things once familiar.",
        ]}
        bgColor="var(--sage-700)"
        textColor="var(--sage-300)"
        titleColor="var(--sage-100)"
      />

      <DiscoverMoreBlock currentId="patterned-glass-notebook" />
    </main>
  );
}
