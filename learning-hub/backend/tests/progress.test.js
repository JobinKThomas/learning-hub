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
import { Note } from '../src/models/Note.js';
import { LearningPath } from '../src/models/LearningPath.js';
import { Module } from '../src/models/Module.js';

let userToken;
let letTopic;
let sampleNote;
let jsPath;
let jsBasicsModule;

test.before(async () => {
  await connectDB();
  await seedLearningPaths(false);
  await seedModules(false);
  await seedSections(false);
  await seedTopics(false);
  await seedNotes(false);

  const timestamp = Date.now();

  const userResult = await authService.register({
    name: 'Progress Learner',
    email: `prog_user_${timestamp}@example.com`,
    password: 'Password123!',
    role: 'USER',
  });
  userToken = userResult.accessToken;

  letTopic = await Topic.findOne({ slug: 'let' });
  assert.ok(letTopic, 'Expected topic let to exist');

  sampleNote = await Note.findOne({ topic: letTopic._id });
  assert.ok(sampleNote, 'Expected sample note for let to exist');

  jsPath = await LearningPath.findOne({ slug: 'javascript' });
  assert.ok(jsPath, 'Expected learning path javascript to exist');

  jsBasicsModule = await Module.findOne({ slug: 'javascript-basics' });
  assert.ok(jsBasicsModule, 'Expected module javascript-basics to exist');
});

test.after(async () => {
  await disconnectDB();
});

// 1. Anonymous -> 401
test('1. Anonymous → GET /api/progress returns 401 Unauthorized', async () => {
  const res = await request(app).get('/api/progress');
  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.body.success, false);
});

// 2. Anonymous -> POST 401
test('2. Anonymous → POST /api/progress returns 401 Unauthorized', async () => {
  const res = await request(app)
    .post('/api/progress')
    .send({ topicId: 'let' });
  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.body.success, false);
});

// 3. Authenticated User -> GET /api/progress returns 200 with stats
test('3. Authenticated User → GET /api/progress returns 200 and initial progress', async () => {
  const res = await request(app)
    .get('/api/progress')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(typeof res.body.data.totalCompletedTopics, 'number');
  assert.ok(Array.isArray(res.body.data.learningPaths));
});

// 4. POST /api/progress without topicId returns 400
test('4. POST /api/progress without topicId returns 400 Validation Error', async () => {
  const res = await request(app)
    .post('/api/progress')
    .set('Authorization', `Bearer ${userToken}`)
    .send({ completed: true });

  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
});

// 5. POST /api/progress with non-existent topic returns 404
test('5. POST /api/progress with non-existent topic returns 404 Not Found', async () => {
  const res = await request(app)
    .post('/api/progress')
    .set('Authorization', `Bearer ${userToken}`)
    .send({ topicId: 'non-existent-topic-slug-123' });

  assert.strictEqual(res.status, 404);
  assert.strictEqual(res.body.success, false);
});

// 6. User marks Note as completed -> POST /api/progress
test('6. Authenticated User → marks Note complete via POST /api/progress', async () => {
  const res = await request(app)
    .post('/api/progress')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      topicId: 'let',
      noteId: sampleNote.slug,
      completed: true,
    });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.topicSlug, 'let');
  assert.ok(res.body.data.completedNotes.includes(sampleNote._id.toString()));
  assert.ok(res.body.data.stats.completedNotesCount >= 1);
});

// 7. User checks off a key point -> POST /api/progress
test('7. Authenticated User → checks off key point via POST /api/progress', async () => {
  const res = await request(app)
    .post('/api/progress')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      topicId: 'let',
      keyPointIndex: 0,
      completed: true,
    });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.data.completedKeyPoints.includes(0));
});

// 8. GET /api/progress/topic/:topicId returns topic stats
test('8. Authenticated User → GET /api/progress/topic/let returns topic stats and percentage', async () => {
  const res = await request(app)
    .get('/api/progress/topic/let')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.topicSlug, 'let');
  assert.ok(res.body.data.completedNotes.length >= 1);
  assert.ok(res.body.data.stats.percentage > 0);
});

// 9. User marks entire Topic as completed
test('9. Authenticated User → marks topic as completed', async () => {
  const res = await request(app)
    .post('/api/progress')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      topicId: 'let',
      isCompleted: true,
    });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.isCompleted, true);
  assert.strictEqual(res.body.data.stats.percentage, 100);
  assert.ok(res.body.data.completedAt);
});

// 10. GET /api/progress/learning-path/:id returns full hierarchy breakdown
test('10. Authenticated User → GET /api/progress/learning-path/javascript returns hierarchical progress', async () => {
  const res = await request(app)
    .get('/api/progress/learning-path/javascript')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.learningPath.slug, 'javascript');
  assert.ok(res.body.data.totalTopics >= 1);
  assert.ok(res.body.data.completedTopics >= 1);
  assert.ok(Array.isArray(res.body.data.modules));

  const jsBasics = res.body.data.modules.find(
    (m) => m.slug === 'javascript-basics'
  );
  assert.ok(jsBasics, 'Expected module javascript-basics in learning path response');
  assert.ok(jsBasics.completedTopics >= 1);
});

// 11. GET /api/progress/module/:id returns module progress
test('11. Authenticated User → GET /api/progress/module/javascript-basics returns module progress', async () => {
  const res = await request(app)
    .get('/api/progress/module/javascript-basics')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.module.slug, 'javascript-basics');
  assert.ok(res.body.data.completedTopics >= 1);
  assert.ok(Array.isArray(res.body.data.sections));
});

// 12. User toggles Note off (uncomplete) -> POST /api/progress
test('12. Authenticated User → uncompletes Note via POST /api/progress with completed: false', async () => {
  const res = await request(app)
    .post('/api/progress')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      topicId: 'let',
      noteId: sampleNote.slug,
      completed: false,
    });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(!res.body.data.completedNotes.includes(sampleNote._id.toString()));
});
