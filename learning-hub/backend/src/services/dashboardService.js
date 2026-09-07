import { Progress } from '../models/Progress.js';
import { QuizAttempt } from '../models/QuizAttempt.js';
import { LearningPath } from '../models/LearningPath.js';
import { Module } from '../models/Module.js';
import { Section } from '../models/Section.js';
import { Topic } from '../models/Topic.js';
import { dashboardPresenter } from '../presenters/dashboardPresenter.js';

export const dashboardService = {
  /**
   * Get aggregated dashboard data for an authenticated user
   */
  getDashboardData: async (userId, user) => {
    // 1. Fetch published learning paths
    const publishedPaths = await LearningPath.find({ published: true }).sort({ order: 1 });

    // 2. Fetch all user progress records once
    const userProgressList = await Progress.find({ user: userId })
      .populate('topic', 'title slug order keyPoints')
      .populate('section', 'title slug order')
      .populate('module', 'title slug order')
      .populate('learningPath', 'title slug');

    // Map of completed topic IDs
    const completedTopicIds = new Set(
      userProgressList
        .filter((p) => p.isCompleted && p.topic)
        .map((p) => (p.topic._id || p.topic.id || p.topic).toString())
    );

    // 3. For each learning path, calculate hierarchical topic counts & progress
    let totalCurriculumTopics = 0;
    let totalCurriculumCompleted = 0;
    let enrolledPathsCount = 0;

    const pathSummaries = await Promise.all(
      publishedPaths.map(async (pathDoc) => {
        // Find modules belonging to this path
        const modules = await Module.find({
          learningPath: pathDoc._id,
          published: true,
        }).sort({ order: 1 });

        const moduleIds = modules.map((m) => m._id);

        // Find sections belonging to these modules
        const sections = await Section.find({
          module: { $in: moduleIds },
          published: true,
        });
        const sectionIds = sections.map((s) => s._id);

        // Find topics belonging to these sections
        const topics = await Topic.find({
          section: { $in: sectionIds },
          published: true,
        });

        const totalTopics = topics.length;
        let completedTopics = 0;

        for (const t of topics) {
          if (completedTopicIds.has(t._id.toString())) {
            completedTopics++;
          }
        }

        const percentage =
          totalTopics > 0 ? Math.min(100, Math.round((completedTopics / totalTopics) * 100)) : 0;

        let status = 'NOT_STARTED';
        if (percentage === 100) {
          status = 'COMPLETED';
        } else if (percentage > 0) {
          status = 'IN_PROGRESS';
        }

        if (status !== 'NOT_STARTED') {
          enrolledPathsCount++;
        }

        totalCurriculumTopics += totalTopics;
        totalCurriculumCompleted += completedTopics;

        return {
          id: pathDoc._id,
          title: pathDoc.title,
          slug: pathDoc.slug,
          category: pathDoc.category,
          level: pathDoc.level,
          color: pathDoc.color,
          icon: pathDoc.icon,
          totalTopics,
          completedTopics,
          percentage,
          status,
        };
      })
    );

    // 4. Overall Progress Calculation
    let overallProgress = 0;
    if (totalCurriculumTopics > 0) {
      overallProgress = Math.min(
        100,
        Math.round((totalCurriculumCompleted / totalCurriculumTopics) * 100)
      );
    }

    // 5. Quiz Attempts Statistics & Average
    const quizAttempts = await QuizAttempt.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('quiz', 'title slug passingScore');

    let quizAverage = 0;
    if (quizAttempts.length > 0) {
      const sumPercentages = quizAttempts.reduce(
        (sum, att) => sum + (att.percentage ?? 0),
        0
      );
      quizAverage = Math.round(sumPercentages / quizAttempts.length);
    }

    // 6. Additional Activity Counts
    let totalNotesCompleted = 0;
    let totalPlaygroundsCompleted = 0;
    for (const p of userProgressList) {
      totalNotesCompleted += p.completedNotes?.length || 0;
      totalPlaygroundsCompleted += p.completedPlaygrounds?.length || 0;
    }

    // 7. Resolve "Continue Learning"
    let continueLearning = null;

    // A) Try to get the most recently accessed topic from user's progress
    const recentProgress = await Progress.findOne({ user: userId })
      .sort({ lastAccessedAt: -1, updatedAt: -1 })
      .populate('topic', 'title slug order duration keyPoints')
      .populate('section', 'title slug')
      .populate('module', 'title slug')
      .populate('learningPath', 'title slug');

    if (recentProgress && recentProgress.topic) {
      // Calculate progress for this topic
      let topicProgress = 0;
      if (recentProgress.isCompleted) {
        topicProgress = 100;
      } else {
        const totalKp = recentProgress.topic.keyPoints?.length || 1;
        const compKp = recentProgress.completedKeyPoints?.length || 0;
        const compNotes = recentProgress.completedNotes?.length || 0;
        const compQuizzes = recentProgress.completedQuizzes?.length || 0;
        const compPlaygrounds = recentProgress.completedPlaygrounds?.length || 0;

        const totalActs = totalKp + 1; // key points + notes/quizzes weight
        const totalDone = compKp + (compNotes > 0 ? 1 : 0) + (compQuizzes > 0 ? 1 : 0) + (compPlaygrounds > 0 ? 1 : 0);
        topicProgress = Math.min(100, Math.round((totalDone / totalActs) * 100));
      }

      continueLearning = {
        learningPath: recentProgress.learningPath,
        module: recentProgress.module,
        section: recentProgress.section,
        topic: recentProgress.topic,
        progress: topicProgress,
        continueUrl: `/topics/${recentProgress.topic.slug}`,
        isNew: false,
      };
    } else {
      // B) New learner fallback: First published learning path, module, section, and topic
      for (const pathDoc of publishedPaths) {
        const mod = await Module.findOne({
          learningPath: pathDoc._id,
          published: true,
        }).sort({ order: 1 });

        if (mod) {
          const sec = await Section.findOne({
            module: mod._id,
            published: true,
          }).sort({ order: 1 });

          if (sec) {
            const top = await Topic.findOne({
              section: sec._id,
              published: true,
            }).sort({ order: 1 });

            if (top) {
              continueLearning = {
                learningPath: pathDoc,
                module: mod,
                section: sec,
                topic: top,
                progress: 0,
                continueUrl: `/topics/${top.slug}`,
                isNew: true,
              };
              break;
            }
          }
        }
      }
    }

    // 8. Recent Activity
    const recentActivity = userProgressList
      .sort((a, b) => new Date(b.lastAccessedAt || b.updatedAt) - new Date(a.lastAccessedAt || a.updatedAt))
      .slice(0, 5);

    // 9. Recent Quiz Attempts
    const recentQuizAttempts = quizAttempts.slice(0, 5);

    // 10. Compile Stats DTO
    const stats = {
      overallProgress,
      learningPathsCount: enrolledPathsCount > 0 ? enrolledPathsCount : publishedPaths.length,
      completedTopicsCount: completedTopicIds.size,
      quizAverage,
      totalNotesCompleted,
      totalPlaygroundsCompleted,
      totalQuizAttempts: quizAttempts.length,
    };

    return dashboardPresenter.toDashboardResponse({
      user,
      stats,
      continueLearning,
      learningPaths: pathSummaries,
      recentActivity,
      recentQuizAttempts,
    });
  },
};

export default dashboardService;
