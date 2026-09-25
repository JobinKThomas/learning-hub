export const progressPresenter = {
  /**
   * Format single topic progress response
   */
  toTopicProgressResponse: (progress, stats = {}) => {
    const topic = progress?.topic || stats.topic;
    return {
      topicId: topic?._id || topic?.id || null,
      topicSlug: topic?.slug || '',
      topicTitle: topic?.title || '',
      isCompleted: Boolean(progress?.isCompleted),
      percentage: stats.percentage ?? (progress?.isCompleted ? 100 : 0),
      completionPercentage: stats.percentage ?? (progress?.isCompleted ? 100 : 0),
      completedAt: progress?.completedAt || null,
      lastAccessedAt: progress?.lastAccessedAt || null,
      completedNotes: (progress?.completedNotes || []).map((n) =>
        typeof n === 'object' && n !== null ? n._id || n.id : n
      ),
      completedQuizzes: (progress?.completedQuizzes || []).map((q) =>
        typeof q === 'object' && q !== null ? q._id || q.id : q
      ),
      completedPlaygrounds: (progress?.completedPlaygrounds || []).map((p) =>
        typeof p === 'object' && p !== null ? p._id || p.id : p
      ),
      completedKeyPoints: progress?.completedKeyPoints || [],
      stats: {
        totalNotes: stats.totalNotes ?? 0,
        completedNotesCount: progress?.completedNotes?.length ?? 0,
        totalQuizzes: stats.totalQuizzes ?? 0,
        completedQuizzesCount: progress?.completedQuizzes?.length ?? 0,
        totalPlaygrounds: stats.totalPlaygrounds ?? 0,
        completedPlaygroundsCount: progress?.completedPlaygrounds?.length ?? 0,
        totalKeyPoints: stats.totalKeyPoints ?? (topic?.keyPoints?.length || 0),
        completedKeyPointsCount: progress?.completedKeyPoints?.length ?? 0,
        percentage: stats.percentage ?? 0,
      },
    };
  },

  /**
   * Format hierarchical learning path progress response
   */
  toLearningPathProgressResponse: (learningPath, modules = [], stats = {}) => {
    return {
      learningPath: {
        id: learningPath._id || learningPath.id,
        title: learningPath.title,
        slug: learningPath.slug,
        category: learningPath.category,
        level: learningPath.level,
      },
      totalTopics: stats.totalTopics ?? 0,
      completedTopics: stats.completedTopics ?? 0,
      percentage: stats.percentage ?? 0,
      status: stats.status ?? 'NOT_STARTED',
      modules: modules.map((m) => ({
        id: m.id || m._id,
        title: m.title,
        slug: m.slug,
        order: m.order,
        duration: m.duration,
        totalTopics: m.totalTopics,
        completedTopics: m.completedTopics,
        percentage: m.percentage,
        sections: (m.sections || []).map((s) => ({
          id: s.id || s._id,
          title: s.title,
          slug: s.slug,
          order: s.order,
          totalTopics: s.totalTopics,
          completedTopics: s.completedTopics,
          percentage: s.percentage,
          topics: (s.topics || []).map((t) => ({
            id: t.id || t._id,
            title: t.title,
            slug: t.slug,
            order: t.order,
            isCompleted: t.isCompleted,
            percentage: t.percentage,
          })),
        })),
      })),
    };
  },

  /**
   * Format module progress response
   */
  toModuleProgressResponse: (moduleDoc, sections = [], stats = {}) => {
    return {
      module: {
        id: moduleDoc._id || moduleDoc.id,
        title: moduleDoc.title,
        slug: moduleDoc.slug,
        order: moduleDoc.order,
      },
      totalTopics: stats.totalTopics ?? 0,
      completedTopics: stats.completedTopics ?? 0,
      percentage: stats.percentage ?? 0,
      sections: sections.map((s) => ({
        id: s.id || s._id,
        title: s.title,
        slug: s.slug,
        order: s.order,
        totalTopics: s.totalTopics,
        completedTopics: s.completedTopics,
        percentage: s.percentage,
        topics: (s.topics || []).map((t) => ({
          id: t.id || t._id,
          title: t.title,
          slug: t.slug,
          order: t.order,
          isCompleted: t.isCompleted,
          percentage: t.percentage,
        })),
      })),
    };
  },

  /**
   * Format overall user learning progress response
   */
  toOverallProgressResponse: (summary = {}, paths = [], recent = []) => {
    return {
      totalCompletedTopics: summary.totalCompletedTopics ?? 0,
      totalCompletedNotes: summary.totalCompletedNotes ?? 0,
      totalCompletedQuizzes: summary.totalCompletedQuizzes ?? 0,
      totalCompletedPlaygrounds: summary.totalCompletedPlaygrounds ?? 0,
      learningPaths: paths,
      recentActivity: recent.map((r) => ({
        id: r._id || r.id,
        topic: r.topic ? { id: r.topic._id, title: r.topic.title, slug: r.topic.slug } : null,
        module: r.module ? { id: r.module._id, title: r.module.title, slug: r.module.slug } : null,
        learningPath: r.learningPath
          ? { id: r.learningPath._id, title: r.learningPath.title, slug: r.learningPath.slug }
          : null,
        isCompleted: r.isCompleted,
        completedAt: r.completedAt,
        lastAccessedAt: r.lastAccessedAt,
        updatedAt: r.updatedAt,
      })),
    };
  },
};

export default progressPresenter;
