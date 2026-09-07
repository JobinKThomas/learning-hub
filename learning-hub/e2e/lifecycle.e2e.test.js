import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

import app from '../backend/src/app.js';
import { connectDB } from '../backend/src/config/db.js';
import { authService } from '../backend/src/services/authService.js';

import { LearningPath } from '../backend/src/models/LearningPath.js';
import { Module } from '../backend/src/models/Module.js';
import { Section } from '../backend/src/models/Section.js';
import { Topic } from '../backend/src/models/Topic.js';
import { Note } from '../backend/src/models/Note.js';
import { Resource } from '../backend/src/models/Resource.js';
import { Playground } from '../backend/src/models/Playground.js';
import { Quiz } from '../backend/src/models/Quiz.js';
import { QuizAttempt } from '../backend/src/models/QuizAttempt.js';
import { InterviewQuestion } from '../backend/src/models/InterviewQuestion.js';
import { Progress } from '../backend/src/models/Progress.js';

let adminToken;
let learnerToken;
let learnerUser;

let testPathId;
let testPathSlug;
let testModuleId;
let testModuleSlug;
let testSectionId;
let testSectionSlug;
let testTopicId;
let testTopicSlug;
let testNoteId;
let testNoteSlug;
let testResourceId;
let testPlaygroundId;
let testQuizId;
let testQuestionId;

test.before(async () => {
  await connectDB();

  const timestamp = Date.now();

  // Create Admin
  const adminRes = await authService.register({
    name: 'E2E Admin',
    email: `e2e_admin_${timestamp}@example.com`,
    password: 'Password123!',
    role: 'ADMIN',
  });
  adminToken = adminRes.accessToken;

  // Create Learner
  const learnerRes = await authService.register({
    name: 'E2E Learner',
    email: `e2e_learner_${timestamp}@example.com`,
    password: 'Password123!',
    role: 'USER',
  });
  learnerToken = learnerRes.accessToken;
  learnerUser = learnerRes.user;
});

