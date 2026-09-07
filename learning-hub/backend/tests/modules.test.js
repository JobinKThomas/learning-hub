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

let adminToken;
let userToken;
let createdModuleId;

test.before(async () => {
  await connectDB();
  await seedLearningPaths(false);
  await seedModules(false);

  const timestamp = Date.now();

  const adminResult = await authService.register({
    name: 'Module Admin',
    email: `mod_admin_${timestamp}@example.com`,
    password: 'Password123!',
    role: 'ADMIN',
  });
  adminToken = adminResult.accessToken;

  const userResult = await authService.register({
    name: 'Module Learner',
    email: `mod_user_${timestamp}@example.com`,
    password: 'Password123!',
    role: 'USER',
  });
  userToken = userResult.accessToken;
});

// 1. GET /api/modules - Anonymous -> 401
test('1. Anonymous → GET /api/modules returns 401 Unauthorized', async () => {
  const res = await request(app).get('/api/modules');
  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.body.success, false);
});

// 2. GET /api/modules - Authenticated User -> 200
test('2. Authenticated User → GET /api/modules returns 200 and list of modules', async () => {
  const res = await request(app)
    .get('/api/modules')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(Array.isArray(res.body.data.modules));
  assert.ok(res.body.data.modules.length >= 4);

  const jsBasics = res.body.data.modules.find((m) => m.slug === 'javascript-basics');
  assert.ok(jsBasics, "Should find 'javascript-basics' module");
  assert.strictEqual(jsBasics.title, 'JavaScript Basics');
});

// 3. GET /api/learning-paths/javascript/modules - Authenticated User -> 200
test('3. Authenticated User → GET /api/learning-paths/javascript/modules returns 200 with JavaScript modules', async () => {
  const res = await request(app)
    .get('/api/learning-paths/javascript/modules')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(Array.isArray(res.body.data.modules));
  assert.ok(res.body.data.modules.length >= 4);

  const slugs = res.body.data.modules.map((m) => m.slug);
  assert.ok(slugs.includes('javascript-basics'));
  assert.ok(slugs.includes('functions'));
  assert.ok(slugs.includes('arrays'));
  assert.ok(slugs.includes('objects'));
});

// 4. GET /api/modules/:slug - Authenticated User -> 200
test('4. Authenticated User → GET /api/modules/javascript-basics returns 200 with topics & objectives', async () => {
  const res = await request(app)
    .get('/api/modules/javascript-basics')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.slug, 'javascript-basics');
  assert.strictEqual(res.body.data.title, 'JavaScript Basics');
  assert.ok(Array.isArray(res.body.data.topics));
  assert.ok(res.body.data.topics.length > 0);
  assert.ok(Array.isArray(res.body.data.learningObjectives));
});

// 5. GET /api/modules/:slug - Non-existent slug -> 404
test('5. GET /api/modules/non-existent-slug returns 404 Not Found', async () => {
  const res = await request(app)
    .get('/api/modules/non-existent-slug')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 404);
  assert.strictEqual(res.body.success, false);
});

// 6. POST /api/modules - Standard User -> 403 Forbidden
test('6. Standard User → POST /api/modules returns 403 Forbidden', async () => {
  const res = await request(app)
    .post('/api/modules')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      title: 'Hacking 101',
      learningPath: 'javascript',
      description: 'Unauthorized module creation attempt',
    });

  assert.strictEqual(res.status, 403);
  assert.strictEqual(res.body.success, false);
});

// 7. POST /api/modules - Admin -> 201 Created
test('7. Admin → POST /api/modules returns 201 and creates new module', async () => {
  const timestamp = Date.now();
  const newModule = {
    title: `Async Patterns & Promises ${timestamp}`,
    slug: `async-patterns-promises-${timestamp}`,
    learningPath: 'javascript',
    description: 'Mastering microtasks, Promise chaining, and async/await mechanics.',
    duration: '4 hours',
    order: 5,
    topics: ['Microtask Queue', 'Promise.all vs allSettled', 'Top-level Await'],
    learningObjectives: ['Demystify event loop microtasks', 'Handle concurrent async operations'],
  };

  const res = await request(app)
    .post('/api/modules')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(newModule);

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.title, newModule.title);
  assert.strictEqual(res.body.data.slug, newModule.slug);
  assert.ok(res.body.data.id);
  createdModuleId = res.body.data.id;
});

// 8. PUT /api/modules/:id - Standard User -> 403 Forbidden
test('8. Standard User → PUT /api/modules/:id returns 403 Forbidden', async () => {
  const res = await request(app)
    .put(`/api/modules/${createdModuleId}`)
    .set('Authorization', `Bearer ${userToken}`)
    .send({ title: 'Tampered Title' });

  assert.strictEqual(res.status, 403);
  assert.strictEqual(res.body.success, false);
});

// 9. Admin → PUT /api/modules/:id returns 200 and updates module
test('9. Admin → PUT /api/modules/:id returns 200 and updates module', async () => {
  const res = await request(app)
    .put(`/api/modules/${createdModuleId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      title: 'Async Patterns & Promises Masterclass',
      duration: '6 hours',
    });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.title, 'Async Patterns & Promises Masterclass');
  assert.strictEqual(res.body.data.duration, '6 hours');
});

// 10. DELETE /api/modules/:id - Admin -> 200 OK
test('10. Admin → DELETE /api/modules/:id returns 200 and deletes module', async () => {
  const res = await request(app)
    .delete(`/api/modules/${createdModuleId}`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);

  // Verify it returns 404
  const verifyRes = await request(app)
    .get(`/api/modules/id/${createdModuleId}`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.strictEqual(verifyRes.status, 404);
});

test.after(async () => {
  await disconnectDB();
});
