import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Topic } from '../src/models/Topic.js';
import { InterviewQuestion } from '../src/models/InterviewQuestion.js';

export const initialInterviewQuestions = [
  {
    topicSlug: 'let',
    question: 'What is the Temporal Dead Zone (TDZ) in JavaScript and why was it introduced with let and const?',
    answer: `The **Temporal Dead Zone (TDZ)** is the time span between the start of an execution block and the line where a \`let\` or \`const\` variable is declared and initialized.

### Key Characteristics:
1. **Hoisting without Initialization**: Both \`let\` and \`const\` are hoisted to the top of their enclosing block, but unlike \`var\` (which is initialized to \`undefined\`), they remain in an *uninitialized* state.
2. **ReferenceError**: Any attempt to read or write to the variable while in its TDZ throws a \`ReferenceError\`.
3. **Temporal, not Spatial**: The TDZ is based on *execution order in time*, not the physical lines of code. If a function accessing the variable is called after the declaration line, it succeeds even if defined above it.

### Why was it introduced?
- **Bug Prevention**: Prevents accessing variables before they have meaningful values, catching accidental early reads.
- **Const Invariance**: Enforces that \`const\` is never read in an unassigned state before receiving its permanent value.`,
    codeSnippet: `// 1. Spatial vs Temporal demonstration
function testTDZ() {
  // TDZ for myVar begins here
  const readVar = () => console.log(myVar); // Defined before, but called after!

  // console.log(myVar); // ❌ Throws ReferenceError: Cannot access 'myVar' before initialization

  let myVar = 'Initialized!'; // TDZ ends here
  readVar(); // ✅ Outputs: "Initialized!"
}
testTDZ();`,
    difficulty: 'INTERMEDIATE',
    frequency: 'FREQUENT',
    order: 1,
    tags: ['scope', 'tdz', 'hoisting', 'es6'],
    published: true,
  },
  {
    topicSlug: 'let',
    question: 'How does let solve the classic closure bug in for-loops with asynchronous callbacks?',
    answer: `In ES5 with \`var\`, a loop variable has function scope. Across all loop iterations, a **single shared variable binding** is modified. When asynchronous callbacks (like \`setTimeout\`) execute after loop completion, they all reference the final mutated value.

### How \`let\` Solves This:
- The ECMAScript specification mandates that in a \`for(let i = ...)\` loop, a **new lexical scope and distinct variable binding is created for every single iteration**.
- When a closure is created inside the loop body, it captures that specific iteration's unique binding of \`i\`.
- This eliminates the need for an IIFE (Immediately Invoked Function Expression) workaround.`,
    codeSnippet: `// Problem with 'var':
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log('var:', i), 10); // Prints: 3, 3, 3
}

// Solution with 'let':
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log('let:', j), 10); // Prints: 0, 1, 2
}`,
    difficulty: 'INTERMEDIATE',
    frequency: 'FREQUENT',
    order: 2,
    tags: ['closures', 'loops', 'event-loop', 'es6'],
    published: true,
  },
  {
    topicSlug: 'const',
    question: 'Does declaring an object with const make its properties immutable? How do you create truly immutable data in JavaScript?',
    answer: `No. \`const\` creates an **immutable variable binding**, meaning the variable identifier cannot be reassigned to point to a different memory reference. However, the *value itself* (if an object, array, or function) remains **mutable**.

### How to Achieve True Immutability:
1. **Object.freeze(obj)**:
   - Makes an object's immediate own properties read-only and non-configurable.
   - Note: \`Object.freeze\` is **shallow** by default. Nested objects can still be mutated unless recursively frozen.
2. **Deep Freeze Utility**:
   - Recursively traverses nested object properties and applies \`Object.freeze\` on each nested record.
3. **Immutable Libraries / Records**:
   - Using libraries like Immutable.js or Immer, or upcoming ECMAScript Records & Tuples.`,
    codeSnippet: `// const only protects the binding reference:
const user = { name: 'Alice', settings: { theme: 'dark' } };
user.name = 'Bob'; // ✅ Allowed!
// user = { name: 'Charlie' }; // ❌ TypeError: Assignment to constant variable

// Shallow Freeze:
Object.freeze(user);
user.name = 'Daniel'; // Fails silently (or throws in strict mode)
user.settings.theme = 'light'; // ⚠️ Still mutated because freeze is shallow!

// Deep Freeze Pattern:
function deepFreeze(obj) {
  Object.keys(obj).forEach(prop => {
    if (typeof obj[prop] === 'object' && obj[prop] !== null) {
      deepFreeze(obj[prop]);
    }
  });
  return Object.freeze(obj);
}
deepFreeze(user);
// user.settings.theme = 'neon'; // ❌ Now fully immutable`,
    difficulty: 'BEGINNER',
    frequency: 'FREQUENT',
    order: 1,
    tags: ['const', 'immutability', 'objects', 'freeze'],
    published: true,
  },
  {
    topicSlug: 'var',
    question: 'Explain variable hoisting in JavaScript. How does variable hoisting differ from function declaration hoisting?',
    answer: `**Hoisting** is the JavaScript engine's behavior during the compilation/creation phase where variable and function declarations are recorded into memory before code execution starts.

### Differences Between Variable and Function Hoisting:
1. **var declarations**:
   - The *declaration* is hoisted to the top of its enclosing function or global scope and immediately initialized to \`undefined\`.
   - The *assignment* remains in place. Accessing the variable prior to assignment evaluates to \`undefined\`.
2. **Function Declarations**:
   - Both the function identifier and the complete function body are hoisted together.
   - The function can be invoked anywhere in the enclosing scope, even before its textual definition.
3. **Function Expressions**:
   - If assigned to \`var\`, only the variable identifier is hoisted (as \`undefined\`). Calling it before the assignment throws \`TypeError: myFunc is not a function\`.`,
    codeSnippet: `// 1. Function declaration is fully hoisted:
sayHello(); // ✅ "Hello!"
function sayHello() {
  console.log("Hello!");
}

// 2. var variable declaration is hoisted with 'undefined':
console.log(score); // ✅ undefined (no ReferenceError)
var score = 100;
console.log(score); // 100

// 3. var function expression fails if called early:
// greet(); // ❌ TypeError: greet is not a function
var greet = function() {
  console.log("Welcome!");
};`,
    difficulty: 'INTERMEDIATE',
    frequency: 'COMMON',
    order: 1,
    tags: ['hoisting', 'var', 'functions', 'execution-context'],
    published: true,
  },
];