test('--- Tier 4 End-to-End Lifecycle Feature Tests ---', async (t) => {

  // ==========================================
  // 1. Auth & Roles Guard Lifecycle
  // ==========================================
  await t.test('1. Auth & Role Guards: Anonymous & Learner Role Permissions', async () => {
    // Anonymous cannot access protected paths
    const unauthRes = await request(app).get('/api/learning-paths');
    assert.equal(unauthRes.status, 401);
    assert.equal(unauthRes.body.success, false);

    // Learner cannot create paths
    const forbiddenRes = await request(app)
      .post('/api/learning-paths')
      .set('Authorization', `Bearer ${learnerToken}`)
      .send({ title: 'Hacked Path', description: 'Should fail' });
    assert.equal(forbiddenRes.status, 403);
  });

  // ==========================================
  // 2. Feature 1: Learning Path Lifecycle
  // Admin creates ➔ API returns 201 ➔ Database contains it ➔ Frontend fetches it ➔ Learning Paths displays it ➔ Click it ➔ Details displays
  // ==========================================
  await t.test('2. Feature 1: Learning Path Lifecycle', async () => {
    const timestamp = Date.now();
    const newPath = {
      title: `E2E Full Stack Path ${timestamp}`,
      description: 'Comprehensive end-to-end testing path for learning platform.',
      category: 'Web Development',
      level: 'Intermediate',
      estimatedHours: 40,
    };

    // 1. Admin creates -> API returns 201
    const createRes = await request(app)
      .post('/api/learning-paths')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newPath);

    assert.equal(createRes.status, 201);
    assert.equal(createRes.body.success, true);
    testPathId = createRes.body.data.id || createRes.body.data._id;
    testPathSlug = createRes.body.data.slug;
    assert.ok(testPathId);
    assert.ok(testPathSlug);

    // 2. Database contains it
    const dbDoc = await LearningPath.findById(testPathId);
    assert.ok(dbDoc, 'MongoDB should contain the created learning path');
    assert.equal(dbDoc.title, newPath.title);
    assert.equal(dbDoc.slug, testPathSlug);

    // 3. Frontend fetches list -> Learning Paths displays it
    const listRes = await request(app)
      .get('/api/learning-paths')
      .set('Authorization', `Bearer ${learnerToken}`);

    assert.equal(listRes.status, 200);
    const paths = listRes.body.data.paths || listRes.body.data;
    const foundInList = paths.find((p) => p.slug === testPathSlug);
    assert.ok(foundInList, 'Frontend list query should contain the created path');
    assert.equal(foundInList.title, newPath.title);

    // 4. Click it -> Details displays
    const detailsRes = await request(app)
      .get(`/api/learning-paths/${testPathSlug}`)
      .set('Authorization', `Bearer ${learnerToken}`);

    assert.equal(detailsRes.status, 200);
    assert.equal(detailsRes.body.data.slug, testPathSlug);
    assert.equal(detailsRes.body.data.title, newPath.title);
    assert.equal(detailsRes.body.data.level, 'Intermediate');
  });

  // ==========================================
  // 3. Feature 2: Module Lifecycle
  // Admin creates module ➔ 201 ➔ DB contains it ➔ Frontend fetches path modules ➔ Click module ➔ Details displays
  // ==========================================
  await t.test('3. Feature 2: Module Lifecycle', async () => {
    const timestamp = Date.now();
    const newModule = {
      learningPath: testPathId,
      title: `Core Architecture ${timestamp}`,
      description: 'Detailed curriculum module on scalable system design.',
      duration: '4 hours',
      order: 1,
    };

    // 1. Admin creates
    const createRes = await request(app)
      .post('/api/modules')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newModule);

    assert.equal(createRes.status, 201);
    testModuleId = createRes.body.data.id || createRes.body.data._id;
    testModuleSlug = createRes.body.data.slug;
    assert.ok(testModuleId);
    assert.ok(testModuleSlug);

    // 2. Database contains it
    const dbDoc = await Module.findById(testModuleId);
    assert.ok(dbDoc, 'MongoDB should contain the created module');
    assert.equal(dbDoc.title, newModule.title);

    // 3. Frontend fetches learning path curriculum
    const listRes = await request(app)
      .get(`/api/learning-paths/${testPathSlug}/modules`)
      .set('Authorization', `Bearer ${learnerToken}`);

    assert.equal(listRes.status, 200);
    const modules = listRes.body.data.modules || listRes.body.data;
    assert.ok(modules.some((m) => m.slug === testModuleSlug));

    // 4. Click module -> Details displays
    const detailsRes = await request(app)
      .get(`/api/modules/${testModuleSlug}`)
      .set('Authorization', `Bearer ${learnerToken}`);

    assert.equal(detailsRes.status, 200);
    assert.equal(detailsRes.body.data.slug, testModuleSlug);
    assert.equal(detailsRes.body.data.title, newModule.title);
  });

  // ==========================================
  // 4. Feature 3: Section Lifecycle
  // Admin creates section ➔ 201 ➔ DB contains it ➔ Module sections display ➔ Click section ➔ Details displays
  // ==========================================
  await t.test('4. Feature 3: Section Lifecycle', async () => {
    const timestamp = Date.now();
    const newSection = {
      module: testModuleId,
      title: `Section Async Patterns ${timestamp}`,
      description: 'Event loops, callbacks, and microtask queues.',
      duration: '1 hour',
      order: 1,
    };

    // 1. Admin creates
    const createRes = await request(app)
      .post('/api/sections')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newSection);

    assert.equal(createRes.status, 201);
    testSectionId = createRes.body.data.id || createRes.body.data._id;
    testSectionSlug = createRes.body.data.slug;
    assert.ok(testSectionId);
    assert.ok(testSectionSlug);

    // 2. Database contains it
    const dbDoc = await Section.findById(testSectionId);
    assert.ok(dbDoc, 'MongoDB should contain the created section');
    assert.equal(dbDoc.title, newSection.title);

    // 3. Frontend fetches module sections
    const listRes = await request(app)
      .get(`/api/modules/${testModuleSlug}/sections`)
      .set('Authorization', `Bearer ${learnerToken}`);

    assert.equal(listRes.status, 200);
    const sections = listRes.body.data.sections || listRes.body.data;
    assert.ok(sections.some((s) => s.slug === testSectionSlug));

    // 4. Click section -> Details displays
    const detailsRes = await request(app)
      .get(`/api/sections/${testSectionSlug}`)
      .set('Authorization', `Bearer ${learnerToken}`);

    assert.equal(detailsRes.status, 200);
    assert.equal(detailsRes.body.data.slug, testSectionSlug);
  });

  // ==========================================
  // 5. Feature 4: Topic Lifecycle
  // Admin creates topic ➔ 201 ➔ DB contains it ➔ Section topics list ➔ Click topic ➔ Details displays code & keypoints
  // ==========================================
  await t.test('5. Feature 4: Topic Lifecycle', async () => {
    const timestamp = Date.now();
    const newTopic = {
      section: testSectionId,
      title: `Event Loop Macrotasks ${timestamp}`,
      description: 'Understanding timers and setImmediate in Node.js event loop.',
      duration: '20 mins',
      keyPoints: ['setImmediate runs on check phase', 'setTimeout has minimum 1ms delay'],
      codeExamples: [
        {
          title: 'Immediate check',
          language: 'javascript',
          code: 'setImmediate(() => console.log("immediate"));',
          explanation: 'Executes on next turn of the event loop.',
        },
      ],
      order: 1,
    };

    // 1. Admin creates
    const createRes = await request(app)
      .post('/api/topics')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newTopic);

    assert.equal(createRes.status, 201);
    testTopicId = createRes.body.data.id || createRes.body.data._id;
    testTopicSlug = createRes.body.data.slug;
    assert.ok(testTopicId);
    assert.ok(testTopicSlug);

    // 2. Database contains it
    const dbDoc = await Topic.findById(testTopicId);
    assert.ok(dbDoc, 'MongoDB should contain the created topic');
    assert.equal(dbDoc.title, newTopic.title);

    // 3. Frontend fetches section topics
    const listRes = await request(app)
      .get(`/api/sections/${testSectionSlug}/topics`)
      .set('Authorization', `Bearer ${learnerToken}`);

    assert.equal(listRes.status, 200);
    const topics = listRes.body.data.topics || listRes.body.data;
    assert.ok(topics.some((t) => t.slug === testTopicSlug));

    // 4. Click topic -> Details displays
    const detailsRes = await request(app)
      .get(`/api/topics/${testTopicSlug}`)
      .set('Authorization', `Bearer ${learnerToken}`);

    assert.equal(detailsRes.status, 200);
    assert.equal(detailsRes.body.data.slug, testTopicSlug);
    assert.equal(detailsRes.body.data.keyPoints.length, 2);
    assert.equal(detailsRes.body.data.codeExamples.length, 1);
  });

  // ==========================================
  // 6. Feature 5: Study Note Lifecycle
  // Admin creates note ➔ 201 ➔ DB contains it ➔ Notes list displays ➔ Click note ➔ Details displays markdown
  // ==========================================
  await t.test('6. Feature 5: Study Note Lifecycle', async () => {
    const timestamp = Date.now();
    const newNote = {
      topic: testTopicId,
      title: `Event Loop Cheatsheet ${timestamp}`,
      summary: 'Quick reference for timers and nextTick priority.',
      content: '# Microtasks vs Macrotasks\nDetailed breakdown...',
      readingTime: '5 mins',
      tags: ['event-loop', 'async', 'performance'],
    };

    // 1. Admin creates
    const createRes = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newNote);

    assert.equal(createRes.status, 201);
    testNoteId = createRes.body.data.id || createRes.body.data._id;
    testNoteSlug = createRes.body.data.slug;
    assert.ok(testNoteId);
    assert.ok(testNoteSlug);

    // 2. Database contains it
    const dbDoc = await Note.findById(testNoteId);
    assert.ok(dbDoc, 'MongoDB should contain the created note');
    assert.equal(dbDoc.title, newNote.title);

    // 3. Frontend fetches notes
    const listRes = await request(app)
      .get(`/api/notes?topic=${testTopicSlug}`)
      .set('Authorization', `Bearer ${learnerToken}`);

    assert.equal(listRes.status, 200);
    const notes = listRes.body.data.notes || listRes.body.data;
    assert.ok(notes.some((n) => n.slug === testNoteSlug));

    // 4. Click note -> Details displays
    const detailsRes = await request(app)
      .get(`/api/notes/${testNoteSlug}`)
      .set('Authorization', `Bearer ${learnerToken}`);

    assert.equal(detailsRes.status, 200);
    assert.equal(detailsRes.body.data.title, newNote.title);
    assert.ok(detailsRes.body.data.content.includes('Microtasks vs Macrotasks'));
  });

  // ==========================================
  // 7. Feature 6: Curated Resource Lifecycle
  // Admin creates resource ➔ 201 ➔ DB contains it ➔ Topic resources display ➔ Click resource ➔ Details display
  // ==========================================
  await t.test('7. Feature 6: Curated Resource Lifecycle', async () => {
    const timestamp = Date.now();
    const newResource = {
      topic: testTopicId,
      title: `Official Node.js Event Loop Guide ${timestamp}`,
      url: 'https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick',
      type: 'DOCUMENTATION',
      author: 'Node.js Core Team',
      description: 'In-depth documentation by the official team.',
      isFree: true,
    };

    // 1. Admin creates
    const createRes = await request(app)
      .post('/api/resources')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newResource);

    assert.equal(createRes.status, 201);
    testResourceId = createRes.body.data.id || createRes.body.data._id;
    assert.ok(testResourceId);

    // 2. Database contains it
    const dbDoc = await Resource.findById(testResourceId);
    assert.ok(dbDoc, 'MongoDB should contain created resource');
    assert.equal(dbDoc.url, newResource.url);

    // 3. Frontend fetches topic resources
    const listRes = await request(app)
      .get(`/api/resources?topic=${testTopicSlug}`)
      .set('Authorization', `Bearer ${learnerToken}`);

    assert.equal(listRes.status, 200);
    const resources = listRes.body.data.resources || listRes.body.data;
    assert.ok(resources.some((r) => r.id === testResourceId || r._id === testResourceId));

    // 4. Get by ID
    const detailsRes = await request(app)
      .get(`/api/resources/${testResourceId}`)
      .set('Authorization', `Bearer ${learnerToken}`);

    assert.equal(detailsRes.status, 200);
    assert.equal(detailsRes.body.data.type, 'DOCUMENTATION');
  });

  // ==========================================
  // 8. Feature 7: Interactive Playground Lifecycle & Safe Execution
  // Admin creates playground ➔ 201 ➔ DB contains it ➔ Run code returns output
  // ==========================================
  await t.test('8. Feature 7: Playground Lifecycle & Safe Execution', async () => {
    const timestamp = Date.now();
    const newPlayground = {
      topic: testTopicId,
      title: `Async Flow Challenge ${timestamp}`,
      description: 'Practice chaining promises safely.',
      initialCode: 'console.log("Starting challenge"); const res = 2 + 2; res;',
      language: 'javascript',
      difficulty: 'BEGINNER',
    };

    // 1. Admin creates
    const createRes = await request(app)
      .post('/api/playgrounds')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newPlayground);

    assert.equal(createRes.status, 201);
    testPlaygroundId = createRes.body.data.id || createRes.body.data._id;
    assert.ok(testPlaygroundId);

    // 2. Database contains it
    const dbDoc = await Playground.findById(testPlaygroundId);
    assert.ok(dbDoc, 'MongoDB should contain created playground');

    // 3. Safe code runner execution
    const runRes = await request(app)
      .post('/api/playgrounds/run')
      .set('Authorization', `Bearer ${learnerToken}`)
      .send({
        code: 'console.log("E2E Runner Success"); const ans = 42; ans;',
        language: 'javascript',
      });

    assert.equal(runRes.status, 200);
    assert.equal(runRes.body.success, true);
    assert.equal(runRes.body.data.result, '42');
    assert.ok(runRes.body.data.logs.some((l) => l.message && l.message.includes('E2E Runner Success')));
  });

  // ==========================================
  // 9. Feature 8: Quizzes & Quiz Attempts Scoring Lifecycle
  // Admin creates quiz ➔ 201 ➔ DB contains it ➔ Learner starts quiz ➔ Learner submits ➔ Score calculated & attempt saved
  // ==========================================
  await t.test('9. Feature 8: Quiz & Quiz Attempt Scoring Lifecycle', async () => {
    const timestamp = Date.now();
    const newQuiz = {
      topic: testTopicId,
      title: `Event Loop Quiz ${timestamp}`,
      description: 'Test your understanding of task queues.',
      passingScore: 70,
      timeLimitMinutes: 10,
      questions: [
        {
          question: 'Which has higher priority: process.nextTick or setImmediate?',
          options: ['process.nextTick', 'setImmediate'],
          correctAnswer: 0,
          explanation: 'process.nextTick fires before microtasks and before event loop continues.',
        },
        {
          question: 'In which phase does setTimeout callback execute?',
          options: ['Check phase', 'Timers phase', 'Poll phase'],
          correctAnswer: 1,
          explanation: 'Timers phase executes callbacks scheduled by setTimeout.',
        },
      ],
    };

    // 1. Admin creates quiz
    const createRes = await request(app)
      .post('/api/quizzes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newQuiz);

    assert.equal(createRes.status, 201);
    testQuizId = createRes.body.data.id || createRes.body.data._id;
    assert.ok(testQuizId);

    // 2. Database contains it
    const dbDoc = await Quiz.findById(testQuizId);
    assert.ok(dbDoc, 'MongoDB should contain created quiz');
    assert.equal(dbDoc.questions.length, 2);
    const q1Id = dbDoc.questions[0]._id;
    const q2Id = dbDoc.questions[1]._id;

    // 3. Learner fetches quiz
    const getRes = await request(app)
      .get(`/api/quizzes/${testQuizId}`)
      .set('Authorization', `Bearer ${learnerToken}`);

    assert.equal(getRes.status, 200);
    assert.equal(getRes.body.data.questions.length, 2);

    // 4. Learner submits answers (2/2 correct = 100% -> Pass)
    const submitRes = await request(app)
      .post(`/api/quizzes/${testQuizId}/attempts`)
      .set('Authorization', `Bearer ${learnerToken}`)
      .send({
        answers: [
          { questionId: q1Id, selectedOption: 0 },
          { questionId: q2Id, selectedOption: 1 },
        ],
        timeSpentSeconds: 45,
      });

    assert.equal(submitRes.status, 201);
    assert.equal(submitRes.body.success, true);
    assert.equal(submitRes.body.data.score, 2);
    assert.equal(submitRes.body.data.totalQuestions, 2);
    assert.equal(submitRes.body.data.percentage, 100);
    assert.equal(submitRes.body.data.passed, true);

    // 5. Database contains attempt
    const attemptDoc = await QuizAttempt.findById(submitRes.body.data.id || submitRes.body.data._id);
    assert.ok(attemptDoc, 'MongoDB should store the quiz attempt');
    assert.equal(attemptDoc.passed, true);

    // 6. Learner history contains attempt
    const historyRes = await request(app)
      .get(`/api/quizzes/${testQuizId}/attempts`)
      .set('Authorization', `Bearer ${learnerToken}`);

    assert.equal(historyRes.status, 200);
    const attempts = historyRes.body.data.attempts || historyRes.body.data;
    assert.ok(attempts.length >= 1);
  });

  // ==========================================
  // 10. Feature 9: Technical Interview Question Lifecycle
  // Admin creates question ➔ 201 ➔ DB contains it ➔ Learner lists questions ➔ Reveal answer displays solution
  // ==========================================
  await t.test('10. Feature 9: Technical Interview Question Lifecycle', async () => {
    const timestamp = Date.now();
    const newIQ = {
      topic: testTopicId,
      question: `What is the difference between microtasks and macrotasks? ${timestamp}`,
      answer: 'Microtasks (Promises, queueMicrotask) execute immediately after the current operation and before yielding to the event loop. Macrotasks (timers, I/O) are picked in subsequent turns.',
      difficulty: 'INTERMEDIATE',
      frequency: 'FREQUENT',
      tags: ['event-loop', 'concurrency'],
    };

    // 1. Admin creates
    const createRes = await request(app)
      .post('/api/interview-questions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newIQ);

    assert.equal(createRes.status, 201);
    testQuestionId = createRes.body.data.id || createRes.body.data._id;
    assert.ok(testQuestionId);

    // 2. Database contains it
    const dbDoc = await InterviewQuestion.findById(testQuestionId);
    assert.ok(dbDoc, 'MongoDB should contain created interview question');

    // 3. Learner fetches list
    const listRes = await request(app)
      .get(`/api/interview-questions?topic=${testTopicSlug}`)
      .set('Authorization', `Bearer ${learnerToken}`);

    assert.equal(listRes.status, 200);
    const questions = listRes.body.data.questions || listRes.body.data;
    const foundQ = questions.find((q) => q.id === testQuestionId || q._id === testQuestionId);
    assert.ok(foundQ);
    assert.ok(foundQ.answer.includes('Microtasks (Promises'));
  });

  // ==========================================
  // 11. Feature 10: Progress Tracking Lifecycle
  // Learner completes topic ➔ 200 ➔ DB stores progress ➔ Topic progress isCompleted: true ➔ Learning Path % updates
  // ==========================================
  await t.test('11. Feature 10: Progress Tracking Lifecycle', async () => {
    // 1. Learner records topic completion
    const progRes = await request(app)
      .post('/api/progress')
      .set('Authorization', `Bearer ${learnerToken}`)
      .send({
        topicId: testTopicId,
        learningPathId: testPathId,
        moduleId: testModuleId,
        sectionId: testSectionId,
        completedKeyPoints: [0, 1],
        isCompleted: true,
      });

    assert.equal(progRes.status, 200);
    assert.equal(progRes.body.success, true);

    // 2. Database stores progress
    const dbDoc = await Progress.findOne({ user: learnerUser.id || learnerUser._id, topic: testTopicId });
    assert.ok(dbDoc, 'MongoDB should store user progress document');
    assert.equal(dbDoc.isCompleted, true);

    // 3. Topic progress API returns completed
    const topicProgRes = await request(app)
      .get(`/api/progress/topic/${testTopicId}`)
      .set('Authorization', `Bearer ${learnerToken}`);

    assert.equal(topicProgRes.status, 200);
    assert.equal(topicProgRes.body.data.isCompleted, true);

    // 4. Learning Path progress calculation
    const pathProgRes = await request(app)
      .get(`/api/progress/learning-path/${testPathId}`)
      .set('Authorization', `Bearer ${learnerToken}`);

    assert.equal(pathProgRes.status, 200);
    assert.ok(pathProgRes.body.data.percentage >= 0);
  });

  // ==========================================
  // 12. Feature 11: Dashboard Aggregations Lifecycle
  // Learner accesses GET /api/dashboard ➔ Returns real aggregated stats (paths, completed topics, quiz average)
  // ==========================================
  await t.test('12. Feature 11: Dashboard Aggregations Lifecycle', async () => {
    const dashRes = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${learnerToken}`);

    assert.equal(dashRes.status, 200);
    assert.equal(dashRes.body.success, true);
    const data = dashRes.body.data;
    assert.ok(data.stats, 'Dashboard should include stats block');
    assert.ok(data.stats.completedTopicsCount >= 1, 'Completed topics count should reflect recent completion');
    assert.ok(data.stats.quizAverage >= 70, 'Quiz average should reflect recent 100% quiz attempt');
  });

  // ==========================================
  // 13. Feature 12: Search, Filter & Pagination Lifecycle
  // GET /api/learning-paths with query params returns paginated envelope
  // ==========================================
  await t.test('13. Feature 12: Search, Filter & Pagination Lifecycle', async () => {
    const pageRes = await request(app)
      .get('/api/learning-paths?page=1&limit=2&level=Intermediate')
      .set('Authorization', `Bearer ${learnerToken}`);

    assert.equal(pageRes.status, 200);
    assert.ok(pageRes.body.data.paths);
    assert.ok(pageRes.body.data.pagination);
    assert.equal(pageRes.body.data.pagination.page, 1);
    assert.equal(pageRes.body.data.pagination.limit, 2);
  });

  // ==========================================
  // 14. Feature 13: Error Handling & Defensive Guarding Lifecycle
  // 404 on missing slug, 400 on invalid input, 403 on role breach
  // ==========================================
  await t.test('14. Feature 13: Error Handling & Defensive Normalization Lifecycle', async () => {
    // 404 for missing path
    const notFoundRes = await request(app)
      .get('/api/learning-paths/non-existent-path-slug-99999')
      .set('Authorization', `Bearer ${learnerToken}`);
    assert.equal(notFoundRes.status, 404);
    assert.equal(notFoundRes.body.success, false);

    // 400 for bad payload (missing title)
    const badPayloadRes = await request(app)
      .post('/api/learning-paths')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'No title' });
    assert.equal(badPayloadRes.status, 400);
    assert.equal(badPayloadRes.body.success, false);

    // 403 when standard user attempts to delete admin resource
    const forbiddenDeleteRes = await request(app)
      .delete(`/api/learning-paths/${testPathId}`)
      .set('Authorization', `Bearer ${learnerToken}`);
    assert.equal(forbiddenDeleteRes.status, 403);
    assert.equal(forbiddenDeleteRes.body.success, false);
  });

});
