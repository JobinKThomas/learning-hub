import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';

import { LearningPath, slugify as slugifyPath } from '../../src/models/LearningPath.js';
import { Module } from '../../src/models/Module.js';
import { Section } from '../../src/models/Section.js';
import { Topic } from '../../src/models/Topic.js';
import { Note } from '../../src/models/Note.js';
import { Resource, RESOURCE_TYPES } from '../../src/models/Resource.js';
import { Playground } from '../../src/models/Playground.js';
import { Quiz } from '../../src/models/Quiz.js';
import { QuizAttempt } from '../../src/models/QuizAttempt.js';
import { InterviewQuestion } from '../../src/models/InterviewQuestion.js';
import { Progress } from '../../src/models/Progress.js';
import { User } from '../../src/models/User.js';

test('--- Tier 1 Unit Tests: Mongoose Models & Schemas ---', async (t) => {

  await t.test('1. LearningPath Model Validations', async () => {
    // Missing required fields
    const emptyDoc = new LearningPath({});
    const err = emptyDoc.validateSync();
    assert.ok(err.errors.title, 'Title should be required');
    assert.ok(err.errors.description, 'Description should be required');

    // Title length bounds
    const shortTitleDoc = new LearningPath({ title: 'A', description: 'Valid description' });
    const shortErr = shortTitleDoc.validateSync();
    assert.ok(shortErr.errors.title, 'Title < 2 chars should fail');

    // Level enum validation
    const invalidLevelDoc = new LearningPath({
      title: 'Valid Path',
      description: 'Valid path description',
      level: 'Expert',
    });
    const levelErr = invalidLevelDoc.validateSync();
    assert.ok(levelErr.errors.level, 'Level "Expert" is not in enum and should fail');

    // Estimated hours validation
    const negativeHoursDoc = new LearningPath({
      title: 'Valid Path',
      description: 'Valid description',
      estimatedHours: 0,
    });
    const hoursErr = negativeHoursDoc.validateSync();
    assert.ok(hoursErr.errors.estimatedHours, 'Estimated hours < 1 should fail');

    // Valid path with pre-validate slug generation
    const validPath = new LearningPath({
      title: 'Advanced TypeScript & Node',
      description: 'Comprehensive course on TS',
    });
    await validPath.validate();
    assert.equal(validPath.slug, 'advanced-typescript-node');
    assert.equal(validPath.level, 'Beginner'); // default
    assert.equal(validPath.category, 'Web Development'); // default
    assert.equal(validPath.published, true); // default
  });

  await t.test('2. Module Model Validations', async () => {
    const emptyDoc = new Module({});
    const err = emptyDoc.validateSync();
    assert.ok(err.errors.learningPath, 'Parent learningPath should be required');
    assert.ok(err.errors.title, 'Module title should be required');
    assert.ok(err.errors.description, 'Module description should be required');

    const fakeId = new mongoose.Types.ObjectId();
    const validModule = new Module({
      learningPath: fakeId,
      title: 'Introduction to Node.js Core',
      description: 'Learn event loop and streams',
    });
    await validModule.validate();
    assert.equal(validModule.slug, 'introduction-to-node-js-core');
    assert.equal(validModule.duration, '2 hours');
    assert.equal(validModule.order, 1);
  });

  await t.test('3. Section Model Validations', async () => {
    const emptyDoc = new Section({});
    const err = emptyDoc.validateSync();
    assert.ok(err.errors.module, 'Parent module reference should be required');
    assert.ok(err.errors.title, 'Section title should be required');
    assert.ok(err.errors.description, 'Section description should be required');

    const fakeId = new mongoose.Types.ObjectId();
    const validSection = new Section({
      module: fakeId,
      title: 'Buffers and Streams',
      description: 'Detailed section on memory buffers',
    });
    await validSection.validate();
    assert.equal(validSection.slug, 'buffers-and-streams');
    assert.equal(validSection.duration, '45 mins');
    assert.equal(validSection.order, 1);
  });

  await t.test('4. Topic Model Validations', async () => {
    const emptyDoc = new Topic({});
    const err = emptyDoc.validateSync();
    assert.ok(err.errors.section, 'Parent section reference should be required');
    assert.ok(err.errors.title, 'Topic title should be required');
    assert.ok(err.errors.description, 'Topic description should be required');

    const fakeId = new mongoose.Types.ObjectId();
    const validTopic = new Topic({
      section: fakeId,
      title: 'Stream Pipelines',
      description: 'How to use pipeline() to safely chain streams',
      codeExamples: [
        {
          title: 'Pipeline example',
          language: 'javascript',
          code: 'stream.pipeline(source, transform, dest, (err) => {});',
        },
      ],
      keyPoints: ['Avoid memory leaks', 'Handle error callbacks'],
    });
    await validTopic.validate();
    assert.equal(validTopic.slug, 'stream-pipelines');
    assert.equal(validTopic.duration, '15 mins');
    assert.equal(validTopic.codeExamples.length, 1);
    assert.equal(validTopic.keyPoints.length, 2);
  });

  await t.test('5. Note Model Validations', async () => {
    const emptyDoc = new Note({});
    const err = emptyDoc.validateSync();
    assert.ok(err.errors.topic, 'Parent topic should be required');
    assert.ok(err.errors.title, 'Title should be required');
    assert.ok(err.errors.content, 'Content should be required');

    const fakeId = new mongoose.Types.ObjectId();
    const validNote = new Note({
      topic: fakeId,
      title: 'Deep Dive: Event Loop Phases',
      content: '# Microtasks vs Macrotasks\nDetailed guide...',
    });
    await validNote.validate();
    assert.equal(validNote.slug, 'deep-dive-event-loop-phases');
    assert.equal(validNote.readingTime, '5 mins');
    assert.equal(validNote.published, true);
  });

  await t.test('6. Resource Model Validations & URL Verification', async () => {
    const emptyDoc = new Resource({});
    const err = emptyDoc.validateSync();
    assert.ok(err.errors.topic, 'Parent topic should be required');
    assert.ok(err.errors.title, 'Title should be required');
    assert.ok(err.errors.url, 'URL should be required');

    const fakeId = new mongoose.Types.ObjectId();

    // Invalid URL formats
    const badUrlDoc = new Resource({
      topic: fakeId,
      title: 'Invalid URL Link',
      url: 'ftp://not-http.org',
    });
    const badUrlErr = badUrlDoc.validateSync();
    assert.ok(badUrlErr.errors.url, 'ftp:// URL should fail regex validation');

    const malformedUrlDoc = new Resource({
      topic: fakeId,
      title: 'Malformed URL Link',
      url: 'just-some-text',
    });
    const malformedErr = malformedUrlDoc.validateSync();
    assert.ok(malformedErr.errors.url, 'Plain text URL should fail validation');

    // Invalid Resource Type
    const badTypeDoc = new Resource({
      topic: fakeId,
      title: 'Bad Type Resource',
      url: 'https://developer.mozilla.org',
      type: 'PODCAST',
    });
    const badTypeErr = badTypeDoc.validateSync();
    assert.ok(badTypeErr.errors.type, 'Type "PODCAST" should fail enum validation');

    // Valid resource
    const validResource = new Resource({
      topic: fakeId,
      title: 'MDN Web Docs: Streams API',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/Streams_API',
      type: 'DOCUMENTATION',
    });
    const validErr = validResource.validateSync();
    assert.equal(validErr, undefined);
    assert.equal(validResource.isFree, true);
    assert.equal(validResource.published, true);
  });

  await t.test('7. Playground Model Validations', async () => {
    const emptyDoc = new Playground({});
    const err = emptyDoc.validateSync();
    assert.ok(err.errors.topic, 'Topic reference should be required');
    assert.ok(err.errors.title, 'Playground title should be required');

    const fakeId = new mongoose.Types.ObjectId();

    // Invalid language
    const badLangDoc = new Playground({
      topic: fakeId,
      title: 'Ruby Challenge',
      language: 'ruby',
    });
    const badLangErr = badLangDoc.validateSync();
    assert.ok(badLangErr.errors.language, 'Language "ruby" should fail enum check');

    // Invalid difficulty
    const badDiffDoc = new Playground({
      topic: fakeId,
      title: 'Challenging Playground',
      difficulty: 'HARDCORE',
    });
    const badDiffErr = badDiffDoc.validateSync();
    assert.ok(badDiffErr.errors.difficulty, 'Difficulty "HARDCORE" should fail enum check');

    // Valid playground
    const validPlayground = new Playground({
      topic: fakeId,
      title: 'Implement Array Filter',
      difficulty: 'INTERMEDIATE',
      language: 'javascript',
    });
    const validErr = validPlayground.validateSync();
    assert.equal(validErr, undefined);
    assert.ok(validPlayground.initialCode.includes('console.log'));
  });

  await t.test('8. Quiz Model Validations & Question Constraints', async () => {
    const emptyDoc = new Quiz({});
    const err = emptyDoc.validateSync();
    assert.ok(err.errors.topic, 'Topic reference should be required');
    assert.ok(err.errors.title, 'Quiz title should be required');

    const fakeId = new mongoose.Types.ObjectId();

    // Passing score out of range
    const badScoreDoc = new Quiz({
      topic: fakeId,
      title: 'Score out of range quiz',
      passingScore: 120,
    });
    const badScoreErr = badScoreDoc.validateSync();
    assert.ok(badScoreErr.errors.passingScore, 'Passing score > 100 should fail');

    // Question options must have at least 2 options
    const singleOptionQuiz = new Quiz({
      topic: fakeId,
      title: 'One option quiz',
      questions: [
        {
          question: 'What is 2 + 2?',
          options: ['4'],
          correctAnswer: 0,
        },
      ],
    });
    const singleOptErr = singleOptionQuiz.validateSync();
    assert.ok(singleOptErr.errors['questions.0.options'], 'Questions with < 2 options must fail');

    // Valid Quiz
    const validQuiz = new Quiz({
      topic: fakeId,
      title: 'Event Loop Mastery Quiz',
      questions: [
        {
          question: 'Which queue has higher priority?',
          options: ['Microtask queue', 'Macrotask queue'],
          correctAnswer: 0,
          explanation: 'Microtasks are processed before the next macrotask.',
        },
      ],
    });
    const validErr = validQuiz.validateSync();
    assert.equal(validErr, undefined);
    assert.equal(validQuiz.passingScore, 70);
    assert.equal(validQuiz.timeLimitMinutes, 10);
  });

  await t.test('9. QuizAttempt Model Validations & Score Math', async () => {
    const emptyDoc = new QuizAttempt({});
    const err = emptyDoc.validateSync();
    assert.ok(err.errors.user, 'User is required');
    assert.ok(err.errors.quiz, 'Quiz is required');
    assert.ok(err.errors.attemptNumber, 'Attempt number is required');
    assert.ok(err.errors.score, 'Score is required');
    assert.ok(err.errors.totalQuestions, 'Total questions is required');
    assert.ok(err.errors.percentage, 'Percentage is required');
    assert.ok(err.errors.passed, 'Passed status is required');

    const fakeUserId = new mongoose.Types.ObjectId();
    const fakeQuizId = new mongoose.Types.ObjectId();
    const fakeQuestionId = new mongoose.Types.ObjectId();

    // Valid attempt - passed
    const passedAttempt = new QuizAttempt({
      user: fakeUserId,
      quiz: fakeQuizId,
      attemptNumber: 1,
      score: 8,
      totalQuestions: 10,
      percentage: (8 / 10) * 100, // 80%
      passingScore: 70,
      passed: 80 >= 70,
      timeSpentSeconds: 120,
      answers: [
        {
          questionId: fakeQuestionId,
          question: 'Sample question',
          options: ['A', 'B'],
          selectedOption: 0,
          selectedOptionText: 'A',
          correctAnswer: 0,
          correctAnswerText: 'A',
          isCorrect: true,
        },
      ],
    });
    const passedErr = passedAttempt.validateSync();
    assert.equal(passedErr, undefined);
    assert.equal(passedAttempt.passed, true);
    assert.equal(passedAttempt.percentage, 80);

    // Valid attempt - failed (< 70%)
    const failedAttempt = new QuizAttempt({
      user: fakeUserId,
      quiz: fakeQuizId,
      attemptNumber: 2,
      score: 5,
      totalQuestions: 10,
      percentage: 50,
      passingScore: 70,
      passed: 50 >= 70,
    });
    const failedErr = failedAttempt.validateSync();
    assert.equal(failedErr, undefined);
    assert.equal(failedAttempt.passed, false);
  });

  await t.test('10. InterviewQuestion Model Validations', async () => {
    const emptyDoc = new InterviewQuestion({});
    const err = emptyDoc.validateSync();
    assert.ok(err.errors.topic, 'Topic reference is required');
    assert.ok(err.errors.question, 'Question is required');
    assert.ok(err.errors.answer, 'Answer is required');

    const fakeId = new mongoose.Types.ObjectId();

    // Short question prompt
    const shortQ = new InterviewQuestion({
      topic: fakeId,
      question: 'Why?',
      answer: 'Because of JavaScript architecture.',
    });
    const shortErr = shortQ.validateSync();
    assert.ok(shortErr.errors.question, 'Question < 5 chars must fail');

    // Invalid frequency
    const badFreq = new InterviewQuestion({
      topic: fakeId,
      question: 'What is prototypal inheritance?',
      answer: 'Objects inheriting from objects.',
      frequency: 'ALWAYS',
    });
    const badFreqErr = badFreq.validateSync();
    assert.ok(badFreqErr.errors.frequency, 'Frequency "ALWAYS" should fail enum check');

    // Valid interview question
    const validIQ = new InterviewQuestion({
      topic: fakeId,
      question: 'Explain the difference between call, apply, and bind.',
      answer: 'Call and apply invoke immediately; bind returns a new function with bound this.',
      difficulty: 'INTERMEDIATE',
      frequency: 'FREQUENT',
      tags: ['javascript', 'functions', 'this'],
    });
    const validErr = validIQ.validateSync();
    assert.equal(validErr, undefined);
    assert.equal(validIQ.published, true);
  });

  await t.test('11. Progress Model Validations', async () => {
    const emptyDoc = new Progress({});
    const err = emptyDoc.validateSync();
    assert.ok(err.errors.user, 'User reference is required');
    assert.ok(err.errors.topic, 'Topic reference is required');

    const fakeUserId = new mongoose.Types.ObjectId();
    const fakeTopicId = new mongoose.Types.ObjectId();

    const validProgress = new Progress({
      user: fakeUserId,
      topic: fakeTopicId,
      completedKeyPoints: [0, 1],
      isCompleted: false,
    });
    const validErr = validProgress.validateSync();
    assert.equal(validErr, undefined);
    assert.equal(validProgress.isCompleted, false);
    assert.equal(validProgress.completedKeyPoints.length, 2);
    assert.deepEqual(validProgress.completedNotes, []);
    assert.deepEqual(validProgress.completedQuizzes, []);
  });

  await t.test('12. User Model Validations & Role Enums', async () => {
    const emptyDoc = new User({});
    const err = emptyDoc.validateSync();
    assert.ok(err.errors.name, 'Name is required');
    assert.ok(err.errors.email, 'Email is required');
    assert.ok(err.errors.password, 'Password is required');

    // Invalid email format
    const badEmailUser = new User({
      name: 'John Doe',
      email: 'not-an-email-address',
      password: 'securepassword123',
    });
    const badEmailErr = badEmailUser.validateSync();
    assert.ok(badEmailErr.errors.email, 'Invalid email must fail regex check');

    // Short password (< 6 chars)
    const shortPassUser = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: '123',
    });
    const shortPassErr = shortPassUser.validateSync();
    assert.ok(shortPassErr.errors.password, 'Password < 6 chars must fail');

    // Invalid role enum
    const badRoleUser = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'securepassword123',
      role: 'SUPERADMIN',
    });
    const badRoleErr = badRoleUser.validateSync();
    assert.ok(badRoleErr.errors.role, 'Role "SUPERADMIN" must fail enum check');

    // Valid standard user
    const validUser = new User({
      name: 'Alice Learner',
      email: 'alice@example.com',
      password: 'securepassword123',
    });
    const validErr = validUser.validateSync();
    assert.equal(validErr, undefined);
    assert.equal(validUser.role, 'USER'); // default role
  });

});
