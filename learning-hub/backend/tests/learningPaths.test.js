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

// 11. Search: GET /api/learning-paths?search=JavaScript
test('11. Authenticated User → GET /api/learning-paths?search=JavaScript filters by keyword', async () => {
  const res = await request(app)
    .get('/api/learning-paths?search=JavaScript')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.data.paths.length >= 1);
  assert.ok(
    res.body.data.paths.every(
      (p) =>
        p.title.toLowerCase().includes('javascript') ||
        p.description.toLowerCase().includes('javascript')
    )
  );
});

// 12. Difficulty / Level Filter: GET /api/learning-paths?difficulty=Beginner
test('12. Authenticated User → GET /api/learning-paths?difficulty=Beginner filters by level', async () => {
  const res = await request(app)
    .get('/api/learning-paths?difficulty=Beginner')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.data.paths.length >= 1);
  assert.ok(res.body.data.paths.every((p) => p.level.toLowerCase() === 'beginner'));
});

// 13. Status Filter (Admin): GET /api/learning-paths?status=published
test('13. Admin → GET /api/learning-paths?status=published filters by published status', async () => {
  const res = await request(app)
    .get('/api/learning-paths?status=published')
    .set('Authorization', `Bearer ${adminToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.data.paths.length >= 1);
  assert.ok(res.body.data.paths.every((p) => p.published === true));
  assert.ok(res.body.data.pagination);
  assert.strictEqual(typeof res.body.data.pagination.total, 'number');
});

// 14. Sort: GET /api/learning-paths?sort=title&order=asc
test('14. Authenticated User → GET /api/learning-paths?sort=title&order=asc sorts alphabetically', async () => {
  const res = await request(app)
    .get('/api/learning-paths?sort=title&order=asc&limit=10')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  const titles = res.body.data.paths.map((p) => p.title);
  const sortedTitles = [...titles].sort((a, b) => a.localeCompare(b));
  assert.deepStrictEqual(titles, sortedTitles);
});

// 15. Pagination: GET /api/learning-paths?page=1&limit=2
test('15. Authenticated User → GET /api/learning-paths?page=1&limit=2 returns paginated response', async () => {
  const res1 = await request(app)
    .get('/api/learning-paths?page=1&limit=2')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res1.status, 200);
  assert.strictEqual(res1.body.success, true);
  assert.strictEqual(res1.body.data.paths.length, 2);
  assert.strictEqual(res1.body.data.pagination.page, 1);
  assert.strictEqual(res1.body.data.pagination.limit, 2);
  assert.ok(res1.body.data.pagination.totalPages >= 2);
  assert.strictEqual(res1.body.data.pagination.hasNextPage, true);
  assert.strictEqual(res1.body.data.pagination.hasPrevPage, false);

  // Page 2
  const res2 = await request(app)
    .get('/api/learning-paths?page=2&limit=2')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res2.status, 200);
  assert.strictEqual(res2.body.data.pagination.page, 2);
  assert.strictEqual(res2.body.data.pagination.hasPrevPage, true);
  // Different items on page 2
  assert.notStrictEqual(res1.body.data.paths[0].id, res2.body.data.paths[0].id);
});

test.after(async () => {
  await disconnectDB();
});

