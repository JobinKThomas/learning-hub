import { Topic } from '../models/Topic.js';
import { Section } from '../models/Section.js';
import { Module } from '../models/Module.js';
import { LearningPath } from '../models/LearningPath.js';
import {
  calculateSectionDuration,
  calculateModuleDuration,
  calculatePathEstimatedHours,
} from '../utils/durationCalculator.js';

/**
 * Synchronizes durations up the hierarchy:
 * Topic changes -> Section duration updates -> Module duration updates -> LearningPath estimatedHours updates.
 *
 * @param {Object} params
 * @param {string|import('mongoose').Types.ObjectId} [params.sectionId]
 * @param {string|import('mongoose').Types.ObjectId} [params.moduleId]
 * @param {string|import('mongoose').Types.ObjectId} [params.learningPathId]
 */
export const syncHierarchyDurations = async ({ sectionId, moduleId, learningPathId } = {}) => {
  try {
    let currentModuleId = moduleId;
    let currentPathId = learningPathId;

    // 1. Update Section duration from its topics
    if (sectionId) {
      const section = await Section.findById(sectionId);
      if (section) {
        const topics = await Topic.find({ section: sectionId });
        const { formatted } = calculateSectionDuration(topics, section);
        await Section.updateOne({ _id: sectionId }, { duration: formatted });

        if (!currentModuleId && section.module) {
          currentModuleId = section.module;
        }
      }
    }

    // 2. Update Module duration from its sections
    if (currentModuleId) {
      const mod = await Module.findById(currentModuleId);
      if (mod) {
        const sections = await Section.find({ module: currentModuleId });
        const { formatted } = calculateModuleDuration(sections, mod);
        await Module.updateOne({ _id: currentModuleId }, { duration: formatted });

        if (!currentPathId && mod.learningPath) {
          currentPathId = mod.learningPath;
        }
      }
    }

    // 3. Update Learning Path estimatedHours from its modules
    if (currentPathId) {
      const path = await LearningPath.findById(currentPathId);
      if (path) {
        const modules = await Module.find({ learningPath: currentPathId });
        if (modules.length > 0) {
          const estimatedHours = calculatePathEstimatedHours(modules, path);
          await LearningPath.updateOne({ _id: currentPathId }, { estimatedHours });
        }
      }
    }
  } catch (err) {
    // Non-blocking catch to ensure CRUD operations complete even if rollup has an issue
    console.error('[DurationRollup] Error syncing hierarchy durations:', err.message);
  }
};

/**
 * Recalculates all durations across the entire database
 */
export const recalculateAllDurations = async () => {
  const sections = await Section.find({});
  for (const s of sections) {
    await syncHierarchyDurations({ sectionId: s._id });
  }

  const modules = await Module.find({});
  for (const m of modules) {
    await syncHierarchyDurations({ moduleId: m._id });
  }

  const paths = await LearningPath.find({});
  for (const p of paths) {
    await syncHierarchyDurations({ learningPathId: p._id });
  }
};
