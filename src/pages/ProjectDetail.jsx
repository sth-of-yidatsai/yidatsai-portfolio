import { useLoaderData } from "react-router-dom";
import HeroBlock from "../components/blocks/HeroBlock";
import TitleBlock from "../components/blocks/TitleBlock";
import DefaultBlock from "../components/blocks/DefaultBlock";
import DiscoverMoreBlock from "../components/blocks/DiscoverMoreBlock";

export default function ProjectDetail() {
  const project = useLoaderData();
  const base = `/images/projects/${project.id}`;

  return (
    <main className="project-detail project-detail--blocks">
      <HeroBlock image={`${base}/${project.cover}`} project={project} />

      <TitleBlock title={project.title} description={project.description} />

      <DefaultBlock images={project.images ?? []} baseUrl={base} />

      <DiscoverMoreBlock currentId={project.id} />
    </main>
  );
}
