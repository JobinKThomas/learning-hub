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
import { Quiz } from '../src/models/Quiz.js';

let adminToken;
let user1Token;
let user2Token;
let sampleQuiz;
let firstAttemptId;

test.before(async () => {
  await connectDB();
  await seedLearningPaths(false);
  await seedModules(false);
  await seedSections(false);
  await seedTopics(false);
  await seedQuizzes(false);

  const timestamp = Date.now();

  const adminResult = await authService.register({
    name: 'Attempt Admin',
    email: `att_admin_${timestamp}@example.com`,
    password: 'Password123!',
    role: 'ADMIN',
  });
  adminToken = adminResult.accessToken;

  const user1Result = await authService.register({
    name: 'Learner One',
    email: `att_user1_${timestamp}@example.com`,
    password: 'Password123!',
    role: 'USER',
  });
  user1Token = user1Result.accessToken;

  const user2Result = await authService.register({
    name: 'Learner Two',
    email: `att_user2_${timestamp}@example.com`,
    password: 'Password123!',
    role: 'USER',
  });
  user2Token = user2Result.accessToken;

  sampleQuiz = await Quiz.findOne({ slug: 'let-scoping-quiz' });
  assert.ok(sampleQuiz, 'Expected sample quiz let-scoping-quiz to exist');
});

test.after(async () => {
  await disconnectDB();
});

// 1. Anonymous -> 401
test('1. Anonymous → POST /api/quizzes/:id/attempts returns 401 Unauthorized', async () => {
  const res = await request(app)
    .post(`/api/quizzes/${sampleQuiz._id}/attempts`)
    .send({ answers: {} });

  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.body.success, false);
});

// 2. User 1 submits 1st attempt with 100% correct answers
test('2. Learner 1 → POST /api/quizzes/:id/attempts creates attempt #1 with 100% score (Passed ✅)', async () => {
  const q1 = sampleQuiz.questions[0];
  const q2 = sampleQuiz.questions[1];
  const q3 = sampleQuiz.questions[2];

  const answers = {
    [q1._id.toString()]: q1.correctAnswer,
    [q2._id.toString()]: q2.correctAnswer,
    [q3._id.toString()]: q3.correctAnswer,
  };

  const res = await request(app)
    .post(`/api/quizzes/${sampleQuiz._id}/attempts`)
    .set('Authorization', `Bearer ${user1Token}`)
    .send({
      answers,
      timeSpentSeconds: 45,
    });

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.attemptNumber, 1);
  assert.strictEqual(res.body.data.score, 3);
  assert.strictEqual(res.body.data.totalQuestions, 3);
  assert.strictEqual(res.body.data.percentage, 100);
  assert.strictEqual(res.body.data.passed, true);
  assert.strictEqual(res.body.data.timeSpentSeconds, 45);
  assert.strictEqual(res.body.data.answers.length, 3);
  assert.strictEqual(res.body.data.answers[0].isCorrect, true);

  firstAttemptId = res.body.data.id;
});

// 3. User 1 submits 2nd attempt with 0% score
test('3. Learner 1 → POST /api/quizzes/:id/attempts creates attempt #2 with 0% score (Failed ❌)', async () => {
  const q1 = sampleQuiz.questions[0];
  const q2 = sampleQuiz.questions[1];
  const q3 = sampleQuiz.questions[2];

  const answers = {
    [q1._id.toString()]: (q1.correctAnswer + 1) % q1.options.length,
    [q2._id.toString()]: (q2.correctAnswer + 1) % q2.options.length,
    [q3._id.toString()]: (q3.correctAnswer + 1) % q3.options.length,
  };

  const res = await request(app)
    .post(`/api/quizzes/${sampleQuiz.slug}/attempts`)
    .set('Authorization', `Bearer ${user1Token}`)
    .send({
      answers,
      timeSpentSeconds: 90,
    });

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.attemptNumber, 2);
  assert.strictEqual(res.body.data.score, 0);
  assert.strictEqual(res.body.data.percentage, 0);
  assert.strictEqual(res.body.data.passed, false);
  assert.strictEqual(res.body.data.timeSpentSeconds, 90);
});

