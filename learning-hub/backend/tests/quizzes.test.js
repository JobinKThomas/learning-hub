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
import { seedQuizzes } from '../scripts/seedQuizzes.js';

let adminToken;
let userToken;
let createdQuizId;
let sampleQuizId;
let sampleQuiz;

test.before(async () => {
  await connectDB();
  await seedLearningPaths(false);
  await seedModules(false);
  await seedSections(false);
  await seedTopics(false);
  await seedQuizzes(false);

  const timestamp = Date.now();

  const adminResult = await authService.register({
    name: 'Quiz Admin',
    email: `quiz_admin_${timestamp}@example.com`,
    password: 'Password123!',
    role: 'ADMIN',
  });
  adminToken = adminResult.accessToken;

  const userResult = await authService.register({
    name: 'Quiz Learner',
    email: `quiz_user_${timestamp}@example.com`,
    password: 'Password123!',
    role: 'USER',
  });
  userToken = userResult.accessToken;
});

// 1. Anonymous -> 401
test('1. Anonymous → GET /api/quizzes returns 401 Unauthorized', async () => {
  const res = await request(app).get('/api/quizzes');
  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.body.success, false);
});

// 2. Authenticated User -> 200 list
test('2. Authenticated User → GET /api/quizzes returns 200 and list of quizzes', async () => {
  const res = await request(app)
    .get('/api/quizzes')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(Array.isArray(res.body.data.quizzes));
  assert.ok(res.body.data.quizzes.length >= 3);

  sampleQuiz = res.body.data.quizzes[0];
  sampleQuizId = sampleQuiz.id;
});

// 3. Filter by topic
test('3. Authenticated User → GET /api/quizzes?topic=let returns quizzes for let', async () => {
  const res = await request(app)
    .get('/api/quizzes?topic=let')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.data.quizzes.length > 0);
  assert.strictEqual(res.body.data.quizzes[0].topic.slug, 'let');
});

// 4. Nested topic endpoint
test('4. Authenticated User → GET /api/topics/let/quizzes returns nested quizzes for topic let', async () => {
  const res = await request(app)
    .get('/api/topics/let/quizzes')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.data.quizzes.length > 0);
  assert.strictEqual(res.body.data.quizzes[0].slug, 'let-scoping-quiz');
});

// 5. GET quiz by ID / slug for taking (answers sanitized for students)
test('5. Authenticated User → GET /api/quizzes/let-scoping-quiz returns quiz with questions and 5-tier lineage', async () => {
  const res = await request(app)
    .get('/api/quizzes/let-scoping-quiz')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  const data = res.body.data;
  assert.strictEqual(data.slug, 'let-scoping-quiz');
  assert.ok(Array.isArray(data.questions));
  assert.strictEqual(data.questions.length, 3);
  assert.ok(data.questions[0].options.length >= 2);

  // Sanitized for taking: student does not see correctAnswer field
  assert.strictEqual(data.questions[0].correctAnswer, undefined);

  // 5-Tier lineage check
  assert.strictEqual(data.topic.slug, 'let');
  assert.strictEqual(data.topic.section.slug, 'variables');
  assert.strictEqual(data.topic.section.module.slug, 'javascript-basics');
  assert.strictEqual(data.topic.section.module.learningPath.slug, 'javascript');
});

// 6. Non-existent quiz returns 404
test('6. GET /api/quizzes/non-existent-quiz-slug returns 404 Not Found', async () => {
  const res = await request(app)
    .get('/api/quizzes/non-existent-quiz-slug')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 404);
  assert.strictEqual(res.body.success, false);
});

