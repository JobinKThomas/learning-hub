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
import { seedResources } from '../scripts/seedResources.js';

let adminToken;
let userToken;
let createdResourceId;
let sampleResourceId;

test.before(async () => {
  await connectDB();
  await seedLearningPaths(false);
  await seedModules(false);
  await seedSections(false);
  await seedTopics(false);
  await seedResources(false);

  const timestamp = Date.now();

  const adminResult = await authService.register({
    name: 'Resource Admin',
    email: `res_admin_${timestamp}@example.com`,
    password: 'Password123!',
    role: 'ADMIN',
  });
  adminToken = adminResult.accessToken;

  const userResult = await authService.register({
    name: 'Resource Learner',
    email: `res_user_${timestamp}@example.com`,
    password: 'Password123!',
    role: 'USER',
  });
  userToken = userResult.accessToken;
});

// 1. GET /api/resources - Anonymous -> 401
test('1. Anonymous → GET /api/resources returns 401 Unauthorized', async () => {
  const res = await request(app).get('/api/resources');
  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.body.success, false);
});

// 2. GET /api/resources - Authenticated User -> 200
test('2. Authenticated User → GET /api/resources returns 200 and list of resources', async () => {
  const res = await request(app)
    .get('/api/resources')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(Array.isArray(res.body.data.resources));
  assert.ok(res.body.data.resources.length >= 4);

  const mdnResource = res.body.data.resources.find((r) =>
    r.title.includes('MDN Web Docs: let')
  );
  assert.ok(mdnResource, "Should find 'MDN Web Docs: let' resource");
  sampleResourceId = mdnResource.id;
});

// 3. GET /api/resources?topic=let - Authenticated User -> 200 with resources under let
test('3. Authenticated User → GET /api/resources?topic=let returns 200 with let resources', async () => {
  const res = await request(app)
    .get('/api/resources?topic=let')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(Array.isArray(res.body.data.resources));
  assert.ok(res.body.data.resources.length >= 4);

  const types = res.body.data.resources.map((r) => r.type);
  assert.ok(types.includes('DOCUMENTATION'), 'Must include DOCUMENTATION');
  assert.ok(types.includes('VIDEO'), 'Must include VIDEO');
  assert.ok(types.includes('ARTICLE'), 'Must include ARTICLE');
  assert.ok(types.includes('GITHUB'), 'Must include GITHUB');
});

// 4. GET /api/topics/let/resources - Authenticated User -> 200 with resources for topic
test('4. Authenticated User → GET /api/topics/let/resources returns 200 with topic resources', async () => {
  const res = await request(app)
    .get('/api/topics/let/resources')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(Array.isArray(res.body.data.resources));
  assert.ok(res.body.data.resources.length >= 4);
});

// 5. GET /api/resources?type=DOCUMENTATION - Authenticated User -> 200 filtered by type
test('5. Authenticated User → GET /api/resources?type=DOCUMENTATION returns 200 filtered by type', async () => {
  const res = await request(app)
    .get('/api/resources?type=DOCUMENTATION')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(Array.isArray(res.body.data.resources));
  assert.ok(res.body.data.resources.every((r) => r.type === 'DOCUMENTATION'));
});

// 6. GET /api/resources/:id - Authenticated User -> 200 with populated parent topic hierarchy
test('6. Authenticated User → GET /api/resources/:id returns 200 with parent hierarchy', async () => {
  const res = await request(app)
    .get(`/api/resources/${sampleResourceId}`)
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.data.url.startsWith('https://developer.mozilla.org'));
  assert.strictEqual(res.body.data.type, 'DOCUMENTATION');

  // Verify parent hierarchy
  assert.ok(res.body.data.topic, 'Parent topic must be populated');
  assert.strictEqual(res.body.data.topic.slug, 'let');
  assert.ok(res.body.data.topic.section, 'Parent section must be populated');
  assert.strictEqual(res.body.data.topic.section.slug, 'variables');
});

// 7. GET /api/resources/:invalidId - Non-existent ID -> 404
test('7. GET /api/resources/6a9eb0000000000000000000 returns 404 Not Found', async () => {
  const res = await request(app)
    .get('/api/resources/6a9eb0000000000000000000')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 404);
  assert.strictEqual(res.body.success, false);
});

// 8. POST /api/resources - Standard User -> 403 Forbidden
test('8. Standard User → POST /api/resources returns 403 Forbidden', async () => {
  const res = await request(app)
    .post('/api/resources')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      title: 'Hacked Resource',
      url: 'https://example.com',
      topic: 'let',
      type: 'ARTICLE',
    });

  assert.strictEqual(res.status, 403);
  assert.strictEqual(res.body.success, false);
});

// 9. POST /api/resources - Admin -> 201 Created
test('9. Admin → POST /api/resources returns 201 and creates new resource', async () => {
  const timestamp = Date.now();
  const newResource = {
    title: `JavaScript Visualizer Tool ${timestamp}`,
    url: `https://visualize-js-${timestamp}.org/scope`,
    topic: 'let',
    type: 'TOOL',
    description: 'Interactive execution visualizer showing call stack and TDZ blocks.',
    author: 'Visual Tools Team',
    order: 5,
    isFree: true,
  };

  const res = await request(app)
    .post('/api/resources')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(newResource);

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.title, newResource.title);
  assert.strictEqual(res.body.data.type, 'TOOL');
  assert.ok(res.body.data.id);
  createdResourceId = res.body.data.id;
});

// 10. Standard User → PUT /api/resources/:id returns 403 Forbidden
test('10. Standard User → PUT /api/resources/:id returns 403 Forbidden', async () => {
  const res = await request(app)
    .put(`/api/resources/${createdResourceId}`)
    .set('Authorization', `Bearer ${userToken}`)
    .send({ title: 'Tampered Resource Title' });

  assert.strictEqual(res.status, 403);
  assert.strictEqual(res.body.success, false);
});

// 11. Admin → PUT /api/resources/:id returns 200 and updates resource
test('11. Admin → PUT /api/resources/:id returns 200 and updates resource', async () => {
  const res = await request(app)
    .put(`/api/resources/${createdResourceId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      title: 'JavaScript Visualizer Tool (Updated)',
      description: 'Updated description for the visualization tool.',
      order: 10,
    });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.title, 'JavaScript Visualizer Tool (Updated)');
  assert.strictEqual(res.body.data.order, 10);
});

// 12. Admin → DELETE /api/resources/:id returns 200 and deletes resource
test('12. Admin → DELETE /api/resources/:id returns 200 and deletes resource', async () => {
  const res = await request(app)
    .delete(`/api/resources/${createdResourceId}`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);

  // Verify 404
  const verifyRes = await request(app)
    .get(`/api/resources/${createdResourceId}`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.strictEqual(verifyRes.status, 404);
});

test.after(async () => {
  await disconnectDB();
});