export async function seedInterviewQuestions(exitOnDone = true) {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/learning_hub';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    console.log('[Seed Interview Questions] Seeding initial technical interview questions...');

    for (const item of initialInterviewQuestions) {
      const topic = await Topic.findOne({ slug: item.topicSlug });
      if (!topic) {
        console.warn(`[Seed Interview Questions] Topic '${item.topicSlug}' not found. Skipping...`);
        continue;
      }

      await InterviewQuestion.findOneAndUpdate(
        { topic: topic._id, question: item.question },
        {
          topic: topic._id,
          question: item.question,
          answer: item.answer,
          codeSnippet: item.codeSnippet,
          difficulty: item.difficulty,
          frequency: item.frequency,
          order: item.order,
          tags: item.tags,
          published: item.published,
        },
        { upsert: true, new: true }
      );

      console.log(`[Seed Interview Questions] Question seeded for '${item.topicSlug}': "${item.question.slice(0, 40)}..."`);
    }

    const total = await InterviewQuestion.countDocuments();
    console.log(`[Seed Interview Questions] Successfully seeded. Total interview questions in DB: ${total}`);

    if (exitOnDone) {
      await mongoose.disconnect();
      process.exit(0);
    }
  } catch (err) {
    console.error('[Seed Interview Questions] Error:', err);
    if (exitOnDone) {
      process.exit(1);
    }
    throw err;
  }
}

if (process.argv[1] && process.argv[1].endsWith('seedInterviewQuestions.js')) {
  seedInterviewQuestions(true);
}
