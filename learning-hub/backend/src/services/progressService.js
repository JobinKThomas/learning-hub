import mongoose from 'mongoose';
import { progressRepository } from '../repositories/progressRepository.js';
import { Topic } from '../models/Topic.js';
import { Section } from '../models/Section.js';
import { Module } from '../models/Module.js';
import { LearningPath } from '../models/LearningPath.js';
import { Note } from '../models/Note.js';
import { Quiz } from '../models/Quiz.js';
import { Playground } from '../models/Playground.js';
import { progressPresenter } from '../presenters/progressPresenter.js';

/**
 * Helper to resolve Topic by ID or Slug with parent lineage
 */
async function resolveTopic(topicIdOrSlug) {
  if (!topicIdOrSlug) return null;
  let topic = null;
  if (mongoose.Types.ObjectId.isValid(topicIdOrSlug)) {
    topic = await Topic.findById(topicIdOrSlug);
  }
  if (!topic) {
    topic = await Topic.findOne({ slug: topicIdOrSlug });
  }
  if (topic && !topic.section?.module) {
    topic = await Topic.findById(topic._id).populate({
      path: 'section',
      populate: {
        path: 'module',
        populate: { path: 'learningPath' },
      },
    });
  }
  return topic;
}

/**
 * Helper to resolve Note by ID or Slug
 */
async function resolveNote(noteIdOrSlug) {
  if (!noteIdOrSlug) return null;
  if (mongoose.Types.ObjectId.isValid(noteIdOrSlug)) {
    const n = await Note.findById(noteIdOrSlug);
    if (n) return n;
  }
  return Note.findOne({ slug: noteIdOrSlug });
}

/**
 * Helper to resolve Quiz by ID or Slug
 */
async function resolveQuiz(quizIdOrSlug) {
  if (!quizIdOrSlug) return null;
  if (mongoose.Types.ObjectId.isValid(quizIdOrSlug)) {
    const q = await Quiz.findById(quizIdOrSlug);
    if (q) return q;
  }
  return Quiz.findOne({ slug: quizIdOrSlug });
}

/**
 * Helper to resolve Playground by ID or Slug
 */
async function resolvePlayground(playgroundIdOrSlug) {
  if (!playgroundIdOrSlug) return null;
  if (mongoose.Types.ObjectId.isValid(playgroundIdOrSlug)) {
    const p = await Playground.findById(playgroundIdOrSlug);
    if (p) return p;
  }
  return Playground.findOne({ slug: playgroundIdOrSlug });
}

/**
 * Helper to resolve LearningPath by ID or Slug
 */
async function resolveLearningPath(pathIdOrSlug) {
  if (!pathIdOrSlug) return null;
  if (mongoose.Types.ObjectId.isValid(pathIdOrSlug)) {
    const lp = await LearningPath.findById(pathIdOrSlug);
    if (lp) return lp;
  }
  return LearningPath.findOne({ slug: pathIdOrSlug });
}

/**
 * Helper to resolve Module by ID or Slug
 */
async function resolveModule(moduleIdOrSlug) {
  if (!moduleIdOrSlug) return null;
  if (mongoose.Types.ObjectId.isValid(moduleIdOrSlug)) {
    const m = await Module.findById(moduleIdOrSlug);
    if (m) return m;
  }
  return Module.findOne({ slug: moduleIdOrSlug });
}

