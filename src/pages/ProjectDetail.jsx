import { useLoaderData } from "react-router-dom";
import HeroBlock from "../components/blocks/HeroBlock";
import TitleBlock from "../components/blocks/TitleBlock";
import DefaultBlock from "../components/blocks/DefaultBlock";
import DiscoverMoreBlock from "../components/blocks/DiscoverMoreBlock";
import { useTranslation } from "../hooks/useTranslation";
import { localizeProject } from "../utils/projectLocale";

export default function ProjectDetail() {
  const rawProject = useLoaderData();
  const { language } = useTranslation();
  const project = localizeProject(rawProject, language);
  const base = `/images/projects/${rawProject.id}`;

  return (
    <main className="project-detail project-detail--blocks">
      <HeroBlock image={`${base}/${project.cover}`} project={project} />

      <TitleBlock title={project.title} description={project.description} />

      <DefaultBlock images={project.images ?? []} baseUrl={base} />

      <DiscoverMoreBlock currentId={project.id} />
    </main>
  );
}
