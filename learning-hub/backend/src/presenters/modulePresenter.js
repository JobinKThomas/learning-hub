/**
 * Formats a single Module document for API responses
 */
export const formatModule = (mod) => {
  if (!mod) return null;

  const doc = mod.toObject ? mod.toObject() : mod;

  const topics = doc.topics || [];
  const learningObjectives = doc.learningObjectives || [];

  return {
    id: doc._id?.toString() || doc.id,
    learningPathId: doc.learningPath?._id?.toString() || doc.learningPath?.id || doc.learningPath?.toString(),
    learningPath: doc.learningPath && typeof doc.learningPath === 'object'
      ? {
          id: doc.learningPath._id?.toString() || doc.learningPath.id,
          title: doc.learningPath.title,
          slug: doc.learningPath.slug,
          category: doc.learningPath.category,
          level: doc.learningPath.level,
        }
      : null,
    title: doc.title,
    slug: doc.slug,
    description: doc.description,
    duration: doc.duration || '2 hours',
    order: doc.order ?? 1,
    topicsCount: topics.length,
    topics,
    learningObjectives,
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
 * Formats an array of Module documents
 */
export const formatModules = (modules) => {
  if (!Array.isArray(modules)) return [];
  return modules.map(formatModule);
};

export const modulePresenter = {
  format: formatModule,
  formatMany: formatModules,
};

export default modulePresenter;
