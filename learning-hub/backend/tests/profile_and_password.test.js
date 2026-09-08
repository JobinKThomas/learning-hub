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

test('Profile and Password management full lifecycle', async () => {
  const timestamp = Date.now();
  const testUser = {
    name: 'Initial Name',
    email: `profile_pw_${timestamp}@example.com`,
    password: 'InitialPassword123!',
    role: 'student',
  };

  // 1. Register test user
  const regRes = await request(app)
    .post('/api/auth/register')
    .send(testUser);

  assert.strictEqual(regRes.status, 201);
  const accessToken = regRes.body.data.accessToken;

  // 2. PUT /api/auth/profile - Validation & Auth checks
  const noAuthProfileRes = await request(app)
    .put('/api/auth/profile')
    .send({ name: 'Valid Name' });
  assert.strictEqual(noAuthProfileRes.status, 401);

  const invalidNameRes = await request(app)
    .put('/api/auth/profile')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ name: 'A' });
  assert.strictEqual(invalidNameRes.status, 400);

  // 3. PUT /api/auth/profile - Successful name update
  const updateProfileRes = await request(app)
    .put('/api/auth/profile')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ name: 'Updated Full Name' });
  assert.strictEqual(updateProfileRes.status, 200);
  assert.strictEqual(updateProfileRes.body.data.user.name, 'Updated Full Name');

  // Verify GET /api/auth/me shows the updated name
  const meRes = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${accessToken}`);
  assert.strictEqual(meRes.status, 200);
  assert.strictEqual(meRes.body.data.user.name, 'Updated Full Name');

  // 4. PUT /api/auth/update-password - Validation & wrong password check
  const shortPwRes = await request(app)
    .put('/api/auth/update-password')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ currentPassword: testUser.password, newPassword: '123' });
  assert.strictEqual(shortPwRes.status, 400);

  const wrongCurrentPwRes = await request(app)
    .put('/api/auth/update-password')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ currentPassword: 'WrongPassword!', newPassword: 'NewPassword123!' });
  assert.strictEqual(wrongCurrentPwRes.status, 400);
  assert.match(wrongCurrentPwRes.body.message, /Current password is incorrect/);

  // 5. PUT /api/auth/update-password - Successful password update
  const newPassword = 'ChangedPassword123!';
  const updatePwRes = await request(app)
    .put('/api/auth/update-password')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ currentPassword: testUser.password, newPassword });
  assert.strictEqual(updatePwRes.status, 200);
  assert.strictEqual(updatePwRes.body.success, true);

  // Login with old password fails
  const oldLoginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: testUser.email, password: testUser.password });
  assert.strictEqual(oldLoginRes.status, 401);

  // Login with new password succeeds
  const newLoginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: testUser.email, password: newPassword });
  assert.strictEqual(newLoginRes.status, 200);

  // 6. POST /api/auth/forgot-password
  // Invalid email format fails
  const invalidEmailForgot = await request(app)
    .post('/api/auth/forgot-password')
    .send({ email: 'not-an-email' });
  assert.strictEqual(invalidEmailForgot.status, 400);

  // Non-existent email returns generic message without exposing account existence
  const nonExistentForgot = await request(app)
    .post('/api/auth/forgot-password')
    .send({ email: 'nonexistent_user_99999@example.com' });
  assert.strictEqual(nonExistentForgot.status, 200);
  assert.match(nonExistentForgot.body.message, /If an account with that email exists/);

  // Existing user forgot-password generates reset token
  const validForgotRes = await request(app)
    .post('/api/auth/forgot-password')
    .send({ email: testUser.email });
  assert.strictEqual(validForgotRes.status, 200);
  assert.ok(validForgotRes.body.data.resetToken);
  assert.ok(validForgotRes.body.data.resetUrl);
  const resetToken = validForgotRes.body.data.resetToken;

  // 7. POST /api/auth/reset-password/:token
  // Invalid token fails
  const invalidTokenRes = await request(app)
    .post('/api/auth/reset-password/invalid_token_12345')
    .send({ password: 'BrandNewPassword123!' });
  assert.strictEqual(invalidTokenRes.status, 400);
  assert.match(invalidTokenRes.body.message, /Password reset token is invalid or has expired/);

  // Too short new password fails validation
  const shortResetPw = await request(app)
    .post(`/api/auth/reset-password/${resetToken}`)
    .send({ password: '123' });
  assert.strictEqual(shortResetPw.status, 400);

  // Valid token successfully resets password
  const finalPassword = 'FinalResetPassword123!';
  const resetSuccessRes = await request(app)
    .post(`/api/auth/reset-password/${resetToken}`)
    .send({ password: finalPassword });
  assert.strictEqual(resetSuccessRes.status, 200);
  assert.strictEqual(resetSuccessRes.body.success, true);
  assert.ok(resetSuccessRes.body.data.accessToken);

  // Re-using the same reset token should now fail
  const reuseTokenRes = await request(app)
    .post(`/api/auth/reset-password/${resetToken}`)
    .send({ password: 'AnotherPassword123!' });
  assert.strictEqual(reuseTokenRes.status, 400);

  // Login with final reset password succeeds
  const finalLoginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: testUser.email, password: finalPassword });
  assert.strictEqual(finalLoginRes.status, 200);
});

test.after(async () => {
  await disconnectDB();
});
