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
import { seedTopics } from '../scripts/seedTopics.js';
import { seedPlaygrounds } from '../scripts/seedPlaygrounds.js';

let adminToken;
let userToken;
let createdPlaygroundId;
let samplePlaygroundId;

test.before(async () => {
  await connectDB();
  await seedLearningPaths(false);
  await seedModules(false);
  await seedSections(false);
  await seedTopics(false);
  await seedPlaygrounds(false);

  const timestamp = Date.now();

  const adminResult = await authService.register({
    name: 'Playground Admin',
    email: `play_admin_${timestamp}@example.com`,
    password: 'Password123!',
    role: 'ADMIN',
  });
  adminToken = adminResult.accessToken;

  const userResult = await authService.register({
    name: 'Playground Learner',
    email: `play_user_${timestamp}@example.com`,
    password: 'Password123!',
    role: 'USER',
  });
  userToken = userResult.accessToken;
});

// 1. Anonymous -> 401
test('1. Anonymous → GET /api/playgrounds returns 401 Unauthorized', async () => {
  const res = await request(app).get('/api/playgrounds');
  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.body.success, false);
});

// 2. Authenticated User -> 200 list
test('2. Authenticated User → GET /api/playgrounds returns 200 and list of playgrounds', async () => {
  const res = await request(app)
    .get('/api/playgrounds')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(Array.isArray(res.body.data.playgrounds));
  assert.ok(res.body.data.playgrounds.length >= 3);

  samplePlaygroundId = res.body.data.playgrounds[0].id;
});

// 3. Filter by topic
test('3. Authenticated User → GET /api/playgrounds?topic=let returns playgrounds for let', async () => {
  const res = await request(app)
    .get('/api/playgrounds?topic=let')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.data.playgrounds.length > 0);
  assert.strictEqual(res.body.data.playgrounds[0].topic.slug, 'let');
});

// 4. Nested topic endpoint
test('4. Authenticated User → GET /api/topics/let/playgrounds returns nested playgrounds', async () => {
  const res = await request(app)
    .get('/api/topics/let/playgrounds')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.data.playgrounds.length > 0);
  assert.strictEqual(res.body.data.playgrounds[0].slug, 'let-scope-playground');
});

// 5. Slug details & 5-tier parent lineage
test('5. Authenticated User → GET /api/playgrounds/let-scope-playground returns 5-tier lineage', async () => {
  const res = await request(app)
    .get('/api/playgrounds/let-scope-playground')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  const data = res.body.data;
  assert.strictEqual(data.slug, 'let-scope-playground');
  assert.ok(data.initialCode);
  assert.ok(data.instructions);

  // Check 5-tier hierarchy
  assert.strictEqual(data.topic.slug, 'let');
  assert.strictEqual(data.topic.section.slug, 'variables');
  assert.strictEqual(data.topic.section.module.slug, 'javascript-basics');
  assert.strictEqual(data.topic.section.module.learningPath.slug, 'javascript');
});

// 6. 404 for non-existent
test('6. GET /api/playgrounds/non-existent-playground returns 404 Not Found', async () => {
  const res = await request(app)
    .get('/api/playgrounds/non-existent-playground')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 404);
  assert.strictEqual(res.body.success, false);
});

// 7. Safe code execution: valid code
test('7. Authenticated User → POST /api/playgrounds/run executes code and captures console output', async () => {
  const res = await request(app)
    .post('/api/playgrounds/run')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      code: 'console.log("Hello from sandbox!");\nconsole.info("Math sum:", 10 + 20);',
      language: 'javascript',
    });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  const data = res.body.data;
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.error, null);
  assert.ok(Array.isArray(data.logs));
  assert.strictEqual(data.logs.length, 2);
  assert.strictEqual(data.logs[0].message, 'Hello from sandbox!');
  assert.strictEqual(data.logs[1].message, 'Math sum: 30');
});

// 8. Controlled safety: syntax error handling
test('8. POST /api/playgrounds/run captures syntax errors gracefully', async () => {
  const res = await request(app)
    .post('/api/playgrounds/run')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      code: 'const a = ;',
      language: 'javascript',
    });

  assert.strictEqual(res.status, 200);
  const data = res.body.data;
  assert.strictEqual(data.success, false);
  assert.ok(data.error.includes('SyntaxError'));
});

