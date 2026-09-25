import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { LearningPath } from '../src/models/LearningPath.js';
import { Module } from '../src/models/Module.js';
import { Section } from '../src/models/Section.js';
import { Topic } from '../src/models/Topic.js';
import { Note } from '../src/models/Note.js';
import { Playground } from '../src/models/Playground.js';
import { Quiz } from '../src/models/Quiz.js';
import { QuizAttempt } from '../src/models/QuizAttempt.js';
import { InterviewQuestion } from '../src/models/InterviewQuestion.js';
import { Resource } from '../src/models/Resource.js';
import { Progress } from '../src/models/Progress.js';

export async function clearLearningContent(exitOnDone = true) {
  try {
    await connectDB();
    console.log('[DB Clean] Clearing all mock and hardcoded learning content...');

    const [
      pathsDeleted,
      modulesDeleted,
      sectionsDeleted,
      topicsDeleted,
      notesDeleted,
      playgroundsDeleted,
      quizzesDeleted,
      quizAttemptsDeleted,
      interviewQuestionsDeleted,
      resourcesDeleted,
      progressDeleted,
    ] = await Promise.all([
      LearningPath.deleteMany({}),
      Module.deleteMany({}),
      Section.deleteMany({}),
      Topic.deleteMany({}),
      Note.deleteMany({}),
      Playground.deleteMany({}),
      Quiz.deleteMany({}),
      QuizAttempt.deleteMany({}),
      InterviewQuestion.deleteMany({}),
      Resource.deleteMany({}),
      Progress.deleteMany({}),
    ]);

    console.log('[DB Clean] Successfully cleared:');
    console.log(` - LearningPaths: ${pathsDeleted.deletedCount}`);
    console.log(` - Modules: ${modulesDeleted.deletedCount}`);
    console.log(` - Sections: ${sectionsDeleted.deletedCount}`);
    console.log(` - Topics: ${topicsDeleted.deletedCount}`);
    console.log(` - Notes: ${notesDeleted.deletedCount}`);
    console.log(` - Playgrounds: ${playgroundsDeleted.deletedCount}`);
    console.log(` - Quizzes: ${quizzesDeleted.deletedCount}`);
    console.log(` - QuizAttempts: ${quizAttemptsDeleted.deletedCount}`);
    console.log(` - InterviewQuestions: ${interviewQuestionsDeleted.deletedCount}`);
    console.log(` - Resources: ${resourcesDeleted.deletedCount}`);
    console.log(` - Progress: ${progressDeleted.deletedCount}`);
    console.log('[DB Clean] Note: User accounts and admin credentials have been preserved.');

    if (exitOnDone) {
      await disconnectDB();
      process.exit(0);
    }
  } catch (error) {
    console.error('[DB Clean] Error clearing learning content:', error);
    if (exitOnDone) {
      await disconnectDB();
      process.exit(1);
    }
    throw error;
  }
}

if (process.argv[1] && process.argv[1].endsWith('clearLearningContent.js')) {
  clearLearningContent(true);
}
