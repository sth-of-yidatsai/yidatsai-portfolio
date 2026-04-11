import taxonomy from '../data/taxonomy.json';

/**
 * Resolves an array of taxonomy IDs to display labels in the given language.
 * Falls back to the ID itself if not found in the dictionary.
 */
function resolveLabels(ids, dict, lang) {
  return (ids ?? []).map((id) => dict[id]?.[lang] ?? id);
}

/**
 * Returns a localized copy of a project object.
 * Category and tag IDs are resolved to display labels via taxonomy.json.
 */
export function localizeProject(project, language) {
  if (!project) return project;
  const lang = language === 'zh' ? 'zh' : 'en';
  return {
    ...project,
    title:       (lang === 'zh' ? project.title_zh       : null) ?? project.title,
    description: (lang === 'zh' ? project.description_zh : null) ?? project.description,
    category:    resolveLabels(project.category, taxonomy.categories, lang),
    tags:        resolveLabels(project.tags,     taxonomy.tags,       lang),
  };
}
