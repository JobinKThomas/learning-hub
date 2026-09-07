/**
 * Presenter for formatting dashboard responses
 */
export const dashboardPresenter = {
  /**
   * Format full dashboard response
   */
  toDashboardResponse: ({
    user,
    stats,
    continueLearning,
    learningPaths = [],
    recentActivity = [],
    recentQuizAttempts = [],
  }) => {
    return {
      user: {
        id: user?._id || user?.id,
        name: user?.name || '',
        email: user?.email || '',
        role: user?.role || 'USER',
        createdAt: user?.createdAt || null,
      },
      stats: {
        overallProgress: stats?.overallProgress ?? 0,
        learningPathsCount: stats?.learningPathsCount ?? 0,
        completedTopicsCount: stats?.completedTopicsCount ?? 0,
        quizAverage: stats?.quizAverage ?? 0,
        totalNotesCompleted: stats?.totalNotesCompleted ?? 0,
        totalPlaygroundsCompleted: stats?.totalPlaygroundsCompleted ?? 0,
        totalQuizAttempts: stats?.totalQuizAttempts ?? 0,
      },
      continueLearning: continueLearning
        ? {
            learningPath: continueLearning.learningPath
              ? {
                  id: continueLearning.learningPath._id || continueLearning.learningPath.id,
                  title: continueLearning.learningPath.title,
                  slug: continueLearning.learningPath.slug,
                }
              : null,
            module: continueLearning.module
              ? {
                  id: continueLearning.module._id || continueLearning.module.id,
                  title: continueLearning.module.title,
                  slug: continueLearning.module.slug,
                }
              : null,
            section: continueLearning.section
              ? {
                  id: continueLearning.section._id || continueLearning.section.id,
                  title: continueLearning.section.title,
                  slug: continueLearning.section.slug,
                }
              : null,
            topic: continueLearning.topic
              ? {
                  id: continueLearning.topic._id || continueLearning.topic.id,
                  title: continueLearning.topic.title,
                  slug: continueLearning.topic.slug,
                }
              : null,
            progress: continueLearning.progress ?? 0,
            continueUrl:
              continueLearning.continueUrl ||
              (continueLearning.topic?.slug
                ? `/topics/${continueLearning.topic.slug}`
                : '/learning-paths'),
            isNew: Boolean(continueLearning.isNew),
          }
        : null,
      learningPaths: learningPaths.map((lp) => ({
        id: lp._id || lp.id,
        title: lp.title,
        slug: lp.slug,
        category: lp.category,
        level: lp.level,
        color: lp.color,
        icon: lp.icon,
        totalTopics: lp.totalTopics ?? 0,
        completedTopics: lp.completedTopics ?? 0,
        percentage: lp.percentage ?? 0,
        progress: lp.percentage ?? 0,
        status: lp.status ?? 'NOT_STARTED',
      })),
      recentActivity: recentActivity.map((r) => ({
        id: r._id || r.id,
        topic: r.topic
          ? {
              id: r.topic._id || r.topic.id,
              title: r.topic.title,
              slug: r.topic.slug,
            }
          : null,
        module: r.module
          ? {
              id: r.module._id || r.module.id,
              title: r.module.title,
              slug: r.module.slug,
            }
          : null,
        learningPath: r.learningPath
          ? {
              id: r.learningPath._id || r.learningPath.id,
              title: r.learningPath.title,
              slug: r.learningPath.slug,
            }
          : null,
        isCompleted: Boolean(r.isCompleted),
        completedAt: r.completedAt || null,
        lastAccessedAt: r.lastAccessedAt || r.updatedAt || null,
      })),
      recentQuizAttempts: recentQuizAttempts.map((qa) => ({
        id: qa._id || qa.id,
        quiz: qa.quiz
          ? {
              id: qa.quiz._id || qa.quiz.id,
              title: qa.quiz.title,
              slug: qa.quiz.slug,
              passingScore: qa.quiz.passingScore,
            }
          : null,
        quizTitle: qa.quiz?.title || '',
        quizSlug: qa.quiz?.slug || '',
        status: qa.passed ? 'PASSED' : 'FAILED',
        score: qa.score ?? 0,
        totalQuestions: qa.totalQuestions ?? (qa.answers ? qa.answers.length : 0),
        percentage: qa.percentage ?? 0,
        passed: Boolean(qa.passed),
        timeSpentSeconds: qa.timeSpentSeconds ?? 0,
        createdAt: qa.createdAt || null,
      })),
    };
  },
};

export default dashboardPresenter;
