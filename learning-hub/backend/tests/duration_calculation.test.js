import test, { before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import {
  parseDurationToMinutes,
  formatMinutesToDuration,
  calculateTopicDurationFromContent,
  calculateSectionDuration,
  calculateModuleDuration,
  calculatePathEstimatedHours,
} from '../src/utils/durationCalculator.js';
import { User } from '../src/models/User.js';
import { LearningPath } from '../src/models/LearningPath.js';
import { Module } from '../src/models/Module.js';
import { Section } from '../src/models/Section.js';
import { Topic } from '../src/models/Topic.js';

let adminToken;
let testPathId;
let testModuleId;
let testSectionId;
let testTopicId1;
let testTopicId2;

before(async () => {
  await connectDB();

  // Create admin user for testing
  const adminEmail = `duration_admin_${Date.now()}@example.com`;
  const admin = await User.create({
    name: 'Duration Test Admin',
    email: adminEmail,
    password: 'Password123!',
    role: 'ADMIN',
  });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: adminEmail, password: 'Password123!' });

  adminToken = loginRes.body.data.accessToken;
});

after(async () => {
  // Clean up test data
  if (testTopicId1) await Topic.findByIdAndDelete(testTopicId1);
  if (testTopicId2) await Topic.findByIdAndDelete(testTopicId2);
  if (testSectionId) await Section.findByIdAndDelete(testSectionId);
  if (testModuleId) await Module.findByIdAndDelete(testModuleId);
  if (testPathId) await LearningPath.findByIdAndDelete(testPathId);
  await User.deleteMany({ email: /duration_admin_/ });
  await disconnectDB();
});

// ==========================================
// 1. Unit Tests for durationCalculator utils
// ==========================================

test('1. parseDurationToMinutes correctly converts strings to minutes', () => {
  assert.strictEqual(parseDurationToMinutes('15 mins'), 15);
  assert.strictEqual(parseDurationToMinutes('2 hours'), 120);
  assert.strictEqual(parseDurationToMinutes('1 hr 30 mins'), 90);
  assert.strictEqual(parseDurationToMinutes('1.5 hrs'), 90);
  assert.strictEqual(parseDurationToMinutes(45), 45);
  assert.strictEqual(parseDurationToMinutes('45'), 45);
  assert.strictEqual(parseDurationToMinutes(''), 0);
  assert.strictEqual(parseDurationToMinutes(null), 0);
});

test('2. formatMinutesToDuration formats minutes into clean labels', () => {
  assert.strictEqual(formatMinutesToDuration(15, 'topic'), '15 mins');
  assert.strictEqual(formatMinutesToDuration(60, 'topic'), '1 hour');
  assert.strictEqual(formatMinutesToDuration(120, 'module'), '2 hours');
  assert.strictEqual(formatMinutesToDuration(90, 'section'), '1 hr 30 mins');
  assert.strictEqual(formatMinutesToDuration(125, 'path'), '2 hours');
  assert.strictEqual(formatMinutesToDuration(0, 'topic'), '1 mins');
});

test('3. calculateTopicDurationFromContent calculates time based on prose, code, and key points', () => {
  // 360 words ~ 2 mins reading
  const words360 = new Array(360).fill('word').join(' ');
  const codeSnippet = 'const a = 1;\nconst b = 2;\nconsole.log(a + b);'; // ~3 lines -> 2 mins
  const keyPoints = ['Point 1', 'Point 2', 'Point 3', 'Point 4']; // 4 points -> 2 mins

  const result = calculateTopicDurationFromContent({
    content: words360,
    codeExamples: [{ code: codeSnippet }],
    keyPoints,
  });

  // Reading: 2 mins + Code: 2 mins + Key points: 2 mins = 6 mins
  assert.strictEqual(result.minutes, 6);
  assert.strictEqual(result.formatted, '6 mins');
  assert.strictEqual(result.details.words, 360);
});

test('4. calculateTopicDurationFromContent enforces minimum 5 minutes', () => {
  const result = calculateTopicDurationFromContent({
    content: 'Very short content',
  });
  assert.strictEqual(result.minutes, 5);
  assert.strictEqual(result.formatted, '5 mins');
});

// ==========================================
// 2. Integration Tests: Hierarchy Duration Rollup
// ==========================================

