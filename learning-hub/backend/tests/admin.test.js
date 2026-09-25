import dotenv from 'dotenv';
dotenv.config();

import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { authService } from '../src/services/authService.js';

let adminToken;
let userToken;

test.before(async () => {
  await connectDB();

  const timestamp = Date.now();

  // Create an ADMIN user
  const adminResult = await authService.register({
    name: 'Admin Test User',
    email: `admin_${timestamp}@example.com`,
    password: 'Password123!',
    role: 'ADMIN',
  });
  adminToken = adminResult.accessToken;

  // Create a standard USER
  const userResult = await authService.register({
    name: 'Regular Test User',
    email: `user_${timestamp}@example.com`,
    password: 'Password123!',
    role: 'USER',
  });
  userToken = userResult.accessToken;
});

test('1. Anonymous → admin API returns 401 Unauthorized', async () => {
  const res = await request(app).get('/api/admin/overview');

  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.body.success, false);
  assert.match(res.body.message, /Missing token|Not authorized/);
});

test('2. User → admin API returns 403 Forbidden', async () => {
  const res = await request(app)
    .get('/api/admin/overview')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 403);
  assert.strictEqual(res.body.success, false);
  assert.match(res.body.message, /Admin privileges required|not authorized/);
});

test('3. Admin → admin API returns 200 OK', async () => {
  const res = await request(app)
    .get('/api/admin/overview')
    .set('Authorization', `Bearer ${adminToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.data.metrics);
  assert.ok(typeof res.body.data.metrics.totalUsers === 'number');
  assert.ok(res.body.data.metrics.totalAdmins >= 1);
  assert.ok(typeof res.body.data.metrics.totalContentItems === 'number');
  assert.ok(res.body.data.contentMetrics);
  assert.strictEqual(typeof res.body.data.contentMetrics.learningPaths, 'number');
  assert.strictEqual(typeof res.body.data.contentMetrics.modules, 'number');
  assert.strictEqual(typeof res.body.data.contentMetrics.sections, 'number');
  assert.strictEqual(typeof res.body.data.contentMetrics.topics, 'number');
  assert.strictEqual(typeof res.body.data.contentMetrics.notes, 'number');
  assert.strictEqual(typeof res.body.data.contentMetrics.resources, 'number');
  assert.strictEqual(typeof res.body.data.contentMetrics.playgrounds, 'number');
  assert.strictEqual(typeof res.body.data.contentMetrics.quizzes, 'number');
  assert.strictEqual(typeof res.body.data.contentMetrics.interviewQuestions, 'number');
  assert.strictEqual(res.body.data.caller.role, 'ADMIN');
});

test('4. Admin → GET /api/admin/users returns 200 and list of users', async () => {
  const res = await request(app)
    .get('/api/admin/users')
    .set('Authorization', `Bearer ${adminToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(Array.isArray(res.body.data.users));
  assert.ok(res.body.data.count >= 2);
});

test.after(async () => {
  await disconnectDB();
});
