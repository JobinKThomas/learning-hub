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

let adminToken;
let userToken;
let createdSectionId;

test.before(async () => {
  await connectDB();
  await seedLearningPaths(false);
  await seedModules(false);
  await seedSections(false);

  const timestamp = Date.now();

  const adminResult = await authService.register({
    name: 'Section Admin',
    email: `sec_admin_${timestamp}@example.com`,
    password: 'Password123!',
    role: 'ADMIN',
  });
  adminToken = adminResult.accessToken;

  const userResult = await authService.register({
    name: 'Section Learner',
    email: `sec_user_${timestamp}@example.com`,
    password: 'Password123!',
    role: 'USER',
  });
  userToken = userResult.accessToken;
});

// 1. GET /api/sections - Anonymous -> 401
test('1. Anonymous → GET /api/sections returns 401 Unauthorized', async () => {
  const res = await request(app).get('/api/sections');
  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.body.success, false);
});

// 2. GET /api/sections - Authenticated User -> 200
test('2. Authenticated User → GET /api/sections returns 200 and list of sections', async () => {
  const res = await request(app)
    .get('/api/sections')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(Array.isArray(res.body.data.sections));
  assert.ok(res.body.data.sections.length >= 2);

  const variablesSec = res.body.data.sections.find((s) => s.slug === 'variables');
  assert.ok(variablesSec, "Should find 'variables' section");
  assert.strictEqual(variablesSec.title, 'Variables');
});

// 3. GET /api/modules/javascript-basics/sections - Authenticated User -> 200
test('3. Authenticated User → GET /api/modules/javascript-basics/sections returns 200 with Variables & Data Types', async () => {
  const res = await request(app)
    .get('/api/modules/javascript-basics/sections')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(Array.isArray(res.body.data.sections));
  assert.ok(res.body.data.sections.length >= 2);

  const slugs = res.body.data.sections.map((s) => s.slug);
  assert.ok(slugs.includes('variables'), "Should include 'variables'");
  assert.ok(slugs.includes('data-types'), "Should include 'data-types'");
});

// 4. GET /api/sections/:slug - Authenticated User -> 200
test('4. Authenticated User → GET /api/sections/variables returns 200 with items [var, let, const]', async () => {
  const res = await request(app)
    .get('/api/sections/variables')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.slug, 'variables');
  assert.strictEqual(res.body.data.title, 'Variables');
  assert.ok(Array.isArray(res.body.data.items));
  assert.ok(res.body.data.items.includes('var'));
  assert.ok(res.body.data.items.includes('let'));
  assert.ok(res.body.data.items.includes('const'));
  assert.ok(res.body.data.content.length > 0);
  assert.strictEqual(res.body.data.itemsCount, res.body.data.items.length);
});

// 5. GET /api/sections/:slug - Non-existent slug -> 404
test('5. GET /api/sections/non-existent-slug returns 404 Not Found', async () => {
  const res = await request(app)
    .get('/api/sections/non-existent-slug')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 404);
  assert.strictEqual(res.body.success, false);
});

// 6. POST /api/sections - Standard User -> 403 Forbidden
test('6. Standard User → POST /api/sections returns 403 Forbidden', async () => {
  const res = await request(app)
    .post('/api/sections')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      title: 'Hacking Scope',
      module: 'javascript-basics',
      description: 'Unauthorized section creation attempt',
    });

  assert.strictEqual(res.status, 403);
  assert.strictEqual(res.body.success, false);
});

// 7. POST /api/sections - Admin -> 201 Created
test('7. Admin → POST /api/sections returns 201 and creates new section', async () => {
  const timestamp = Date.now();
  const newSection = {
    title: `Type Coercion & Truthy ${timestamp}`,
    slug: `type-coercion-truthy-${timestamp}`,
    module: 'javascript-basics',
    description: 'Deep dive into implicit type conversion, truthy/falsy values, and Boolean wrapper objects.',
    duration: '35 mins',
    order: 4,
    items: ['Implicit Coercion', 'Explicit Casting', 'Truthy & Falsy Rules'],
    content: '# Type Coercion\n\nHow JavaScript converts values behind the scenes.',
  };

  const res = await request(app)
    .post('/api/sections')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(newSection);

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.title, newSection.title);
  assert.strictEqual(res.body.data.slug, newSection.slug);
  assert.ok(res.body.data.id);
  createdSectionId = res.body.data.id;
});

// 8. PUT /api/sections/:id - Standard User -> 403 Forbidden
test('8. Standard User → PUT /api/sections/:id returns 403 Forbidden', async () => {
  const res = await request(app)
    .put(`/api/sections/${createdSectionId}`)
    .set('Authorization', `Bearer ${userToken}`)
    .send({ title: 'Tampered Section Title' });

  assert.strictEqual(res.status, 403);
  assert.strictEqual(res.body.success, false);
});

// 9. Admin → PUT /api/sections/:id returns 200 and updates section
test('9. Admin → PUT /api/sections/:id returns 200 and updates section', async () => {
  const res = await request(app)
    .put(`/api/sections/${createdSectionId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      title: 'Type Coercion & Truthy Masterclass',
      duration: '50 mins',
      items: ['Implicit Coercion', 'Explicit Casting', 'Truthy & Falsy Rules', 'Symbol.toPrimitive'],
    });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.title, 'Type Coercion & Truthy Masterclass');
  assert.strictEqual(res.body.data.duration, '50 mins');
  assert.strictEqual(res.body.data.itemsCount, 4);
});

// 10. Admin → DELETE /api/sections/:id returns 200 and deletes section
test('10. Admin → DELETE /api/sections/:id returns 200 and deletes section', async () => {
  const res = await request(app)
    .delete(`/api/sections/${createdSectionId}`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);

  // Verify it returns 404
  const verifyRes = await request(app)
    .get(`/api/sections/id/${createdSectionId}`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.strictEqual(verifyRes.status, 404);
});

test.after(async () => {
  await disconnectDB();
});
