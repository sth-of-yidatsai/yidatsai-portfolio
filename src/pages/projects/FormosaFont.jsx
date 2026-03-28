import HeroBlock from '../../components/blocks/formosa-font/HeroBlock';
import TitleBlock from '../../components/blocks/formosa-font/TitleBlock';
import QuoteBlock from '../../components/blocks/formosa-font/QuoteBlock';
import projects from '../../data/projects.json';

const BASE = '/images/projects/formosa-font';
const project = projects.find((p) => p.id === 'formosa-font');

export default function FormosaFont() {
  return (
    <main className="project-detail project-detail--blocks">
      <HeroBlock
        image={`${BASE}/03.webp`}
        project={project}
      />

      <TitleBlock
        title={project.title}
        description={project.description}
      />

      <QuoteBlock
        text="Taiwan was once known as 'Formosa', meaning 'beautiful island' in Portuguese."
        author="Historical Record"
        image={`${BASE}/title.svg`}
      />
    </main>
  );
}
