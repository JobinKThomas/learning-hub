import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
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

export async function cleanUnwantedData() {
  try {
    await connectDB();
    console.log('[Clean DB] Cleaning unwanted test accounts, old questions, and mock learning content...');

    // 1. Defined list of legitimate user accounts to preserve
    const preservedEmails = [
      'admin@admin.com',
      'jobin@gmail.com',
      'jobint@opentrends.net',
      'jobintest1@gmail.com',
    ];

    // Ensure preserved accounts have proper names and uppercase roles
    await User.updateOne(
      { email: 'admin@admin.com' },
      { $set: { name: 'Admin', role: 'ADMIN' } }
    );
    await User.updateOne(
      { email: 'jobin@gmail.com' },
      { $set: { name: 'Jobin', role: 'ADMIN' } }
    );
    await User.updateOne(
      { email: 'jobint@opentrends.net' },
      { $set: { name: 'Jobin Thomas', role: 'USER' } }
    );
    await User.updateOne(
      { email: 'jobintest1@gmail.com' },
      { $set: { name: 'Jobin', role: 'USER' } }
    );

    // Delete all users NOT in preserved list
    const usersDeleted = await User.deleteMany({
      email: { $nin: preservedEmails },
    });
    console.log(`[Clean DB] Deleted ${usersDeleted.deletedCount} unwanted/test user accounts.`);

    // 2. Wipe all learning content so system has zero unwanted mock data
    const [
      pathsDel,
      modsDel,
      secsDel,
      topsDel,
      notesDel,
      playsDel,
      quizzesDel,
      attemptsDel,
      iqDel,
      resDel,
      progDel,
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

    console.log(`[Clean DB] Cleared learning content:`);
    console.log(` - LearningPaths: ${pathsDel.deletedCount}`);
    console.log(` - Modules: ${modsDel.deletedCount}`);
    console.log(` - Sections: ${secsDel.deletedCount}`);
    console.log(` - Topics: ${topsDel.deletedCount}`);
    console.log(` - Notes: ${notesDel.deletedCount}`);
    console.log(` - Playgrounds: ${playsDel.deletedCount}`);
    console.log(` - Quizzes: ${quizzesDel.deletedCount}`);
    console.log(` - QuizAttempts: ${attemptsDel.deletedCount}`);
    console.log(` - InterviewQuestions: ${iqDel.deletedCount}`);
    console.log(` - Resources: ${resDel.deletedCount}`);
    console.log(` - Progress: ${progDel.deletedCount}`);

    // 3. Clear legacy orphaned collections if they exist
    try {
      const qDel = await mongoose.connection.db.collection('questions').deleteMany({});
      console.log(` - Legacy Questions: ${qDel.deletedCount}`);
    } catch (_) {}

    try {
      const sDel = await mongoose.connection.db.collection('sessions').deleteMany({});
      console.log(` - Stale Sessions: ${sDel.deletedCount}`);
    } catch (_) {}

    // 4. Verification summary
    const remainingUsers = await User.find({}).select('email name role');
    console.log('\n[Clean DB] Preserved Users in Database:');
    for (const u of remainingUsers) {
      console.log(` - ${u.email} (${u.name}) [Role: ${u.role}]`);
    }

    const totalAccounts = await User.countDocuments();
    const adminAccounts = await User.countDocuments({ role: 'ADMIN' });
    console.log(`\nSummary:`);
    console.log(`Total Accounts: ${totalAccounts}`);
    console.log(`Administrators: ${adminAccounts}`);
    console.log(`Total Content Units: 0`);

    await disconnectDB();
    console.log('[Clean DB] Finished successfully.');
  } catch (err) {
    console.error('[Clean DB] Error cleaning database:', err);
    process.exit(1);
  }
}

cleanUnwantedData().then(() => process.exit(0));
