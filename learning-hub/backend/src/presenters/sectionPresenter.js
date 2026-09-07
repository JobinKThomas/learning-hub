/**
 * Formats a single Section document for API responses
 */
export const formatSection = (sec) => {
  if (!sec) return null;

  const doc = sec.toObject ? sec.toObject() : sec;
  const items = doc.items || [];

  const moduleDoc = doc.module && typeof doc.module === 'object' ? doc.module : null;
  const pathDoc = moduleDoc?.learningPath && typeof moduleDoc.learningPath === 'object'
    ? moduleDoc.learningPath
    : null;

  return {
    id: doc._id?.toString() || doc.id,
    moduleId: moduleDoc?._id?.toString() || moduleDoc?.id || doc.module?.toString(),
    module: moduleDoc
      ? {
          id: moduleDoc._id?.toString() || moduleDoc.id,
          title: moduleDoc.title,
          slug: moduleDoc.slug,
          duration: moduleDoc.duration,
          order: moduleDoc.order,
          learningPath: pathDoc
            ? {
                id: pathDoc._id?.toString() || pathDoc.id,
                title: pathDoc.title,
                slug: pathDoc.slug,
                category: pathDoc.category,
                level: pathDoc.level,
              }
            : null,
        }
      : null,
    title: doc.title,
    slug: doc.slug,
    description: doc.description,
    duration: doc.duration || '45 mins',
    order: doc.order ?? 1,
    itemsCount: items.length,
    items,
    content: doc.content || '',
    published: doc.published ?? true,
    createdBy: doc.createdBy && typeof doc.createdBy === 'object'
      ? {
          id: doc.createdBy._id?.toString() || doc.createdBy.id,
          name: doc.createdBy.name,
          email: doc.createdBy.email,
        }
      : null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

/**
 * Formats an array of Section documents
 */
export const formatSections = (sections) => {
  if (!Array.isArray(sections)) return [];
  return sections.map(formatSection);
};

export const sectionPresenter = {
  format: formatSection,
  formatMany: formatSections,
};

export default sectionPresenter;
