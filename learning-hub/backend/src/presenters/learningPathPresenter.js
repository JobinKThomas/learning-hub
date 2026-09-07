/**
 * Formats a single LearningPath entity for presentation in API responses
 */
export const formatLearningPath = (path) => {
  if (!path) return null;

  const doc = path.toObject ? path.toObject() : path;

  const modules = (doc.modules || []).map((m, index) => ({
    _id: m._id,
    title: m.title,
    description: m.description || '',
    duration: m.duration || '1 hour',
    topics: m.topics || [],
    order: m.order ?? index + 1,
  }));

  const totalTopics = modules.reduce((acc, m) => acc + (m.topics ? m.topics.length : 0), 0);

  return {
    id: doc._id?.toString() || doc.id,
    title: doc.title,
    slug: doc.slug,
    description: doc.description,
    category: doc.category,
    level: doc.level,
    estimatedHours: doc.estimatedHours,
    icon: doc.icon || 'Code',
    color: doc.color || 'indigo',
    published: doc.published ?? true,
    modulesCount: modules.length,
    totalTopics,
    modules,
    createdBy: doc.createdBy
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
 * Formats an array of LearningPath entities
 */
export const formatLearningPaths = (paths) => {
  if (!Array.isArray(paths)) return [];
  return paths.map(formatLearningPath);
};

export const learningPathPresenter = {
  format: formatLearningPath,
  formatMany: formatLearningPaths,
};
