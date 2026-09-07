import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import express from 'express';
import app from '../src/app.js';
import { authenticate } from '../src/middlewares/authMiddleware.js';
import { authorize } from '../src/middlewares/roleMiddleware.js';
import { sendSuccess } from '../src/utils/apiResponse.js';
import { generateAccessToken } from '../src/utils/jwt.js';

test('POST /api/auth/register fails with 400 when body is missing required fields', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'test@example.com' });

  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
  assert.match(res.body.message, /Validation failed/);
});

test('POST /api/auth/register fails with 400 when password is too short', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Short Pass', email: 'short@example.com', password: '123' });

  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
  assert.ok(res.body.errors.some((e) => e.field === 'password'));
});

test('POST /api/auth/register fails with 400 when email is invalid format', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Invalid Email', email: 'not-an-email', password: 'password123' });

  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
  assert.ok(res.body.errors.some((e) => e.field === 'email'));
});

test('POST /api/auth/login fails with 400 when credentials are not provided', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({});

  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
  assert.strictEqual(res.body.message, 'Validation failed');
});

test('POST /api/auth/refresh fails with 400 when no refresh token provided', async () => {
  const res = await request(app)
    .post('/api/auth/refresh')
    .send({});

  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
  assert.match(res.body.message, /Refresh token is required/);
});

test('GET /api/auth/me fails with 401 when no token is provided', async () => {
  const res = await request(app).get('/api/auth/me');

  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.body.success, false);
  assert.match(res.body.message, /Missing token/);
});

test('GET /api/auth/me fails with 401 when invalid token is provided', async () => {
  const res = await request(app)
    .get('/api/auth/me')
    .set('Authorization', 'Bearer invalid_garbage_token');

  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.body.success, false);
  assert.match(res.body.message, /Invalid or expired/);
});

test('Role authorization middleware blocks unauthorized roles with 403', async () => {
  const testApp = express();
  testApp.use(express.json());

  // Dummy auth middleware attaching a student user
  testApp.use((req, res, next) => {
    req.user = { id: '123', role: 'student' };
    next();
  });

  testApp.get('/admin-only', authorize('admin'), (req, res) => {
    sendSuccess(res, 'Admin access granted');
  });

  // Error handler
  testApp.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  });

  const res = await request(testApp).get('/admin-only');
  assert.strictEqual(res.status, 403);
  assert.strictEqual(res.body.success, false);
  assert.match(res.body.message, /not authorized/);
});

test('Role authorization middleware permits authorized roles with 200', async () => {
  const testApp = express();
  testApp.use(express.json());

  testApp.use((req, res, next) => {
    req.user = { id: '123', role: 'admin' };
    next();
  });

  testApp.get('/admin-only', authorize('admin'), (req, res) => {
    sendSuccess(res, 'Admin access granted');
  });

  const res = await request(testApp).get('/admin-only');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.message, 'Admin access granted');
});
