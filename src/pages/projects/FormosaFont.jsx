import HeroBlock from "../../components/blocks/HeroBlock";
import TitleBlock from "../../components/blocks/TitleBlock";
import CarouselBlock from "../../components/blocks/CarouselBlock";
import ImgSet3aBlock from "../../components/blocks/ImgSet3aBlock";
import QuoteBlock from "../../components/blocks/QuoteBlock";
import projects from "../../data/projects.json";
import { usePagePreloader } from "../../hooks/usePagePreloader";

const BASE = "/images/projects/formosa-font";
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

      <TitleBlock title={project.title} description={project.description} />

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
        text="Taiwan was once known as 'Formosa', meaning 'beautiful island' in Portuguese."
        author="Historical Record"
        image={`${BASE}/title.svg`}
      />

      <CarouselBlock
        images={[
          `${BASE}/13.webp`,
          `${BASE}/14.webp`,
          `${BASE}/12.webp`,
          `${BASE}/15.webp`,
          `${BASE}/18.webp`,
        ]}
      />
    </main>
  );
}
