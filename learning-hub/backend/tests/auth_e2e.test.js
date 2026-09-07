import dotenv from 'dotenv';
dotenv.config();

import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';

test.before(async () => {
  await connectDB();
});

test.after(async () => {
  await disconnectDB();
});

test('Full E2E Auth Cycle: Register -> Login -> Me -> Refresh -> Rotation -> Logout', async () => {
  const timestamp = Date.now();
  const testUser = {
    name: 'E2E Tester',
    email: `e2e_${timestamp}@example.com`,
    password: 'Password123!',
    role: 'student',
  };

  // 1. Register
  const regRes = await request(app)
    .post('/api/auth/register')
    .send(testUser);

  assert.strictEqual(regRes.status, 201);
  assert.strictEqual(regRes.body.success, true);
  assert.ok(regRes.body.data.accessToken, 'Should return accessToken');
  assert.ok(regRes.body.data.refreshToken, 'Should return refreshToken');
  assert.strictEqual(regRes.body.data.user.email, testUser.email);

  // 2. Duplicate Registration should fail with 409
  const dupRes = await request(app)
    .post('/api/auth/register')
    .send(testUser);

  assert.strictEqual(dupRes.status, 409);
  assert.strictEqual(dupRes.body.success, false);

  // 3. Login
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: testUser.email, password: testUser.password });

  assert.strictEqual(loginRes.status, 200);
  assert.strictEqual(loginRes.body.success, true);
  const { accessToken, refreshToken } = loginRes.body.data;
  assert.ok(accessToken);
  assert.ok(refreshToken);

  // 4. GET /api/auth/me with Bearer token
  const meRes = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${accessToken}`);

  assert.strictEqual(meRes.status, 200);
  assert.strictEqual(meRes.body.data.user.email, testUser.email);
  assert.strictEqual(meRes.body.data.user.role.toUpperCase(), 'STUDENT');

  // 5. POST /api/auth/refresh with valid token
  const refreshRes = await request(app)
    .post('/api/auth/refresh')
    .send({ refreshToken });

  assert.strictEqual(refreshRes.status, 200);
  assert.strictEqual(refreshRes.body.success, true);
  const newAccessToken = refreshRes.body.data.accessToken;
  const newRefreshToken = refreshRes.body.data.refreshToken;
  assert.ok(newAccessToken);
  assert.ok(newRefreshToken);
  assert.notStrictEqual(refreshToken, newRefreshToken, 'Refresh token should be rotated');

  // 6. Test old refresh token is rejected (Rotation protection)
  const reuseRes = await request(app)
    .post('/api/auth/refresh')
    .send({ refreshToken });

  assert.strictEqual(reuseRes.status, 401);

  // 7. Verify new access token works for /api/auth/me
  const meNewRes = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${newAccessToken}`);

  assert.strictEqual(meNewRes.status, 200);

  // 8. POST /api/auth/logout
  const logoutRes = await request(app)
    .post('/api/auth/logout')
    .send({ refreshToken: newRefreshToken });

  assert.strictEqual(logoutRes.status, 200);
  assert.strictEqual(logoutRes.body.success, true);

  // 9. Verify refresh token is invalid after logout
  const afterLogoutRes = await request(app)
    .post('/api/auth/refresh')
    .send({ refreshToken: newRefreshToken });

  assert.strictEqual(afterLogoutRes.status, 401);
});
