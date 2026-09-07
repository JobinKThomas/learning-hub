/**
 * Formats a single Resource document for API responses
 */
export const formatResource = (resource) => {
  if (!resource) return null;

  const doc = resource.toObject ? resource.toObject() : resource;
  const topicDoc = doc.topic && typeof doc.topic === 'object' ? doc.topic : null;
  const sectionDoc = topicDoc?.section && typeof topicDoc.section === 'object'
    ? topicDoc.section
    : null;
  const moduleDoc = sectionDoc?.module && typeof sectionDoc.module === 'object'
    ? sectionDoc.module
    : null;
  const pathDoc = moduleDoc?.learningPath && typeof moduleDoc.learningPath === 'object'
    ? moduleDoc.learningPath
    : null;

  return {
    id: doc._id?.toString() || doc.id,
    topicId: topicDoc?._id?.toString() || topicDoc?.id || doc.topic?.toString(),
    topic: topicDoc
      ? {
          id: topicDoc._id?.toString() || topicDoc.id,
          title: topicDoc.title,
          slug: topicDoc.slug,
          summary: topicDoc.summary,
          duration: topicDoc.duration,
          order: topicDoc.order,
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
        }
      : null,
    title: doc.title,
    url: doc.url,
    type: doc.type || 'DOCUMENTATION',
    description: doc.description || '',
    author: doc.author || '',
    order: doc.order ?? 1,
    isFree: doc.isFree ?? true,
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
 * Formats an array of Resource documents
 */
export const formatResources = (resources) => {
  if (!Array.isArray(resources)) return [];
  return resources.map(formatResource);
};

export const resourcePresenter = {
  format: formatResource,
  formatMany: formatResources,
};

export default resourcePresenter;