test('5. Admin creates LearningPath, Module, Section, and Topic without duration -> auto-calculates from content', async () => {
  const timestamp = Date.now();

  // Create Learning Path
  const pathRes = await request(app)
    .post('/api/learning-paths')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      title: `Duration LP ${timestamp}`,
      description: 'Testing automatic duration calculations across hierarchy',
      category: 'Web Development',
      level: 'Beginner',
    });
  assert.strictEqual(pathRes.status, 201);
  testPathId = pathRes.body.data.id;

  // Create Module
  const modRes = await request(app)
    .post('/api/modules')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      title: `Duration Module ${timestamp}`,
      learningPath: testPathId,
      description: 'Module for duration tests',
    });
  assert.strictEqual(modRes.status, 201);
  testModuleId = modRes.body.data.id;

  // Create Section
  const secRes = await request(app)
    .post('/api/sections')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      title: `Duration Section ${timestamp}`,
      module: testModuleId,
      description: 'Section for duration tests',
    });
  assert.strictEqual(secRes.status, 201);
  testSectionId = secRes.body.data.id;

  // Create Topic with 540 words prose + code + key points (duration omitted)
  const words540 = new Array(540).fill('topicword').join(' ');
  const topRes = await request(app)
    .post('/api/topics')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      title: `Topic One ${timestamp}`,
      section: testSectionId,
      summary: 'Short summary',
      description: 'A comprehensive topic with ample text to calculate duration.',
      content: words540,
      codeExamples: [
        {
          title: 'Code Example 1',
          code: 'function hello() {\n  return "world";\n}',
        },
      ],
      keyPoints: ['Key 1', 'Key 2'],
      // duration intentionally omitted to trigger content-based calculation!
    });

  assert.strictEqual(topRes.status, 201);
  testTopicId1 = topRes.body.data.id;

  // 540 words (3 mins) + code (2 mins) + 2 key points (1 min) = 6 mins
  const duration1 = topRes.body.data.duration;
  assert.ok(duration1.includes('mins'), `Expected duration to be formatted in mins, got: ${duration1}`);
  const minutes1 = parseDurationToMinutes(duration1);
  assert.ok(minutes1 >= 5, `Expected duration >= 5 mins, got: ${minutes1}`);

  // Verify parent Section has rolled up to duration1
  const secCheck = await request(app)
    .get(`/api/sections/id/${testSectionId}`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.strictEqual(secCheck.status, 200);
  assert.strictEqual(secCheck.body.data.duration, duration1);

  // Verify parent Module has rolled up
  const modCheck = await request(app)
    .get(`/api/modules/id/${testModuleId}`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.strictEqual(modCheck.status, 200);
  assert.strictEqual(modCheck.body.data.duration, duration1);
});

test('6. Adding a second Topic under the Section rolls up total duration to Section, Module, and LearningPath', async () => {
  const timestamp = Date.now();
  const words900 = new Array(900).fill('secondword').join(' '); // 900 words ~ 5 mins + 2 code ~ 4 mins = ~9 mins

  const topRes2 = await request(app)
    .post('/api/topics')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      title: `Topic Two ${timestamp}`,
      section: testSectionId,
      description: 'Second topic description',
      content: words900,
      codeExamples: [
        {
          title: 'Code Example 1',
          code: 'const x = 10;\nconst y = 20;',
        },
        {
          title: 'Code Example 2',
          code: 'function compute() {\n  return x * y;\n}',
        },
      ],
    });

  assert.strictEqual(topRes2.status, 201);
  testTopicId2 = topRes2.body.data.id;

  const top1Minutes = (await Topic.findById(testTopicId1)).duration;
  const top2Minutes = topRes2.body.data.duration;
  const expectedTotalMins = parseDurationToMinutes(top1Minutes) + parseDurationToMinutes(top2Minutes);

  // Verify Section duration reflects sum of both topics
  const secCheck = await Section.findById(testSectionId);
  assert.strictEqual(parseDurationToMinutes(secCheck.duration), expectedTotalMins);

  // Verify Module duration reflects the updated Section duration
  const modCheck = await Module.findById(testModuleId);
  assert.strictEqual(parseDurationToMinutes(modCheck.duration), expectedTotalMins);

  // Verify Learning Path estimatedHours via GET /api/learning-paths/id/:id
  const pathCheck = await request(app)
    .get(`/api/learning-paths/id/${testPathId}`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.strictEqual(pathCheck.status, 200);
  assert.ok(pathCheck.body.data.estimatedHours >= 1);
});

test('7. Deleting a Topic recalculates and rolls down Section and Module durations', async () => {
  const delRes = await request(app)
    .delete(`/api/topics/${testTopicId2}`)
    .set('Authorization', `Bearer ${adminToken}`);
  assert.strictEqual(delRes.status, 200);
  testTopicId2 = null;

  // Verify Section duration returns to Topic 1 duration
  const secCheck = await Section.findById(testSectionId);
  const top1 = await Topic.findById(testTopicId1);
  assert.strictEqual(secCheck.duration, top1.duration);

  // Verify Module duration returns to Section duration
  const modCheck = await Module.findById(testModuleId);
  assert.strictEqual(modCheck.duration, top1.duration);
});