// 7. Submit quiz - 100% Correct answers -> Passed
test('7. POST /api/quizzes/:id/submit evaluates 100% correct answers to Passed', async () => {
  const quizRes = await request(app)
    .get('/api/quizzes/let-scoping-quiz?mode=edit')
    .set('Authorization', `Bearer ${adminToken}`);

  const qData = quizRes.body.data;
  const qId = qData.id;

  // Build 100% correct answers map
  const answers = {};
  qData.questions.forEach((q) => {
    answers[q.id] = q.correctAnswer;
  });

  const res = await request(app)
    .post(`/api/quizzes/${qId}/submit`)
    .set('Authorization', `Bearer ${userToken}`)
    .send({ answers });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  const evalData = res.body.data;
  assert.strictEqual(evalData.score, 3);
  assert.strictEqual(evalData.totalQuestions, 3);
  assert.strictEqual(evalData.percentage, 100);
  assert.strictEqual(evalData.passed, true);
  assert.strictEqual(evalData.results.length, 3);
  assert.strictEqual(evalData.results[0].isCorrect, true);
  assert.ok(evalData.results[0].explanation);
});

// 8. Submit quiz - Failing score -> Failed
test('8. POST /api/quizzes/:id/submit evaluates incorrect answers to Failed', async () => {
  const quizRes = await request(app)
    .get('/api/quizzes/let-scoping-quiz?mode=edit')
    .set('Authorization', `Bearer ${adminToken}`);

  const qData = quizRes.body.data;
  const qId = qData.id;

  // Build completely incorrect answers map (option 3 for all)
  const answers = {};
  qData.questions.forEach((q) => {
    answers[q.id] = q.correctAnswer === 0 ? 1 : 0;
  });

  const res = await request(app)
    .post(`/api/quizzes/${qId}/submit`)
    .set('Authorization', `Bearer ${userToken}`)
    .send({ answers });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  const evalData = res.body.data;
  assert.strictEqual(evalData.score, 0);
  assert.strictEqual(evalData.percentage, 0);
  assert.strictEqual(evalData.passed, false);
});

// 9. Standard User -> POST 403
test('9. Standard User → POST /api/quizzes returns 403 Forbidden', async () => {
  const res = await request(app)
    .post('/api/quizzes')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      title: 'Hacked Quiz',
      topic: 'let',
    });

  assert.strictEqual(res.status, 403);
  assert.strictEqual(res.body.success, false);
});

// 10. Admin -> POST 201
test('10. Admin → POST /api/quizzes returns 201 and creates new quiz', async () => {
  const res = await request(app)
    .post('/api/quizzes')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      title: `Scope & Closures Mastery Quiz ${Date.now()}`,
      topic: 'let',
      description: 'Test your mastery of lexical environments and nested functions',
      passingScore: 75,
      timeLimitMinutes: 10,
      order: 10,
      published: true,
      questions: [
        {
          question: 'What is a closure in JavaScript?',
          options: [
            'A way to close browser windows',
            'A function bundled together with references to its lexical environment',
            'A syntax error in loops',
            'An object destructor',
          ],
          correctAnswer: 1,
          explanation: 'Closures allow an inner function to access variables from an outer function even after the outer function has returned.',
        },
      ],
    });

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.data.id);
  createdQuizId = res.body.data.id;
});

// 11. Standard User -> PUT 403
test('11. Standard User → PUT /api/quizzes/:id returns 403 Forbidden', async () => {
  const res = await request(app)
    .put(`/api/quizzes/${createdQuizId}`)
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      title: 'Hacked Quiz Update',
    });

  assert.strictEqual(res.status, 403);
  assert.strictEqual(res.body.success, false);
});

// 12. Admin -> PUT 200
test('12. Admin → PUT /api/quizzes/:id returns 200 and updates quiz', async () => {
  const res = await request(app)
    .put(`/api/quizzes/${createdQuizId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      title: 'Scope & Closures Mastery Quiz (Updated Edition)',
      passingScore: 80,
    });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.title, 'Scope & Closures Mastery Quiz (Updated Edition)');
  assert.strictEqual(res.body.data.passingScore, 80);
});

// 13. Admin -> DELETE 200
test('13. Admin → DELETE /api/quizzes/:id returns 200 and deletes quiz', async () => {
  const res = await request(app)
    .delete(`/api/quizzes/${createdQuizId}`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);

  // Verify 404
  const verifyRes = await request(app)
    .get(`/api/quizzes/${createdQuizId}`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.strictEqual(verifyRes.status, 404);
});

test.after(async () => {
  await disconnectDB();
});
