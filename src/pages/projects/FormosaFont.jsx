import HeroBlock from "../../components/blocks/formosa-font/HeroBlock";
import TitleBlock from "../../components/blocks/formosa-font/TitleBlock";
import ImgSet1Block from "../../components/blocks/formosa-font/ImgSet1Block";
import QuoteBlock from "../../components/blocks/formosa-font/QuoteBlock";
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

      <ImgSet1Block
        bg="var(--gray-25)"
        color="var(--gray-700)"
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
    </main>
  );
}
