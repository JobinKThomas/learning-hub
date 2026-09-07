import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';

test('POST /api/auth/register fails with 400 when body is missing required fields', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'test@example.com' });

  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
  assert.match(res.body.message, /provide name, email, and password/);
});

test('POST /api/auth/register fails with 400 when password is too short', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Short Pass', email: 'short@example.com', password: '123' });

  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
  assert.match(res.body.message, /at least 6 characters/);
});

test('POST /api/auth/login fails with 400 when credentials are not provided', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({});

  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
  assert.match(res.body.message, /provide email and password/);
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
