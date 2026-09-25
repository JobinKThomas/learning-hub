export const interviewQuestionPresenter = {
  toResponse: (item) => {
    if (!item) return null;

    let topicData = item.topic;
    if (item.topic && typeof item.topic === 'object') {
      topicData = {
        id: item.topic._id ? item.topic._id.toString() : item.topic.id,
        title: item.topic.title,
        slug: item.topic.slug,
        section: item.topic.section,
      };
    }

    let creatorData = item.createdBy;
    if (item.createdBy && typeof item.createdBy === 'object') {
      creatorData = {
        id: item.createdBy._id ? item.createdBy._id.toString() : item.createdBy.id,
        name: item.createdBy.name,
        email: item.createdBy.email,
        role: item.createdBy.role,
      };
    }

    return {
      id: item._id ? item._id.toString() : item.id,
      topic: topicData,
      question: item.question,
      answer: item.answer,
      codeSnippet: item.codeSnippet || '',
      difficulty: item.difficulty || 'INTERMEDIATE',
      frequency: item.frequency || 'FREQUENT',
      order: item.order ?? 1,
      tags: item.tags || [],
      published: item.published ?? true,
      createdBy: creatorData,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  },

  toResponseList: (items) => {
    if (!Array.isArray(items)) return [];
    return items.map((i) => interviewQuestionPresenter.toResponse(i));
  },
};
