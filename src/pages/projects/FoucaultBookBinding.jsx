import HeroBlock from "../../components/blocks/HeroBlock";
import TitleBlock from "../../components/blocks/TitleBlock";
import ImgSet2aBlock from "../../components/blocks/ImgSet2aBlock";
import ImgSet2bBlock from "../../components/blocks/ImgSet2bBlock";
import ImgSet3aBlock from "../../components/blocks/ImgSet3aBlock";
import ImgSet3bBlock from "../../components/blocks/ImgSet3bBlock";
import ImgSet1bBlock from "../../components/blocks/ImgSet1bBlock";
import ImgTextBlock from "../../components/blocks/ImgTextBlock";
import QuoteBlock from "../../components/blocks/QuoteBlock";
import CarouselBlock from "../../components/blocks/CarouselBlock";
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
      <HeroBlock image={`${BASE}/08.webp`} project={project} />

      <TitleBlock
        title={project.title}
        description={project.description}
        bgColor="var(--gray-100)"
        emptyColor="var(--gray-300)"
        fillColor="var(--gray-900)"
      />

      <ImgSet2aBlock
        items={[
          {
            src: `${BASE}/01.webp`,
            title: "The Order of Things",
            subtitle: "(01)",
          },
          {
            src: `${BASE}/02.webp`,
            title: "The Archaeology of Knowledge",
            subtitle: "(02)",
          },
        ]}
      />

      <QuoteBlock
        text="The work of an intellectual is not to mould the political will of others; it is, through the analyses that he does in his own field, to re-examine evidence and assumptions."
        author="Michel Foucault"
      />

      <ImgSet3aBlock
        items={[
          {
            src: `${BASE}/03.webp`,
            title: "Cover Detail",
            subtitle: "(03)",
          },
          {
            src: `${BASE}/04.webp`,
            title: "Typography",
            subtitle: "(04)",
          },
          {
            src: `${BASE}/05.webp`,
            title: "Spine Design",
            subtitle: "(05)",
          },
        ]}
      />

      <ImgSet1bBlock
        src={`${BASE}/06.webp`}
        title="Structural Form"
        subtitle="(06)"
      />

      <ImgSet3bBlock
        items={[
          {
            src: `${BASE}/09.webp`,
            title: "Interior Layout",
            subtitle: "(07)",
          },
          {
            src: `${BASE}/10.webp`,
            title: "Text Setting",
            subtitle: "(08)",
          },
          {
            src: `${BASE}/11.webp`,
            title: "Page Detail",
            subtitle: "(09)",
          },
        ]}
      />

      <CarouselBlock
        images={[
          `${BASE}/12.webp`,
          `${BASE}/13.webp`,
          `${BASE}/14.webp`,
          `${BASE}/15.webp`,
          `${BASE}/16.webp`,
        ]}
      />

      <ImgSet2bBlock
        items={[
          {
            src: `${BASE}/17.webp`,
            title: "Binding Structure",
            subtitle: "(10)",
          },
          {
            src: `${BASE}/18.webp`,
            title: "Material Detail",
            subtitle: "(11)",
          },
        ]}
      />

      <ImgSet2aBlock
        items={[
          {
            src: `${BASE}/19.webp`,
            title: "Book as Object",
            subtitle: "(12)",
          },
          {
            src: `${BASE}/20.webp`,
            title: "Complete Set",
            subtitle: "(13)",
          },
        ]}
        reverse
      />

      <ImgTextBlock
        image={`${BASE}/07.webp`}
        title="Michel Foucault Book Binding Design"
        text={[
          "This editorial project brings together two landmark works by French philosopher Michel Foucault: \"The Order of Things\" (1966) and \"The Archaeology of Knowledge\" (1969).",
          "The binding design reflects Foucault's intellectual rigor — structured, systematic, and attentive to the archaeology of ideas beneath the surface of language.",
        ]}
        bgColor="var(--gray-100)"
        textColor="var(--gray-600)"
        titleColor="var(--gray-900)"
      />

      <DiscoverMoreBlock currentId="foucault-book-binding" />
    </main>
  );
}
