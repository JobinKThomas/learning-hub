import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';

test('GET /api/health returns 200 and system health status', async () => {
  const res = await request(app).get('/api/health');

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.message, 'System is healthy');
  assert.ok(res.body.data);
  assert.strictEqual(res.body.data.status, 'OK');
  assert.ok(typeof res.body.data.uptime === 'number');
  assert.ok(res.body.data.database);
});

test('GET / returns API info and links', async () => {
  const res = await request(app).get('/');

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.name, 'Learning Hub API');
  assert.strictEqual(res.body.documentation, '/api-docs');
});

test('GET /api/unknown-route returns 404 ApiError response', async () => {
  const res = await request(app).get('/api/unknown-route');

  assert.strictEqual(res.status, 404);
  assert.strictEqual(res.body.success, false);
  assert.match(res.body.message, /Route not found/);
});
