import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RUNNER_SCRIPT_PATH = path.resolve(__dirname, '../runners/codeRunnerProcess.js');

const MAX_OUTPUT_SIZE_BYTES = 50 * 1024; // 50 KB output limit
const DEFAULT_TIMEOUT_MS = 2000; // 2.0 second hard limit

export const codeExecutionService = {
  /**
   * Executes code safely within an isolated child process with timeout protection.
   * @param {Object} options
   * @param {string} options.code - Source code to execute
   * @param {string} [options.language='javascript'] - Language
   * @param {number} [options.timeoutMs=2000] - Hard execution timeout
   * @returns {Promise<{success: boolean, logs: Array, result: string|null, executionTimeMs: number, error: string|null}>}
   */
  executeCode: async ({ code = '', language = 'javascript', timeoutMs = DEFAULT_TIMEOUT_MS }) => {
    const startTime = Date.now();

    if (!code || typeof code !== 'string') {
      return {
        success: false,
        logs: [],
        result: null,
        executionTimeMs: 0,
        error: 'No code provided for execution',
      };
    }

    if (code.length > MAX_OUTPUT_SIZE_BYTES) {
      return {
        success: false,
        logs: [],
        result: null,
        executionTimeMs: 0,
        error: 'Code exceeds maximum size limit (50 KB)',
      };
    }

    // Only JavaScript is supported by the Node.js runner
    if (language && language.toLowerCase() !== 'javascript') {
      return {
        success: false,
        logs: [],
        result: null,
        executionTimeMs: 0,
        error: `Language '${language}' is not currently supported for server execution. Please select JavaScript.`,
      };
    }

    return new Promise((resolve) => {
      let stdoutData = '';
      let stderrData = '';
      let isTimedOut = false;

      // Spawn runner in a completely scrubbed, isolated environment
      const child = spawn(process.execPath, [RUNNER_SCRIPT_PATH], {
        env: {}, // No credentials, tokens, or environment access
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      // Hard timeout kill
      const timer = setTimeout(() => {
        isTimedOut = true;
        try {
          child.kill('SIGKILL');
        } catch {
          // ignore if already exited
        }
      }, timeoutMs);

      // Write payload to runner STDIN and close stream
      try {
        child.stdin.write(
          JSON.stringify({
            code,
            timeoutMs: timeoutMs - 500, // internal VM timeout slightly lower than hard kill
          })
        );
        child.stdin.end();
      } catch (err) {
        clearTimeout(timer);
        return resolve({
          success: false,
          logs: [],
          result: null,
          executionTimeMs: Date.now() - startTime,
          error: `Failed to write code to execution process: ${err.message}`,
        });
      }

      child.stdout.on('data', (chunk) => {
        if (stdoutData.length < MAX_OUTPUT_SIZE_BYTES) {
          stdoutData += chunk.toString();
        }
      });

      child.stderr.on('data', (chunk) => {
        if (stderrData.length < MAX_OUTPUT_SIZE_BYTES) {
          stderrData += chunk.toString();
        }
      });

      child.on('close', (exitCode) => {
        clearTimeout(timer);
        const executionTimeMs = Date.now() - startTime;

        if (isTimedOut) {
          return resolve({
            success: false,
            logs: [],
            result: null,
            executionTimeMs: timeoutMs,
            error: `Execution Timed Out (Maximum allowed: ${timeoutMs}ms). Check for infinite loops or heavy operations.`,
          });
        }

        if (!stdoutData.trim()) {
          return resolve({
            success: false,
            logs: [],
            result: null,
            executionTimeMs,
            error: stderrData.trim() || 'Execution process closed without returning output',
          });
        }

        try {
          const parsedResult = JSON.parse(stdoutData);
          return resolve({
            success: parsedResult.success,
            logs: parsedResult.logs || [],
            result: parsedResult.result,
            executionTimeMs: parsedResult.executionTimeMs || executionTimeMs,
            error: parsedResult.error || null,
          });
        } catch (parseErr) {
          return resolve({
            success: false,
            logs: [],
            result: null,
            executionTimeMs,
            error: `Failed to parse execution result: ${parseErr.message}`,
          });
        }
      });

      child.on('error', (procErr) => {
        clearTimeout(timer);
        return resolve({
          success: false,
          logs: [],
          result: null,
          executionTimeMs: Date.now() - startTime,
          error: `Execution process error: ${procErr.message}`,
        });
      });
    });
  },
};
