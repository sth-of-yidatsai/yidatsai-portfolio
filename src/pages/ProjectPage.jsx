import { useParams } from 'react-router-dom';
import ProjectDetail from './ProjectDetail';
import FormosaFont from './projects/FormosaFont';

const CUSTOM_PAGES = {
  'formosa-font': FormosaFont,
};

export default function ProjectPage() {
  const { id } = useParams();
  const Custom = CUSTOM_PAGES[id];

  if (Custom) return <Custom />;

  return <ProjectDetail />;
}
