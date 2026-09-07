import dotenv from 'dotenv';
dotenv.config();

import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { authService } from '../src/services/authService.js';
import { seedLearningPaths } from '../scripts/seedLearningPaths.js';

let adminToken;
let userToken;
let createdPathId;

test.before(async () => {
  await connectDB();
  await seedLearningPaths();

  const timestamp = Date.now();

  const adminResult = await authService.register({
    name: 'LP Admin',
    email: `lp_admin_${timestamp}@example.com`,
    password: 'Password123!',
    role: 'ADMIN',
  });
  adminToken = adminResult.accessToken;

  const userResult = await authService.register({
    name: 'LP Learner',
    email: `lp_user_${timestamp}@example.com`,
    password: 'Password123!',
    role: 'USER',
  });
  userToken = userResult.accessToken;
});

// 1. GET /api/learning-paths - Anonymous -> 401
test('1. Anonymous → GET /api/learning-paths returns 401 Unauthorized', async () => {
  const res = await request(app).get('/api/learning-paths');
  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.body.success, false);
});

// 2. GET /api/learning-paths - Authenticated User -> 200
test('2. Authenticated User → GET /api/learning-paths returns 200 and list of paths', async () => {
  const res = await request(app)
    .get('/api/learning-paths')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(Array.isArray(res.body.data.paths));
  assert.ok(res.body.data.paths.length >= 1);

  const jsPath = res.body.data.paths.find((p) => p.slug === 'javascript');
  assert.ok(jsPath, "Should find 'javascript' learning path");
  assert.strictEqual(jsPath.title, 'JavaScript');
});

// 3. GET /api/learning-paths/:slug - Authenticated User -> 200
test('3. Authenticated User → GET /api/learning-paths/javascript returns 200 with curriculum modules', async () => {
  const res = await request(app)
    .get('/api/learning-paths/javascript')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.slug, 'javascript');
  assert.ok(Array.isArray(res.body.data.modules));
  assert.ok(res.body.data.modules.length > 0);
  assert.ok(res.body.data.modules[0].topics.length > 0);
});

// 4. GET /api/learning-paths/:slug - Non-existent slug -> 404
test('4. GET /api/learning-paths/non-existent-slug returns 404 Not Found', async () => {
  const res = await request(app)
    .get('/api/learning-paths/non-existent-slug')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 404);
  assert.strictEqual(res.body.success, false);
});

// 5. POST /api/learning-paths - Standard User -> 403 Forbidden
test('5. Standard User → POST /api/learning-paths returns 403 Forbidden', async () => {
  const res = await request(app)
    .post('/api/learning-paths')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      title: 'Hacking 101',
      description: 'Unauthorized path creation attempt',
    });

  assert.strictEqual(res.status, 403);
  assert.strictEqual(res.body.success, false);
});

// 6. POST /api/learning-paths - Admin -> 201 Created
test('6. Admin → POST /api/learning-paths returns 201 and creates new path', async () => {
  const timestamp = Date.now();
  const newPath = {
    title: `TypeScript Deep Dive ${timestamp}`,
    slug: `typescript-deep-dive-${timestamp}`,
    description: 'Comprehensive guide to static typing in modern web applications.',
    category: 'Full Stack',
    level: 'Intermediate',
    estimatedHours: 18,
    modules: [
      {
        title: 'Types & Interfaces',
        description: 'Primitives, generics, union types, and interface contracts.',
        duration: '4 hours',
        topics: ['Basic Types', 'Generics', 'Type Aliases vs Interfaces'],
        order: 1,
      },
    ],
  };

  const res = await request(app)
    .post('/api/learning-paths')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(newPath);

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.title, newPath.title);
  assert.ok(res.body.data.id);
  createdPathId = res.body.data.id;
});

// 7. PUT /api/learning-paths/:id - Standard User -> 403 Forbidden
test('7. Standard User → PUT /api/learning-paths/:id returns 403 Forbidden', async () => {
  const res = await request(app)
    .put(`/api/learning-paths/${createdPathId}`)
    .set('Authorization', `Bearer ${userToken}`)
    .send({ title: 'Tampered Title' });

  assert.strictEqual(res.status, 403);
  assert.strictEqual(res.body.success, false);
});

// 8. PUT /api/learning-paths/:id - Admin -> 200 OK
test('8. Admin → PUT /api/learning-paths/:id returns 200 and updates path', async () => {
  const res = await request(app)
    .put(`/api/learning-paths/${createdPathId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      title: 'TypeScript Masterclass Updated',
      estimatedHours: 25,
    });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.title, 'TypeScript Masterclass Updated');
  assert.strictEqual(res.body.data.estimatedHours, 25);
});

// 9. DELETE /api/learning-paths/:id - Standard User -> 403 Forbidden
test('9. Standard User → DELETE /api/learning-paths/:id returns 403 Forbidden', async () => {
  const res = await request(app)
    .delete(`/api/learning-paths/${createdPathId}`)
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 403);
  assert.strictEqual(res.body.success, false);
});

// 10. DELETE /api/learning-paths/:id - Admin -> 200 OK
test('10. Admin → DELETE /api/learning-paths/:id returns 200 and deletes path', async () => {
  const res = await request(app)
    .delete(`/api/learning-paths/${createdPathId}`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);

  // Verify it is gone
  const verifyRes = await request(app)
    .get(`/api/learning-paths/id/${createdPathId}`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.strictEqual(verifyRes.status, 404);
});

test.after(async () => {
  await disconnectDB();
});

