import { useParams } from 'react-router-dom';
import ProjectDetail from './ProjectDetail';
import FormosaFont from './projects/FormosaFont';
import PatternedGlassNotebook from './projects/PatternedGlassNotebook';

const CUSTOM_PAGES = {
  'formosa-font': FormosaFont,
  'patterned-glass-notebook': PatternedGlassNotebook,
};

export default function ProjectPage() {
  const { id } = useParams();
  const Custom = CUSTOM_PAGES[id];

  if (Custom) return <Custom />;

  return <ProjectDetail />;
}