// 9. Controlled safety: infinite loop timeout protection
test('9. POST /api/playgrounds/run terminates infinite loops within timeout without crashing', async () => {
  const startTime = Date.now();
  const res = await request(app)
    .post('/api/playgrounds/run')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      code: 'while (true) {}',
      language: 'javascript',
    });

  const duration = Date.now() - startTime;
  assert.strictEqual(res.status, 200);
  const data = res.body.data;
  assert.strictEqual(data.success, false);
  assert.ok(data.error.includes('Execution Timed Out'));
  assert.ok(duration >= 1000 && duration < 3500);
});

// 10. Controlled safety: stripped globals prevents host tampering
test('10. POST /api/playgrounds/run prevents access to process and require', async () => {
  const res = await request(app)
    .post('/api/playgrounds/run')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      code: 'typeof process !== "undefined" ? process.exit(1) : "process is safe";',
      language: 'javascript',
    });

  assert.strictEqual(res.status, 200);
  const data = res.body.data;
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.result, 'process is safe');
});

// 11. Challenge run with expected output match
test('11. POST /api/playgrounds/:id/run evaluates challenge code against expected output', async () => {
  const playgroundRes = await request(app)
    .get('/api/playgrounds/let-scope-playground')
    .set('Authorization', `Bearer ${userToken}`);

  const pId = playgroundRes.body.data.id;
  const solCode = playgroundRes.body.data.solutionCode;

  const res = await request(app)
    .post(`/api/playgrounds/${pId}/run`)
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      code: solCode,
      language: 'javascript',
    });

  assert.strictEqual(res.status, 200);
  const data = res.body.data;
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.matchesExpectedOutput, true);
});

// 12. Standard User -> POST 403
test('12. Standard User → POST /api/playgrounds returns 403 Forbidden', async () => {
  const res = await request(app)
    .post('/api/playgrounds')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      title: 'Hacked Playground',
      topic: 'let',
      initialCode: 'console.log("hacked");',
    });

  assert.strictEqual(res.status, 403);
  assert.strictEqual(res.body.success, false);
});

// 13. Admin -> POST 201
test('13. Admin → POST /api/playgrounds returns 201 and creates new playground', async () => {
  const res = await request(app)
    .post('/api/playgrounds')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      title: `Closure Scope Explorer ${Date.now()}`,
      topic: 'let',
      description: 'Interactive closure sandbox exploring lexical environments',
      instructions: '# Closure Challenge\nReturn an inner function maintaining state.',
      initialCode: 'function createCounter() { let c = 0; return () => ++c; }\nconst counter = createCounter();\nconsole.log(counter());',
      expectedOutput: '1',
      difficulty: 'INTERMEDIATE',
      order: 10,
      published: true,
    });

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.data.id);
  createdPlaygroundId = res.body.data.id;
});

// 14. Standard User -> PUT 403
test('14. Standard User → PUT /api/playgrounds/:id returns 403 Forbidden', async () => {
  const res = await request(app)
    .put(`/api/playgrounds/${createdPlaygroundId}`)
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      title: 'Hacked Update',
    });

  assert.strictEqual(res.status, 403);
  assert.strictEqual(res.body.success, false);
});

// 15. Admin -> PUT 200
test('15. Admin → PUT /api/playgrounds/:id returns 200 and updates playground', async () => {
  const res = await request(app)
    .put(`/api/playgrounds/${createdPlaygroundId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      title: 'Closure Scope Explorer (Mastery Edition)',
      difficulty: 'ADVANCED',
    });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.title, 'Closure Scope Explorer (Mastery Edition)');
  assert.strictEqual(res.body.data.difficulty, 'ADVANCED');
});

// 16. Admin -> DELETE 200
test('16. Admin → DELETE /api/playgrounds/:id returns 200 and deletes playground', async () => {
  const res = await request(app)
    .delete(`/api/playgrounds/${createdPlaygroundId}`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);

  // Verify 404
  const verifyRes = await request(app)
    .get(`/api/playgrounds/id/${createdPlaygroundId}`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.strictEqual(verifyRes.status, 404);
});

test.after(async () => {
  await disconnectDB();
});