// 4. Validation failure: missing answers
test('4. Validation → POST /api/quizzes/:id/attempts without answers returns 400 Bad Request', async () => {
  const res = await request(app)
    .post(`/api/quizzes/${sampleQuiz._id}/attempts`)
    .set('Authorization', `Bearer ${user1Token}`)
    .send({});

  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
});

// 5. Non-existent quiz
test('5. POST /api/quizzes/non-existent-quiz/attempts returns 404 Not Found', async () => {
  const res = await request(app)
    .post('/api/quizzes/non-existent-quiz/attempts')
    .set('Authorization', `Bearer ${user1Token}`)
    .send({ answers: {} });

  assert.strictEqual(res.status, 404);
  assert.strictEqual(res.body.success, false);
});

// 6. Learner 1 fetches attempts for this quiz: GET /api/quizzes/:id/attempts
test('6. Learner 1 → GET /api/quizzes/:id/attempts returns attempt history and summary stats', async () => {
  const res = await request(app)
    .get(`/api/quizzes/${sampleQuiz._id}/attempts`)
    .set('Authorization', `Bearer ${user1Token}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.stats.totalAttempts, 2);
  assert.strictEqual(res.body.data.stats.bestScore, 3);
  assert.strictEqual(res.body.data.stats.bestPercentage, 100);
  assert.strictEqual(res.body.data.stats.hasPassed, true);
  assert.strictEqual(res.body.data.attempts.length, 2);
  assert.strictEqual(res.body.data.attempts[0].attemptNumber, 2);
  assert.strictEqual(res.body.data.attempts[1].attemptNumber, 1);
});

// 7. Learner 1 fetches all their attempts: GET /api/quiz-attempts
test('7. Learner 1 → GET /api/quiz-attempts returns list of user attempts across quizzes', async () => {
  const res = await request(app)
    .get('/api/quiz-attempts')
    .set('Authorization', `Bearer ${user1Token}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.total, 2);
  assert.strictEqual(res.body.data.attempts.length, 2);
  assert.ok(res.body.data.attempts[0].quiz);
});

// 8. Learner 1 views specific attempt: GET /api/quiz-attempts/:id
test('8. Learner 1 → GET /api/quiz-attempts/:id returns full question review for their own attempt', async () => {
  const res = await request(app)
    .get(`/api/quiz-attempts/${firstAttemptId}`)
    .set('Authorization', `Bearer ${user1Token}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.id, firstAttemptId);
  assert.strictEqual(res.body.data.attemptNumber, 1);
  assert.strictEqual(res.body.data.score, 3);
  assert.strictEqual(res.body.data.answers.length, 3);
  assert.ok(res.body.data.answers[0].explanation);
});

// 9. Ownership Security: Learner 2 tries to view Learner 1's attempt -> 403 Forbidden
test("9. Security Guard → Learner 2 GET /api/quiz-attempts/:id for Learner 1's attempt returns 403 Forbidden", async () => {
  const res = await request(app)
    .get(`/api/quiz-attempts/${firstAttemptId}`)
    .set('Authorization', `Bearer ${user2Token}`);

  assert.strictEqual(res.status, 403);
  assert.strictEqual(res.body.success, false);
});

// 10. Admin can inspect any learner's attempt -> 200 OK
test("10. Admin Privilege → Admin GET /api/quiz-attempts/:id for Learner 1's attempt returns 200 OK", async () => {
  const res = await request(app)
    .get(`/api/quiz-attempts/${firstAttemptId}`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.id, firstAttemptId);
});

// 11. Anonymous -> GET /api/quiz-attempts returns 401
test('11. Anonymous → GET /api/quiz-attempts returns 401 Unauthorized', async () => {
  const res = await request(app).get('/api/quiz-attempts');

  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.body.success, false);
});

// 12. Invalid attempt ID
test('12. GET /api/quiz-attempts/invalid-id returns 400 Bad Request', async () => {
  const res = await request(app)
    .get('/api/quiz-attempts/invalid-id')
    .set('Authorization', `Bearer ${user1Token}`);

  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
});

// 13. Non-existent attempt ID
test('13. GET /api/quiz-attempts/6a9eb0000000000000000000 returns 404 Not Found', async () => {
  const res = await request(app)
    .get('/api/quiz-attempts/6a9eb0000000000000000000')
    .set('Authorization', `Bearer ${user1Token}`);

  assert.strictEqual(res.status, 404);
  assert.strictEqual(res.body.success, false);
});
