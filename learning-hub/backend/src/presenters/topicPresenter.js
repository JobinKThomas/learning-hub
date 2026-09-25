/**
 * Formats a single Topic document for API responses
 */
export const formatTopic = (topic) => {
  if (!topic) return null;

  const doc = topic.toObject ? topic.toObject() : topic;
  const sectionDoc = doc.section && typeof doc.section === 'object' ? doc.section : null;
  const moduleDoc = sectionDoc?.module && typeof sectionDoc.module === 'object'
    ? sectionDoc.module
    : null;
  const pathDoc = moduleDoc?.learningPath && typeof moduleDoc.learningPath === 'object'
    ? moduleDoc.learningPath
    : null;

  const codeExamples = doc.codeExamples || [];
  const keyPoints = doc.keyPoints || [];

  return {
    id: doc._id?.toString() || doc.id,
    sectionId: sectionDoc?._id?.toString() || sectionDoc?.id || doc.section?.toString(),
    section: sectionDoc
      ? {
          id: sectionDoc._id?.toString() || sectionDoc.id,
          title: sectionDoc.title,
          slug: sectionDoc.slug,
          order: sectionDoc.order,
          duration: sectionDoc.duration,
          module: moduleDoc
            ? {
                id: moduleDoc._id?.toString() || moduleDoc.id,
                title: moduleDoc.title,
                slug: moduleDoc.slug,
                order: moduleDoc.order,
                duration: moduleDoc.duration,
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
        }
      : null,
    title: doc.title,
    slug: doc.slug,
    summary: doc.summary || '',
    description: doc.description,
    content: doc.content || '',
    codeExamples,
    codeExamplesCount: codeExamples.length,
    keyPoints,
    duration: doc.duration || '15 mins',
    order: doc.order ?? 1,
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
 * Formats an array of Topic documents
 */
export const formatTopics = (topics) => {
  if (!Array.isArray(topics)) return [];
  return topics.map(formatTopic);
};

export const topicPresenter = {
  format: formatTopic,
  formatMany: formatTopics,
};

export default topicPresenter;