export const progressService = {
  /**
   * Update progress for a user and topic
   */
  updateProgress: async (userId, data = {}) => {
    const topicIdOrSlug = data.topicId || data.topic;
    if (!topicIdOrSlug) {
      const err = new Error('Parent topicId is required');
      err.statusCode = 400;
      throw err;
    }

    const topic = await resolveTopic(topicIdOrSlug);
    if (!topic) {
      const err = new Error(`Topic '${topicIdOrSlug}' not found`);
      err.statusCode = 404;
      throw err;
    }

    const section = topic.section;
    const moduleDoc = section?.module;
    const learningPath = moduleDoc?.learningPath;

    // Fetch existing raw progress
    let existing = await progressRepository.findRawByUserAndTopic(
      userId,
      topic._id
    );

    let completedNotes = existing?.completedNotes || [];
    let completedQuizzes = existing?.completedQuizzes || [];
    let completedPlaygrounds = existing?.completedPlaygrounds || [];
    let completedKeyPoints = existing?.completedKeyPoints || [];
    let isCompleted = existing?.isCompleted || false;
    let completedAt = existing?.completedAt || null;

    const completed = data.completed !== undefined ? Boolean(data.completed) : true;

    // 1. Note completion
    if (data.noteId || data.note) {
      const note = await resolveNote(data.noteId || data.note);
      if (!note) {
        const err = new Error(`Note '${data.noteId || data.note}' not found`);
        err.statusCode = 404;
        throw err;
      }
      const noteIdStr = note._id.toString();
      if (completed) {
        if (!completedNotes.some((id) => id.toString() === noteIdStr)) {
          completedNotes.push(note._id);
        }
      } else {
        completedNotes = completedNotes.filter(
          (id) => id.toString() !== noteIdStr
        );
      }
    }

    // 2. Quiz completion
    if (data.quizId || data.quiz) {
      const quiz = await resolveQuiz(data.quizId || data.quiz);
      if (!quiz) {
        const err = new Error(`Quiz '${data.quizId || data.quiz}' not found`);
        err.statusCode = 404;
        throw err;
      }
      const quizIdStr = quiz._id.toString();
      if (completed) {
        if (!completedQuizzes.some((id) => id.toString() === quizIdStr)) {
          completedQuizzes.push(quiz._id);
        }
      } else {
        completedQuizzes = completedQuizzes.filter(
          (id) => id.toString() !== quizIdStr
        );
      }
    }

    // 3. Playground completion
    if (data.playgroundId || data.playground) {
      const playground = await resolvePlayground(
        data.playgroundId || data.playground
      );
      if (!playground) {
        const err = new Error(
          `Playground '${data.playgroundId || data.playground}' not found`
        );
        err.statusCode = 404;
        throw err;
      }
      const pgIdStr = playground._id.toString();
      if (completed) {
        if (!completedPlaygrounds.some((id) => id.toString() === pgIdStr)) {
          completedPlaygrounds.push(playground._id);
        }
      } else {
        completedPlaygrounds = completedPlaygrounds.filter(
          (id) => id.toString() !== pgIdStr
        );
      }
    }

    // 4. Key Point completion
    if (data.keyPointIndex !== undefined && data.keyPointIndex !== null) {
      const kpIdx = Number(data.keyPointIndex);
      if (!isNaN(kpIdx)) {
        if (completed) {
          if (!completedKeyPoints.includes(kpIdx)) {
            completedKeyPoints.push(kpIdx);
          }
        } else {
          completedKeyPoints = completedKeyPoints.filter((idx) => idx !== kpIdx);
        }
      }
    }

    // 5. Explicit Topic completion
    if (
      data.isCompleted !== undefined ||
      (!data.noteId &&
        !data.quizId &&
        !data.playgroundId &&
        data.keyPointIndex === undefined &&
        data.completed !== undefined)
    ) {
      isCompleted =
        data.isCompleted !== undefined ? Boolean(data.isCompleted) : completed;
      if (isCompleted) {
        completedAt = completedAt || new Date();
      } else {
        completedAt = null;
      }
    }

    // Compute progress stats
    const [totalNotes, totalQuizzes, totalPlaygrounds] = await Promise.all([
      Note.countDocuments({ topic: topic._id, published: true }),
      Quiz.countDocuments({ topic: topic._id, published: true }),
      Playground.countDocuments({ topic: topic._id, published: true }),
    ]);

    const totalKeyPoints = topic.keyPoints?.length || 0;
    const totalActivities =
      totalNotes + totalQuizzes + totalPlaygrounds + totalKeyPoints;
    const completedActivities =
      completedNotes.length +
      completedQuizzes.length +
      completedPlaygrounds.length +
      completedKeyPoints.length;

    let percentage = 0;
    if (isCompleted) {
      percentage = 100;
    } else if (totalActivities > 0) {
      percentage = Math.min(
        100,
        Math.round((completedActivities / totalActivities) * 100)
      );
      if (percentage === 100) {
        isCompleted = true;
        completedAt = completedAt || new Date();
      }
    }

    const updateDoc = {
      section: section?._id || null,
      module: moduleDoc?._id || null,
      learningPath: learningPath?._id || null,
      completedNotes,
      completedQuizzes,
      completedPlaygrounds,
      completedKeyPoints,
      isCompleted,
      completedAt,
      lastAccessedAt: new Date(),
    };

    const savedProgress = await progressRepository.upsertProgress(
      userId,
      topic._id,
      updateDoc
    );

    return progressPresenter.toTopicProgressResponse(savedProgress, {
      topic,
      totalNotes,
      totalQuizzes,
      totalPlaygrounds,
      totalKeyPoints,
      percentage,
    });
  },

  /**
   * Get progress for a specific topic
   */
  getTopicProgress: async (userId, topicIdOrSlug) => {
    const topic = await resolveTopic(topicIdOrSlug);
    if (!topic) {
      const err = new Error(`Topic '${topicIdOrSlug}' not found`);
      err.statusCode = 404;
      throw err;
    }

    const [progress, totalNotes, totalQuizzes, totalPlaygrounds] =
      await Promise.all([
        progressRepository.findByUserAndTopic(userId, topic._id),
        Note.countDocuments({ topic: topic._id, published: true }),
        Quiz.countDocuments({ topic: topic._id, published: true }),
        Playground.countDocuments({ topic: topic._id, published: true }),
      ]);

    const totalKeyPoints = topic.keyPoints?.length || 0;
    const totalActivities =
      totalNotes + totalQuizzes + totalPlaygrounds + totalKeyPoints;

    const completedNotesCount = progress?.completedNotes?.length || 0;
    const completedQuizzesCount = progress?.completedQuizzes?.length || 0;
    const completedPlaygroundsCount =
      progress?.completedPlaygrounds?.length || 0;
    const completedKeyPointsCount =
      progress?.completedKeyPoints?.length || 0;

    const completedActivities =
      completedNotesCount +
      completedQuizzesCount +
      completedPlaygroundsCount +
      completedKeyPointsCount;

    let percentage = 0;
    if (progress?.isCompleted) {
      percentage = 100;
    } else if (totalActivities > 0) {
      percentage = Math.min(
        100,
        Math.round((completedActivities / totalActivities) * 100)
      );
    }

    return progressPresenter.toTopicProgressResponse(progress, {
      topic,
      totalNotes,
      totalQuizzes,
      totalPlaygrounds,
      totalKeyPoints,
      percentage,
    });
  },

  /**
   * Get progress breakdown for a full learning path
   */
  getLearningPathProgress: async (userId, pathIdOrSlug) => {
    const learningPath = await resolveLearningPath(pathIdOrSlug);
    if (!learningPath) {
      const err = new Error(`Learning path '${pathIdOrSlug}' not found`);
      err.statusCode = 404;
      throw err;
    }

    // 1. Get all published modules for this learning path
    const modules = await Module.find({
      learningPath: learningPath._id,
      published: true,
    }).sort({ order: 1 });

    const moduleIds = modules.map((m) => m._id);

    // 2. Get all sections for these modules
    const sections = await Section.find({
      module: { $in: moduleIds },
      published: true,
    }).sort({ order: 1 });

    const sectionIds = sections.map((s) => s._id);

    // 3. Get all topics for these sections
    const topics = await Topic.find({
      section: { $in: sectionIds },
      published: true,
    }).sort({ order: 1 });

    const topicMap = new Map();
    for (const t of topics) {
      topicMap.set(t._id.toString(), t);
    }

    // 4. Fetch all user progress records for this learning path
    const userProgressRecords =
      await progressRepository.findByUserAndLearningPath(
        userId,
        learningPath._id
      );

    const progressMap = new Map();
    for (const p of userProgressRecords) {
      const topicId = p.topic?._id || p.topic;
      if (topicId) {
        progressMap.set(topicId.toString(), p);
      }
    }

    // 5. Structure hierarchy with completion metrics
    let totalPathTopics = 0;
    let completedPathTopics = 0;

    const structuredModules = modules.map((mod) => {
      const modSections = sections.filter(
        (s) => s.module.toString() === mod._id.toString()
      );

      let modTotalTopics = 0;
      let modCompletedTopics = 0;

      const structuredSections = modSections.map((sec) => {
        const secTopics = topics.filter(
          (t) => t.section.toString() === sec._id.toString()
        );

        let secTotalTopics = secTopics.length;
        let secCompletedTopics = 0;

        const topicItems = secTopics.map((top) => {
          const prog = progressMap.get(top._id.toString());
          const isCompleted = Boolean(prog?.isCompleted);
          if (isCompleted) {
            secCompletedTopics++;
          }
          return {
            id: top._id,
            title: top.title,
            slug: top.slug,
            order: top.order,
            isCompleted,
            percentage: isCompleted ? 100 : 0,
          };
        });

        modTotalTopics += secTotalTopics;
        modCompletedTopics += secCompletedTopics;

        const secPercentage =
          secTotalTopics > 0
            ? Math.round((secCompletedTopics / secTotalTopics) * 100)
            : 0;

        return {
          id: sec._id,
          title: sec.title,
          slug: sec.slug,
          order: sec.order,
          totalTopics: secTotalTopics,
          completedTopics: secCompletedTopics,
          percentage: secPercentage,
          topics: topicItems,
        };
      });

      totalPathTopics += modTotalTopics;
      completedPathTopics += modCompletedTopics;

      const modPercentage =
        modTotalTopics > 0
          ? Math.round((modCompletedTopics / modTotalTopics) * 100)
          : 0;

      return {
        id: mod._id,
        title: mod.title,
        slug: mod.slug,
        order: mod.order,
        duration: mod.duration,
        totalTopics: modTotalTopics,
        completedTopics: modCompletedTopics,
        percentage: modPercentage,
        sections: structuredSections,
      };
    });

    const pathPercentage =
      totalPathTopics > 0
        ? Math.round((completedPathTopics / totalPathTopics) * 100)
        : 0;

    let status = 'NOT_STARTED';
    if (pathPercentage === 100) {
      status = 'COMPLETED';
    } else if (pathPercentage > 0) {
      status = 'IN_PROGRESS';
    }

    return progressPresenter.toLearningPathProgressResponse(
      learningPath,
      structuredModules,
      {
        totalTopics: totalPathTopics,
        completedTopics: completedPathTopics,
        percentage: pathPercentage,
        status,
      }
    );
  },

  /**
   * Get progress for a specific module
   */
  getModuleProgress: async (userId, moduleIdOrSlug) => {
    const moduleDoc = await resolveModule(moduleIdOrSlug);
    if (!moduleDoc) {
      const err = new Error(`Module '${moduleIdOrSlug}' not found`);
      err.statusCode = 404;
      throw err;
    }

    const sections = await Section.find({
      module: moduleDoc._id,
      published: true,
    }).sort({ order: 1 });

    const sectionIds = sections.map((s) => s._id);

    const topics = await Topic.find({
      section: { $in: sectionIds },
      published: true,
    }).sort({ order: 1 });

    const userProgressRecords = await progressRepository.findByUserAndModule(
      userId,
      moduleDoc._id
    );

    const progressMap = new Map();
    for (const p of userProgressRecords) {
      const topicId = p.topic?._id || p.topic;
      if (topicId) {
        progressMap.set(topicId.toString(), p);
      }
    }

    let modTotalTopics = 0;
    let modCompletedTopics = 0;

    const structuredSections = sections.map((sec) => {
      const secTopics = topics.filter(
        (t) => t.section.toString() === sec._id.toString()
      );

      let secTotalTopics = secTopics.length;
      let secCompletedTopics = 0;

      const topicItems = secTopics.map((top) => {
        const prog = progressMap.get(top._id.toString());
        const isCompleted = Boolean(prog?.isCompleted);
        if (isCompleted) {
          secCompletedTopics++;
        }
        return {
          id: top._id,
          title: top.title,
          slug: top.slug,
          order: top.order,
          isCompleted,
          percentage: isCompleted ? 100 : 0,
        };
      });

      modTotalTopics += secTotalTopics;
      modCompletedTopics += secCompletedTopics;

      const secPercentage =
        secTotalTopics > 0
          ? Math.round((secCompletedTopics / secTotalTopics) * 100)
          : 0;

      return {
        id: sec._id,
        title: sec.title,
        slug: sec.slug,
        order: sec.order,
        totalTopics: secTotalTopics,
        completedTopics: secCompletedTopics,
        percentage: secPercentage,
        topics: topicItems,
      };
    });

    const modPercentage =
      modTotalTopics > 0
        ? Math.round((modCompletedTopics / modTotalTopics) * 100)
        : 0;

    return progressPresenter.toModuleProgressResponse(
      moduleDoc,
      structuredSections,
      {
        totalTopics: modTotalTopics,
        completedTopics: modCompletedTopics,
        percentage: modPercentage,
      }
    );
  },

  /**
   * Get overarching user learning progress across all paths
   */
  getOverallProgress: async (userId) => {
    const [allProgress, allLearningPaths, recentActivity] = await Promise.all([
      progressRepository.findByUser(userId),
      LearningPath.find({ published: true }).sort({ order: 1 }),
      progressRepository.getRecentActivity(userId, 8),
    ]);

    let totalCompletedTopics = 0;
    let totalCompletedNotes = 0;
    let totalCompletedQuizzes = 0;
    let totalCompletedPlaygrounds = 0;

    const completedTopicIds = new Set();

    for (const p of allProgress) {
      if (p.isCompleted) {
        totalCompletedTopics++;
        if (p.topic) {
          completedTopicIds.add((p.topic._id || p.topic).toString());
        }
      }
      totalCompletedNotes += p.completedNotes?.length || 0;
      totalCompletedQuizzes += p.completedQuizzes?.length || 0;
      totalCompletedPlaygrounds += p.completedPlaygrounds?.length || 0;
    }

    // Compute progress for each published learning path
    const pathSummaries = [];
    for (const lp of allLearningPaths) {
      const modules = await Module.find({
        learningPath: lp._id,
        published: true,
      });
      const modIds = modules.map((m) => m._id);
      const sections = await Section.find({
        module: { $in: modIds },
        published: true,
      });
      const secIds = sections.map((s) => s._id);
      const totalTopics = await Topic.countDocuments({
        section: { $in: secIds },
        published: true,
      });

      // Completed topics for this LP
      const lpProgress = allProgress.filter(
        (p) =>
          p.learningPath &&
          (p.learningPath._id || p.learningPath).toString() ===
            lp._id.toString() &&
          p.isCompleted
      );
      const completedTopics = lpProgress.length;
      const percentage =
        totalTopics > 0
          ? Math.round((completedTopics / totalTopics) * 100)
          : 0;

      let status = 'NOT_STARTED';
      if (percentage === 100) status = 'COMPLETED';
      else if (percentage > 0) status = 'IN_PROGRESS';

      pathSummaries.push({
        id: lp._id,
        slug: lp.slug,
        title: lp.title,
        category: lp.category,
        level: lp.level,
        totalTopics,
        completedTopics,
        percentage,
        status,
      });
    }

    return progressPresenter.toOverallProgressResponse(
      {
        totalCompletedTopics,
        totalCompletedNotes,
        totalCompletedQuizzes,
        totalCompletedPlaygrounds,
      },
      pathSummaries,
      recentActivity
    );
  },
};

export default progressService;
