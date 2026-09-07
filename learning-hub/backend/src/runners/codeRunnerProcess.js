/**
 * codeRunnerProcess.js
 * Isolated runner executed as a separate Node.js child process.
 * Reads code from STDIN and executes it in a sandboxed vm.createContext.
 * Communicates execution results and captured console outputs via STDOUT JSON.
 */

import vm from 'node:vm';

function getCircularReplacer() {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular Reference]';
      }
      seen.add(value);
    }
    return value;
  };
}

function formatArg(arg) {
  if (arg === undefined) return 'undefined';
  if (arg === null) return 'null';
  if (typeof arg === 'string') return arg;
  if (typeof arg === 'function') return `[Function: ${arg.name || 'anonymous'}]`;
  if (typeof arg === 'symbol') return arg.toString();
  if (arg instanceof Error) {
    return `${arg.name}: ${arg.message}${arg.stack ? '\n' + arg.stack.split('\n').slice(1, 4).join('\n') : ''}`;
  }
  try {
    return JSON.stringify(arg, getCircularReplacer(), 2);
  } catch {
    return String(arg);
  }
}

// Read payload from STDIN
let inputData = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  inputData += chunk;
});

process.stdin.on('end', () => {
  const startTime = Date.now();
  const logs = [];

  let internalTimeoutMs = 1500;
  try {
    const payload = inputData ? JSON.parse(inputData) : {};
    const code = payload.code || '';
    internalTimeoutMs = payload.timeoutMs || 1500;

    const safeConsole = {
      log: (...args) => {
        logs.push({
          type: 'log',
          message: args.map(formatArg).join(' '),
          timestamp: Date.now(),
        });
      },
      info: (...args) => {
        logs.push({
          type: 'info',
          message: args.map(formatArg).join(' '),
          timestamp: Date.now(),
        });
      },
      warn: (...args) => {
        logs.push({
          type: 'warn',
          message: args.map(formatArg).join(' '),
          timestamp: Date.now(),
        });
      },
      error: (...args) => {
        logs.push({
          type: 'error',
          message: args.map(formatArg).join(' '),
          timestamp: Date.now(),
        });
      },
    };

    // Isolated sandbox without access to host process, require, or file system
    const sandbox = {
      console: safeConsole,
      Array,
      Boolean,
      Date,
      Error,
      EvalError: Error,
      RangeError,
      ReferenceError,
      SyntaxError,
      TypeError,
      URIError,
      Function,
      JSON,
      Map,
      Math,
      Number,
      Object,
      Promise,
      RegExp,
      Set,
      String,
      Symbol,
      WeakMap,
      WeakSet,
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
      encodeURI,
      encodeURIComponent,
      decodeURI,
      decodeURIComponent,
    };

    // Make globalThis reference the sandbox itself
    sandbox.globalThis = sandbox;
    sandbox.window = sandbox;

    const context = vm.createContext(sandbox, {
      codeGeneration: {
        strings: true,
        wasm: false,
      },
    });

    const executionResult = vm.runInContext(code, context, {
      timeout: internalTimeoutMs,
      displayErrors: true,
    });

    const executionTimeMs = Date.now() - startTime;

    const output = {
      success: true,
      logs,
      result: executionResult !== undefined ? formatArg(executionResult) : undefined,
      executionTimeMs,
      error: null,
    };

    process.stdout.write(JSON.stringify(output));
    process.exit(0);
  } catch (err) {
    const executionTimeMs = Date.now() - startTime;
    let errorMessage = `${err.name}: ${err.message}`;
    if (err.message && err.message.toLowerCase().includes('timed out')) {
      errorMessage = `Execution Timed Out (Maximum allowed: ${internalTimeoutMs}ms). Check for infinite loops or heavy operations.`;
    }
    const output = {
      success: false,
      logs,
      result: null,
      executionTimeMs,
      error: errorMessage,
    };

    process.stdout.write(JSON.stringify(output));
    process.exit(0);
  }
});
