import test from 'node:test';
import assert from 'node:assert/strict';

import { codeExecutionService } from '../../src/services/codeExecutionService.js';
import { ApiError } from '../../src/utils/apiError.js';
import { sendSuccess, sendError } from '../../src/utils/apiResponse.js';
import { slugify } from '../../src/models/LearningPath.js';

test('--- Tier 1 Unit Tests: Services, Utilities & Errors ---', async (t) => {

  await t.test('1. Slugify Utility Function', () => {
    assert.equal(slugify('Hello World!'), 'hello-world');
    assert.equal(slugify('   JavaScript: The Good Parts --- '), 'javascript-the-good-parts');
    assert.equal(slugify('React & Redux Toolkit 2026'), 'react-redux-toolkit-2026');
    assert.equal(slugify('Node.js & Express: Modern Guide!'), 'node-js-express-modern-guide');
  });

  await t.test('2. ApiError Custom Class', () => {
    const defaultErr = new ApiError('Something broke');
    assert.equal(defaultErr.message, 'Something broke');
    assert.equal(defaultErr.statusCode, 500);
    assert.deepEqual(defaultErr.errors, []);
    assert.equal(defaultErr.isOperational, true);

    const customErr = new ApiError('Validation Failed', 400, ['Email is invalid', 'Password too short']);
    assert.equal(customErr.message, 'Validation Failed');
    assert.equal(customErr.statusCode, 400);
    assert.equal(customErr.errors.length, 2);
    assert.equal(customErr.isOperational, true);
    assert.ok(customErr.stack);
  });

  await t.test('3. ApiResponse Helpers (sendSuccess & sendError)', () => {
    // Mock res object
    const mockRes = () => {
      const res = {
        statusCode: 200,
        body: null,
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(data) {
          this.body = data;
          return this;
        },
      };
      return res;
    };

    // Test sendSuccess
    const res1 = mockRes();
    sendSuccess(res1, 'Items fetched successfully', [{ id: 1 }, { id: 2 }], 200);
    assert.equal(res1.statusCode, 200);
    assert.equal(res1.body.success, true);
    assert.equal(res1.body.message, 'Items fetched successfully');
    assert.equal(res1.body.data.length, 2);

    // Test sendError
    const res2 = mockRes();
    sendError(res2, 'Resource not found', null, 404);
    assert.equal(res2.statusCode, 404);
    assert.equal(res2.body.success, false);
    assert.equal(res2.body.message, 'Resource not found');
  });

  await t.test('4. Code Execution Service - Validation Guards', async () => {
    // Empty code
    const emptyRes = await codeExecutionService.executeCode({ code: '' });
    assert.equal(emptyRes.success, false);
    assert.equal(emptyRes.error, 'No code provided for execution');

    // Non-string code
    const nonStringRes = await codeExecutionService.executeCode({ code: null });
    assert.equal(nonStringRes.success, false);

    // Unsupported language
    const langRes = await codeExecutionService.executeCode({ code: 'puts "hello"', language: 'ruby' });
    assert.equal(langRes.success, false);
    assert.ok(langRes.error.includes('not currently supported'));

    // Huge code payload exceeding 50KB
    const hugeCode = 'a'.repeat(60 * 1024);
    const hugeRes = await codeExecutionService.executeCode({ code: hugeCode });
    assert.equal(hugeRes.success, false);
    assert.ok(hugeRes.error.includes('Code exceeds maximum size limit'));
  });

  await t.test('5. Code Execution Service - JavaScript Execution', async () => {
    // Valid simple execution
    const validRun = await codeExecutionService.executeCode({
      code: `
        console.log("Tier 1 Runner Test");
        const a = 10;
        const b = 25;
        a + b;
      `,
      language: 'javascript',
    });

    assert.equal(validRun.success, true);
    assert.ok(validRun.logs.some((l) => l.message && l.message.includes('Tier 1 Runner Test')));
    assert.equal(validRun.result, '35');
    assert.equal(validRun.error, null);
    assert.ok(validRun.executionTimeMs >= 0);

    // Runtime error capture
    const errorRun = await codeExecutionService.executeCode({
      code: `
        console.log("Before error");
        throw new Error("Simulated runtime error in runner");
      `,
      language: 'javascript',
    });
    assert.equal(errorRun.success, false);
    assert.ok(errorRun.error.includes('Simulated runtime error in runner'));
  });

  await t.test('6. Code Execution Service - Timeout Protection', async () => {
    // Infinite loop should be safely aborted by timeout
    const timeoutRun = await codeExecutionService.executeCode({
      code: `
        while (true) {
          // Infinite loop
        }
      `,
      language: 'javascript',
      timeoutMs: 800,
    });

    assert.equal(timeoutRun.success, false);
    assert.ok(timeoutRun.error.includes('Execution Timed Out') || timeoutRun.error.includes('timed out'));
  });

});
