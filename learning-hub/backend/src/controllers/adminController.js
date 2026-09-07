import { User } from '../models/User.js';
import { LearningPath } from '../models/LearningPath.js';
import { Module } from '../models/Module.js';
import { Section } from '../models/Section.js';
import { Topic } from '../models/Topic.js';
import { Note } from '../models/Note.js';
import { Resource } from '../models/Resource.js';
import { Playground } from '../models/Playground.js';
import { Quiz } from '../models/Quiz.js';
import { InterviewQuestion } from '../models/InterviewQuestion.js';
import { getDbStatus } from '../config/db.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class AdminController {
  /**
   * @desc    Get admin platform overview & metrics
   * @route   GET /api/admin/overview
   * @access  Private (Admin only)
   */
  getOverview = async (req, res, next) => {
    try {
      const [
        totalUsers,
        totalAdmins,
        recentUsers,
        learningPathsCount,
        modulesCount,
        sectionsCount,
        topicsCount,
        notesCount,
        resourcesCount,
        playgroundsCount,
        quizzesCount,
        interviewQuestionsCount,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'ADMIN' }),
        User.find().select('name email role createdAt').sort({ createdAt: -1 }).limit(5),
        LearningPath.countDocuments(),
        Module.countDocuments(),
        Section.countDocuments(),
        Topic.countDocuments(),
        Note.countDocuments(),
        Resource.countDocuments(),
        Playground.countDocuments(),
        Quiz.countDocuments(),
        InterviewQuestion.countDocuments(),
      ]);

      const standardUsers = totalUsers - totalAdmins;
      const totalContentItems =
        learningPathsCount +
        modulesCount +
        sectionsCount +
        topicsCount +
        notesCount +
        resourcesCount +
        playgroundsCount +
        quizzesCount +
        interviewQuestionsCount;
      const dbStatus = getDbStatus();

      const overviewData = {
        metrics: {
          totalUsers,
          totalAdmins,
          standardUsers,
          totalContentItems,
        },
        contentMetrics: {
          learningPaths: learningPathsCount,
          modules: modulesCount,
          sections: sectionsCount,
          topics: topicsCount,
          notes: notesCount,
          resources: resourcesCount,
          playgrounds: playgroundsCount,
          quizzes: quizzesCount,
          interviewQuestions: interviewQuestionsCount,
        },
        system: {
          uptimeSeconds: Math.floor(process.uptime()),
          nodeVersion: process.version,
          databaseStatus: dbStatus.state,
          databaseConnected: dbStatus.state === 'connected',
        },
        recentUsers,
        caller: {
          id: req.user._id,
          name: req.user.name,
          role: req.user.role,
        },
      };

      return sendSuccess(res, 'Admin overview retrieved successfully', overviewData, 200);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @desc    Get full list of registered users
   * @route   GET /api/admin/users
   * @access  Private (Admin only)
   */
  getAllUsers = async (req, res, next) => {
    try {
      const users = await User.find()
        .select('name email role createdAt updatedAt')
        .sort({ createdAt: -1 });

      return sendSuccess(res, 'Users retrieved successfully', { users, count: users.length }, 200);
    } catch (error) {
      next(error);
    }
  };
}

export const adminController = new AdminController();
