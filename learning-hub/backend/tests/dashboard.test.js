import dotenv from 'dotenv';
dotenv.config();

import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { authService } from '../src/services/authService.js';
import { seedLearningPaths } from '../scripts/seedLearningPaths.js';
import { seedModules } from '../scripts/seedModules.js';
import { seedSections } from '../scripts/seedSections.js';
import { seedTopics } from '../scripts/seedTopics.js';
import { seedNotes } from '../scripts/seedNotes.js';
import { Topic } from '../src/models/Topic.js';
import { Quiz } from '../src/models/Quiz.js';

let userToken;
let letTopic;
let testQuiz;

test.before(async () => {
  await connectDB();
  await seedLearningPaths(false);
  await seedModules(false);
  await seedSections(false);
  await seedTopics(false);
  await seedNotes(false);

  const timestamp = Date.now();

  const userResult = await authService.register({
    name: 'Dashboard Learner',
    email: `dash_user_${timestamp}@example.com`,
    password: 'Password123!',
    role: 'USER',
  });
  userToken = userResult.accessToken;

  letTopic = await Topic.findOne({ slug: 'let' });
  assert.ok(letTopic, 'Expected topic let to exist');

  // Find or create a quiz for testing quiz average calculation
  testQuiz = await Quiz.findOne({ topic: letTopic._id });
  if (!testQuiz) {
    testQuiz = await Quiz.create({
      topic: letTopic._id,
      title: 'Scoping & Declaration Quiz',
      slug: 'scoping-and-declaration-quiz',
      passingScore: 70,
      questions: [
        {
          question: 'Can let be redeclared in the same scope?',
          options: ['Yes', 'No'],
          correctAnswer: 1,
          explanation: 'let cannot be redeclared in the same block scope.',
        },
      ],
      published: true,
    });
  }
});

test.after(async () => {
  await disconnectDB();
});

test('1. Anonymous → GET /api/dashboard returns 401 Unauthorized', async () => {
  const res = await request(app).get('/api/dashboard');
  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.body.success, false);
});

test('2. Authenticated User → GET /api/dashboard returns 200 with initial data', async () => {
  const res = await request(app)
    .get('/api/dashboard')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);

  const { data } = res.body;
  assert.ok(data.user, 'Expected user object in dashboard response');
  assert.strictEqual(data.user.name, 'Dashboard Learner');

  assert.ok(data.stats, 'Expected stats object');
  assert.strictEqual(typeof data.stats.overallProgress, 'number');
  assert.strictEqual(typeof data.stats.learningPathsCount, 'number');
  assert.strictEqual(typeof data.stats.completedTopicsCount, 'number');
  assert.strictEqual(typeof data.stats.quizAverage, 'number');

  assert.ok(data.continueLearning, 'Expected continueLearning recommendation');
  assert.ok(Array.isArray(data.learningPaths), 'Expected learningPaths array');
  assert.ok(data.learningPaths.length > 0, 'Expected at least one learning path');
});

test('3. Progress Activity → updates dashboard metrics & continueLearning', async () => {
  // Mark topic 'let' complete via POST /api/progress
  const progRes = await request(app)
    .post('/api/progress')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      topicId: letTopic.slug,
      isCompleted: true,
    });
  assert.strictEqual(progRes.status, 200);

  // Check updated dashboard
  const dashRes = await request(app)
    .get('/api/dashboard')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(dashRes.status, 200);
  const { data } = dashRes.body;

  assert.ok(data.stats.completedTopicsCount >= 1, 'Expected at least 1 completed topic');
  assert.ok(data.stats.overallProgress > 0, 'Expected overall progress to be greater than 0');

  // Verify continueLearning reflects the recent topic
  assert.ok(data.continueLearning, 'Expected continueLearning item');
  assert.strictEqual(data.continueLearning.topic.slug, 'let');
  assert.strictEqual(data.continueLearning.progress, 100);
  assert.strictEqual(data.continueLearning.continueUrl, '/topics/let');
});

test('4. Quiz Attempts → updates quizAverage & totalQuizAttempts', async () => {
  // Submit an attempt with 100% score
  const answersMap = {};
  for (const q of testQuiz.questions) {
    answersMap[q._id.toString()] = q.correctAnswer;
  }
  const attemptRes = await request(app)
    .post(`/api/quizzes/${testQuiz._id}/attempts`)
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      answers: answersMap,
      timeSpentSeconds: 30,
    });

  assert.strictEqual(attemptRes.status, 201);
  assert.strictEqual(attemptRes.body.data.percentage, 100);

  // Check updated dashboard
  const dashRes = await request(app)
    .get('/api/dashboard')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(dashRes.status, 200);
  const { data } = dashRes.body;

  assert.strictEqual(data.stats.totalQuizAttempts, 1);
  assert.strictEqual(data.stats.quizAverage, 100);
  assert.ok(Array.isArray(data.recentQuizAttempts));
  assert.strictEqual(data.recentQuizAttempts.length, 1);
  assert.strictEqual(data.recentQuizAttempts[0].passed, true);
});
