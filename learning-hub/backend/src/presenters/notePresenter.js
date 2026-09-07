/**
 * Formats a single Note document for API responses across all 5 tiers
 */
export const formatNote = (note) => {
  if (!note) return null;

  const doc = note.toObject ? note.toObject() : note;
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
    slug: doc.slug,
    summary: doc.summary || '',
    content: doc.content || '',
    readingTime: doc.readingTime || '5 mins',
    order: doc.order ?? 1,
    tags: Array.isArray(doc.tags) ? doc.tags : [],
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
 * Formats an array of Note documents
 */
export const formatNotes = (notes) => {
  if (!Array.isArray(notes)) return [];
  return notes.map(formatNote);
};

export const notePresenter = {
  format: formatNote,
  formatMany: formatNotes,
};

export default notePresenter;
