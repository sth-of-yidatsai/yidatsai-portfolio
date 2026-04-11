/**
 * Returns a localized copy of a project object.
 * In 'en' mode: returns the project unchanged.
 * In 'zh' mode: maps _zh fields over the base fields, falling back to EN if missing.
 */
export function localizeProject(project, language) {
  if (!project || language !== 'zh') return project;
  return {
    ...project,
    title:       project.title_zh       ?? project.title,
    description: project.description_zh ?? project.description,
    category:    project.category_zh    ?? project.category,
    tags:        project.tags_zh        ?? project.tags,
  };
}
