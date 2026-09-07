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
import { seedNotes } from '../scripts/seedNotes.js';

let adminToken;
let userToken;
let createdNoteId;

test.before(async () => {
  await connectDB();
  await seedLearningPaths(false);
  await seedModules(false);
  await seedSections(false);
  await seedTopics(false);
  await seedNotes(false);

  const timestamp = Date.now();

  const adminResult = await authService.register({
    name: 'Note Admin',
    email: `note_admin_${timestamp}@example.com`,
    password: 'Password123!',
    role: 'ADMIN',
  });
  adminToken = adminResult.accessToken;

  const userResult = await authService.register({
    name: 'Note Learner',
    email: `note_user_${timestamp}@example.com`,
    password: 'Password123!',
    role: 'USER',
  });
  userToken = userResult.accessToken;
});

// 1. GET /api/notes - Anonymous -> 401
test('1. Anonymous → GET /api/notes returns 401 Unauthorized', async () => {
  const res = await request(app).get('/api/notes');
  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.body.success, false);
});

// 2. GET /api/notes - Authenticated User -> 200
test('2. Authenticated User → GET /api/notes returns 200 and list of notes', async () => {
  const res = await request(app)
    .get('/api/notes')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(Array.isArray(res.body.data.notes));
  assert.ok(res.body.data.notes.length >= 3);

  const whatIsLetNote = res.body.data.notes.find((n) => n.slug === 'what-is-let');
  assert.ok(whatIsLetNote, "Should find 'what-is-let' note");
  assert.strictEqual(whatIsLetNote.title, 'What is let?');
});

// 3. GET /api/notes?topic=let - Authenticated User -> 200 with notes under let
test('3. Authenticated User → GET /api/notes?topic=let returns 200 with what-is-let, let-vs-const, block-scope', async () => {
  const res = await request(app)
    .get('/api/notes?topic=let')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(Array.isArray(res.body.data.notes));
  assert.ok(res.body.data.notes.length >= 3);

  const slugs = res.body.data.notes.map((n) => n.slug);
  assert.ok(slugs.includes('what-is-let'), "Must include 'what-is-let'");
  assert.ok(slugs.includes('let-vs-const'), "Must include 'let-vs-const'");
  assert.ok(slugs.includes('block-scope'), "Must include 'block-scope'");
});

// 4. GET /api/topics/let/notes - Authenticated User -> 200 with what-is-let, let-vs-const, block-scope
test('4. Authenticated User → GET /api/topics/let/notes returns 200 with notes for topic', async () => {
  const res = await request(app)
    .get('/api/topics/let/notes')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(Array.isArray(res.body.data.notes));
  assert.ok(res.body.data.notes.length >= 3);

  const slugs = res.body.data.notes.map((n) => n.slug);
  assert.ok(slugs.includes('what-is-let'));
  assert.ok(slugs.includes('let-vs-const'));
  assert.ok(slugs.includes('block-scope'));
});

// 5. GET /api/notes/what-is-let - Authenticated User -> 200 with full content and 5-tier parent hierarchy
test('5. Authenticated User → GET /api/notes/what-is-let returns 200 with full content & parent hierarchy', async () => {
  const res = await request(app)
    .get('/api/notes/what-is-let')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.slug, 'what-is-let');
  assert.strictEqual(res.body.data.title, 'What is let?');
  assert.ok(res.body.data.content, 'Content must not be empty');
  assert.ok(res.body.data.readingTime, 'Reading time must be present');
  assert.ok(Array.isArray(res.body.data.tags));

  // Verify 5-tier parent hierarchy
  assert.ok(res.body.data.topic, 'Parent topic must be populated');
  assert.strictEqual(res.body.data.topic.slug, 'let');
  assert.ok(res.body.data.topic.section, 'Parent section must be populated');
  assert.strictEqual(res.body.data.topic.section.slug, 'variables');
  assert.ok(res.body.data.topic.section.module, 'Parent module must be populated');
  assert.strictEqual(res.body.data.topic.section.module.slug, 'javascript-basics');
  assert.ok(res.body.data.topic.section.module.learningPath, 'Parent learning path must be populated');
  assert.strictEqual(res.body.data.topic.section.module.learningPath.slug, 'javascript');
});

// 6. GET /api/notes/non-existent-slug - Non-existent slug -> 404
test('6. GET /api/notes/non-existent-slug returns 404 Not Found', async () => {
  const res = await request(app)
    .get('/api/notes/non-existent-slug')
    .set('Authorization', `Bearer ${userToken}`);

  assert.strictEqual(res.status, 404);
  assert.strictEqual(res.body.success, false);
});

// 7. POST /api/notes - Standard User -> 403 Forbidden
test('7. Standard User → POST /api/notes returns 403 Forbidden', async () => {
  const res = await request(app)
    .post('/api/notes')
    .set('Authorization', `Bearer ${userToken}`)
    .send({
      title: 'Unauthorized Note',
      topic: 'let',
      content: 'Should be rejected',
    });

  assert.strictEqual(res.status, 403);
  assert.strictEqual(res.body.success, false);
});

// 8. POST /api/notes - Admin -> 201 Created
test('8. Admin → POST /api/notes returns 201 and creates new note', async () => {
  const timestamp = Date.now();
  const newNote = {
    title: `Understanding TDZ Details ${timestamp}`,
    slug: `understanding-tdz-details-${timestamp}`,
    topic: 'let',
    summary: 'An exploration of initialization boundaries',
    content: '# Temporal Dead Zone Mechanics\n\nDeep dive into the compilation phase and bytecode generation.',
    readingTime: '7 mins',
    order: 4,
    tags: ['tdz', 'javascript', 'internals'],
  };

  const res = await request(app)
    .post('/api/notes')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(newNote);

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.title, newNote.title);
  assert.strictEqual(res.body.data.slug, newNote.slug);
  assert.ok(res.body.data.id);
  createdNoteId = res.body.data.id;
});

// 9. PUT /api/notes/:id - Standard User -> 403 Forbidden
test('9. Standard User → PUT /api/notes/:id returns 403 Forbidden', async () => {
  const res = await request(app)
    .put(`/api/notes/${createdNoteId}`)
    .set('Authorization', `Bearer ${userToken}`)
    .send({ title: 'Tampered Note Title' });

  assert.strictEqual(res.status, 403);
  assert.strictEqual(res.body.success, false);
});

// 10. Admin → PUT /api/notes/:id returns 200 and updates note
test('10. Admin → PUT /api/notes/:id returns 200 and updates note', async () => {
  const res = await request(app)
    .put(`/api/notes/${createdNoteId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      title: 'Understanding TDZ Details (Updated)',
      readingTime: '8 mins',
    });

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.data.title, 'Understanding TDZ Details (Updated)');
  assert.strictEqual(res.body.data.readingTime, '8 mins');
});

// 11. Admin → DELETE /api/notes/:id returns 200 and deletes note
test('11. Admin → DELETE /api/notes/:id returns 200 and deletes note', async () => {
  const res = await request(app)
    .delete(`/api/notes/${createdNoteId}`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);

  // Verify it returns 404
  const verifyRes = await request(app)
    .get(`/api/notes/id/${createdNoteId}`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.strictEqual(verifyRes.status, 404);
});

test.after(async () => {
  await disconnectDB();
});
