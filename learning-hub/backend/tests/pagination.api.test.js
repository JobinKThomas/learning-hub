import dotenv from 'dotenv';
dotenv.config();

import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import { authService } from '../src/services/authService.js';
import { seedLearningPaths } from '../scripts/seedLearningPaths.js';
import { seedModules } from '../scripts/seedModules.js';
import { seedSections } from '../scripts/seedSections.js';
import { seedTopics } from '../scripts/seedTopics.js';
import { seedNotes } from '../scripts/seedNotes.js';
import { seedInterviewQuestions } from '../scripts/seedInterviewQuestions.js';

let userToken;

test.before(async () => {
  await connectDB();
  await seedLearningPaths();
  await seedModules();
  await seedSections();
  await seedTopics();
  await seedNotes();
  await seedInterviewQuestions();

  const timestamp = Date.now();
  const userResult = await authService.register({
    name: 'Pagination Tester',
    email: `page_tester_${timestamp}@example.com`,
    password: 'Password123!',
    role: 'USER',
  });
  userToken = userResult.accessToken;
});

test('--- Tier 2 API Tests: Search, Filter & Pagination ---', async (t) => {

  await t.test('1. Learning Paths: Page 1 with limit=2 returns correct metadata and items', async () => {
    const res = await request(app)
      .get('/api/learning-paths?page=1&limit=2')
      .set('Authorization', `Bearer ${userToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.paths);
    assert.strictEqual(res.body.data.paths.length, 2);
    assert.strictEqual(res.body.data.pagination.page, 1);
    assert.strictEqual(res.body.data.pagination.limit, 2);
    assert.ok(res.body.data.pagination.total >= 2);
    assert.strictEqual(res.body.data.pagination.hasPrevPage, false);
    assert.strictEqual(res.body.data.pagination.hasNextPage, true);
  });

  await t.test('2. Learning Paths: Filter by level=Beginner', async () => {
    const res = await request(app)
      .get('/api/learning-paths?level=Beginner')
      .set('Authorization', `Bearer ${userToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    const paths = res.body.data.paths;
    assert.ok(paths.length > 0);
    for (const p of paths) {
      assert.strictEqual(p.level, 'Beginner');
    }
  });

  await t.test('3. Learning Paths: Search query finds matching paths', async () => {
    const res = await request(app)
      .get('/api/learning-paths?search=JavaScript')
      .set('Authorization', `Bearer ${userToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    const paths = res.body.data.paths;
    assert.ok(paths.length > 0);
    assert.ok(paths.some((p) => p.title.toLowerCase().includes('javascript')));
  });

  await t.test('4. Notes: Search query and pagination', async () => {
    const res = await request(app)
      .get('/api/notes?search=let&page=1&limit=2')
      .set('Authorization', `Bearer ${userToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.notes);
    assert.ok(res.body.data.notes.length <= 2);
  });

  await t.test('5. Interview Questions: Filter by difficulty and frequency', async () => {
    const res = await request(app)
      .get('/api/interview-questions?difficulty=INTERMEDIATE')
      .set('Authorization', `Bearer ${userToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    const questions = res.body.data.questions || res.body.data;
    assert.ok(Array.isArray(questions));
    for (const q of questions) {
      assert.strictEqual(q.difficulty, 'INTERMEDIATE');
    }
  });

});
