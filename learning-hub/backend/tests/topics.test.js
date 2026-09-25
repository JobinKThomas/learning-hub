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

let adminToken;
let userToken;
let createdTopicId;

test.before(async () => {
  await connectDB();
  await seedLearningPaths(false);
  await seedModules(false);
  await seedSections(false);
  await seedTopics(false);

  const timestamp = Date.now();

  const adminResult = await authService.register({
    name: 'Topic Admin',
    email: `top_admin_${timestamp}@example.com`,
    password: 'Password123!',
    role: 'ADMIN',
  });
  adminToken = adminResult.accessToken;

  const userResult = await authService.register({
    name: 'Topic Learner',
    email: `top_user_${timestamp}@example.com`,
    password: 'Password123!',
    role: 'USER',
  });
  userToken = userResult.accessToken;
});

// 1. GET /api/topics - Anonymous -> 401
test('1. Anonymous → GET /api/topics returns 401 Unauthorized', async () => {
  const res = await request(app).get('/api/topics');
  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.body.success, false);
});

// 2. GET /api/topics - Authenticated User -> 200
test('2. Authenticated User → GET /api/topics returns 200 and list of topics', async () => {
  const res = await request(app)
    .get('/api/topics')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(Array.isArray(res.body.data.topics));
  assert.ok(res.body.data.topics.length >= 3);

  const letTopic = res.body.data.topics.find((t) => t.slug === 'let');
  assert.ok(letTopic, "Should find 'let' topic");
  assert.strictEqual(letTopic.title, 'let');
});

// 3. GET /api/topics?section=variables - Authenticated User -> 200 with var, let, const
test('3. Authenticated User → GET /api/topics?section=variables returns 200 with var, let, const', async () => {
  const res = await request(app)
    .get('/api/topics?section=variables')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(Array.isArray(res.body.data.topics));
  assert.ok(res.body.data.topics.length >= 3);

  const slugs = res.body.data.topics.map((t) => t.slug);
  assert.ok(slugs.includes('var'), "Must include 'var'");
  assert.ok(slugs.includes('let'), "Must include 'let'");
  assert.ok(slugs.includes('const'), "Must include 'const'");
});

// 4. GET /api/sections/variables/topics - Authenticated User -> 200 with var, let, const
test('4. Authenticated User → GET /api/sections/variables/topics returns 200 with var, let, const', async () => {
  const res = await request(app)
    .get('/api/sections/variables/topics')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(Array.isArray(res.body.data.topics));
  assert.ok(res.body.data.topics.length >= 3);

  const slugs = res.body.data.topics.map((t) => t.slug);
  assert.ok(slugs.includes('var'));
  assert.ok(slugs.includes('let'));
  assert.ok(slugs.includes('const'));
});

// 5. GET /api/topics/let - Authenticated User -> 200 with code examples and key points
test('5. Authenticated User → GET /api/topics/let returns 200 with code examples and key points', async () => {
  const res = await request(app)
    .get('/api/topics/let')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.slug, 'let');
  assert.strictEqual(res.body.data.title, 'let');
  assert.ok(Array.isArray(res.body.data.codeExamples));
  assert.ok(res.body.data.codeExamples.length > 0);
  assert.ok(Array.isArray(res.body.data.keyPoints));
  assert.ok(res.body.data.keyPoints.length > 0);
  assert.ok(res.body.data.section, 'Parent section must be populated');
  assert.strictEqual(res.body.data.section.slug, 'variables');
});

// 6. GET /api/topics/non-existent-slug - Non-existent slug -> 404
test('6. GET /api/topics/non-existent-slug returns 404 Not Found', async () => {
  const res = await request(app)
    .get('/api/topics/non-existent-slug')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 404);
  assert.strictEqual(res.body.success, false);
});

// 7. POST /api/topics - Standard User -> 403 Forbidden
test('7. Standard User → POST /api/topics returns 403 Forbidden', async () => {
  const res = await request(app)
    .post('/api/topics')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      title: 'Hacking Scope',
      section: 'variables',
      description: 'Unauthorized topic creation attempt',
    });

  assert.strictEqual(res.status, 403);
  assert.strictEqual(res.body.success, false);
});

// 8. POST /api/topics - Admin -> 201 Created
test('8. Admin → POST /api/topics returns 201 and creates new topic', async () => {
  const timestamp = Date.now();
  const newTopic = {
    title: `Temporal Dead Zone ${timestamp}`,
    slug: `temporal-dead-zone-${timestamp}`,
    section: 'variables',
    summary: 'Understanding the TDZ lifecycle',
    description: 'Deep dive into why let and const cannot be accessed before lexical binding execution.',
    duration: '20 mins',
    order: 4,
    keyPoints: ['Occurs between entering scope and declaration', 'Throws ReferenceError on access'],
    codeExamples: [
      {
        title: 'TDZ Trigger',
        language: 'javascript',
        code: 'console.log(x);\nlet x = 5;',
        explanation: 'Throws ReferenceError',
      },
    ],
    content: '# TDZ in Depth\n\nExplanation of the compilation phase.',
  };

  const res = await request(app)
    .post('/api/topics')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(newTopic);

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.title, newTopic.title);
  assert.strictEqual(res.body.data.slug, newTopic.slug);
  assert.ok(res.body.data.id);
  createdTopicId = res.body.data.id;
});

// 9. PUT /api/topics/:id - Standard User -> 403 Forbidden
test('9. Standard User → PUT /api/topics/:id returns 403 Forbidden', async () => {
  const res = await request(app)
    .put(`/api/topics/${createdTopicId}`)
    .set('Authorization', `Bearer ${userToken}`)
    .send({ title: 'Tampered Topic Title' });

  assert.strictEqual(res.status, 403);
  assert.strictEqual(res.body.success, false);
});

// 10. Admin → PUT /api/topics/:id returns 200 and updates topic
test('10. Admin → PUT /api/topics/:id returns 200 and updates topic', async () => {
  const res = await request(app)
    .put(`/api/topics/${createdTopicId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      title: 'Temporal Dead Zone Masterclass',
      duration: '30 mins',
    });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.title, 'Temporal Dead Zone Masterclass');
  assert.strictEqual(res.body.data.duration, '30 mins');
});

// 11. Admin → DELETE /api/topics/:id returns 200 and deletes topic
test('11. Admin → DELETE /api/topics/:id returns 200 and deletes topic', async () => {
  const res = await request(app)
    .delete(`/api/topics/${createdTopicId}`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);

  // Verify it returns 404
  const verifyRes = await request(app)
    .get(`/api/topics/id/${createdTopicId}`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.strictEqual(verifyRes.status, 404);
});

test.after(async () => {
  await disconnectDB();
});
