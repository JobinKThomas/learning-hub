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

test('1. Security: POST /api/auth/register rejects explicit ADMIN role with 403', async () => {
  const timestamp = Date.now();
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Sneaky User',
      email: `sneaky_${timestamp}@example.com`,
      password: 'Password123!',
      role: 'ADMIN',
    });

  assert.strictEqual(res.status, 403);
  assert.strictEqual(res.body.success, false);
  assert.match(res.body.message, /Admin accounts cannot be registered through standard registration/i);
});

test('2. Standard Registration: POST /api/auth/register successfully registers as USER role', async () => {
  const timestamp = Date.now();
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Regular Learner',
      email: `learner_${timestamp}@example.com`,
      password: 'Password123!',
    });

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.user.role, 'USER');
  assert.ok(res.body.data.accessToken);
});

test('3. Admin Registration: POST /api/auth/admin/register fails with 400 when adminKey is missing', async () => {
  const timestamp = Date.now();
  const res = await request(app)
    .post('/api/auth/admin/register')
    .send({
      name: 'Incomplete Admin',
      email: `admin_${timestamp}@example.com`,
      password: 'Password123!',
    });

  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.success, false);
  assert.ok(res.body.errors.some((e) => e.field === 'adminKey'));
});

test('4. Admin Registration: POST /api/auth/admin/register fails with 403 when adminKey is wrong', async () => {
  const timestamp = Date.now();
  const res = await request(app)
    .post('/api/auth/admin/register')
    .send({
      name: 'Wrong Key Admin',
      email: `admin_wrong_${timestamp}@example.com`,
      password: 'Password123!',
      adminKey: 'wrong_secret_key_xyz',
    });

  assert.strictEqual(res.status, 403);
  assert.strictEqual(res.body.success, false);
  assert.match(res.body.message, /Invalid admin registration key/i);
});

test('5. Admin Registration: POST /api/auth/admin/register succeeds with valid adminKey and grants ADMIN role', async () => {
  const timestamp = Date.now();
  const validKey = process.env.ADMIN_REGISTRATION_KEY || 'admin123';
  const res = await request(app)
    .post('/api/auth/admin/register')
    .send({
      name: 'Verified Admin',
      email: `admin_verified_${timestamp}@example.com`,
      password: 'Password123!',
      adminKey: validKey,
    });

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.user.role, 'ADMIN');
  assert.ok(res.body.data.accessToken);
});

test('6. Admin Registration: duplicate email returns 409 Conflict', async () => {
  const timestamp = Date.now();
  const validKey = process.env.ADMIN_REGISTRATION_KEY || 'admin123';
  const adminPayload = {
    name: 'Duplicate Admin',
    email: `dup_admin_${timestamp}@example.com`,
    password: 'Password123!',
    adminKey: validKey,
  };

  const firstRes = await request(app)
    .post('/api/auth/admin/register')
    .send(adminPayload);
  assert.strictEqual(firstRes.status, 201);

  const dupRes = await request(app)
    .post('/api/auth/admin/register')
    .send(adminPayload);
  assert.strictEqual(dupRes.status, 409);
  assert.strictEqual(dupRes.body.success, false);
});
