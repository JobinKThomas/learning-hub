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
import { seedInterviewQuestions } from '../scripts/seedInterviewQuestions.js';
import { Topic } from '../src/models/Topic.js';
import { InterviewQuestion } from '../src/models/InterviewQuestion.js';

let adminToken;
let userToken;
let letTopic;
let sampleQuestion;
let createdQuestionId;

test.before(async () => {
  await connectDB();
  await seedLearningPaths(false);
  await seedModules(false);
  await seedSections(false);
  await seedTopics(false);
  await seedInterviewQuestions(false);

  const timestamp = Date.now();

  const adminResult = await authService.register({
    name: 'IQ Admin',
    email: `iq_admin_${timestamp}@example.com`,
    password: 'Password123!',
    role: 'ADMIN',
  });
  adminToken = adminResult.accessToken;

  const userResult = await authService.register({
    name: 'IQ Learner',
    email: `iq_user_${timestamp}@example.com`,
    password: 'Password123!',
    role: 'USER',
  });
  userToken = userResult.accessToken;

  letTopic = await Topic.findOne({ slug: 'let' });
  assert.ok(letTopic, 'Expected topic let to exist');

  sampleQuestion = await InterviewQuestion.findOne({ topic: letTopic._id });
  assert.ok(sampleQuestion, 'Expected sample interview question for let to exist');
});

test.after(async () => {
  await disconnectDB();
});

// 1. Anonymous -> 401
test('1. Anonymous → GET /api/interview-questions returns 401 Unauthorized', async () => {
  const res = await request(app).get('/api/interview-questions');
  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.body.success, false);
});

// 2. Authenticated User -> 200 list
test('2. Authenticated User → GET /api/interview-questions returns 200 and list of questions', async () => {
  const res = await request(app)
    .get('/api/interview-questions')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));
  assert.ok(res.body.data.length >= 1);
});

// 3. Authenticated User -> GET /api/interview-questions?topic=let
test('3. Authenticated User → GET /api/interview-questions?topic=let filters by topic', async () => {
  const res = await request(app)
    .get('/api/interview-questions?topic=let')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.data.length >= 1);
  assert.strictEqual(res.body.data[0].topic.slug, 'let');
});

// 4. Authenticated User -> Nested topic route GET /api/topics/let/interview-questions
test('4. Authenticated User → GET /api/topics/let/interview-questions returns questions for topic let', async () => {
  const res = await request(app)
    .get('/api/topics/let/interview-questions')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.data.length >= 1);
  assert.strictEqual(res.body.data[0].topic.slug, 'let');
});

// 5. Authenticated User -> GET /api/interview-questions/:id
test('5. Authenticated User → GET /api/interview-questions/:id returns 200 with answer and 5-tier lineage', async () => {
  const res = await request(app)
    .get(`/api/interview-questions/${sampleQuestion._id}`)
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.id, sampleQuestion._id.toString());
  assert.ok(res.body.data.question);
  assert.ok(res.body.data.answer);
  assert.ok(res.body.data.topic);
});

// 6. Non-existent ID -> 404
test('6. GET /api/interview-questions/6a9eb0000000000000000000 returns 404 Not Found', async () => {
  const res = await request(app)
    .get('/api/interview-questions/6a9eb0000000000000000000')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 404);
  assert.strictEqual(res.body.success, false);
});

// 7. Standard User cannot create -> 403
test('7. Standard User → POST /api/interview-questions returns 403 Forbidden', async () => {
  const res = await request(app)
    .post('/api/interview-questions')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      topic: letTopic._id.toString(),
      question: 'Can you explain the temporal dead zone in your own words?',
      answer: 'It is the period where variables are uninitialized.',
    });

  assert.strictEqual(res.status, 403);
  assert.strictEqual(res.body.success, false);
});

// 8. Admin creates question -> 201
test('8. Admin → POST /api/interview-questions creates new interview question (201 Created)', async () => {
  const res = await request(app)
    .post('/api/interview-questions')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      topic: letTopic._id.toString(),
      question: 'What happens if you redeclare a variable with let in the exact same scope?',
      answer: 'A SyntaxError: Identifier has already been declared is thrown immediately during parsing.',
      codeSnippet: 'let x = 1;\nlet x = 2; // SyntaxError!',
      difficulty: 'BEGINNER',
      frequency: 'FREQUENT',
      order: 10,
      tags: ['let', 'syntax-error', 're-declaration'],
      published: true,
    });

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.difficulty, 'BEGINNER');
  assert.strictEqual(res.body.data.order, 10);
  createdQuestionId = res.body.data.id;
});

// 9. Standard User cannot update -> 403
test('9. Standard User → PUT /api/interview-questions/:id returns 403 Forbidden', async () => {
  const res = await request(app)
    .put(`/api/interview-questions/${createdQuestionId}`)
    .set('Authorization', `Bearer ${userToken}`)
    .send({ difficulty: 'ADVANCED' });

  assert.strictEqual(res.status, 403);
  assert.strictEqual(res.body.success, false);
});

// 10. Admin updates question -> 200
test('10. Admin → PUT /api/interview-questions/:id updates question (200 OK)', async () => {
  const res = await request(app)
    .put(`/api/interview-questions/${createdQuestionId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      difficulty: 'INTERMEDIATE',
      published: false,
    });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.difficulty, 'INTERMEDIATE');
  assert.strictEqual(res.body.data.published, false);
});

// 11. Standard User cannot delete -> 403
test('11. Standard User → DELETE /api/interview-questions/:id returns 403 Forbidden', async () => {
  const res = await request(app)
    .delete(`/api/interview-questions/${createdQuestionId}`)
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 403);
  assert.strictEqual(res.body.success, false);
});

// 12. Admin deletes question -> 200
test('12. Admin → DELETE /api/interview-questions/:id returns 200 and deletes question', async () => {
  const res = await request(app)
    .delete(`/api/interview-questions/${createdQuestionId}`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);

  // Subsequent GET returns 404
  const verifyRes = await request(app)
    .get(`/api/interview-questions/${createdQuestionId}`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.strictEqual(verifyRes.status, 404);
});
