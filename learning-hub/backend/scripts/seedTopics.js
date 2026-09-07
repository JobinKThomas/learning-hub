import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Section } from '../src/models/Section.js';
import { Topic } from '../src/models/Topic.js';

const initialTopics = [
  // Topics for Section 'variables'
  {
    sectionSlug: 'variables',
    title: 'var',
    slug: 'var',
    summary: 'Function-scoped variable declaration with undefined hoisting',
    description: 'The var statement declares function-scoped or globally-scoped variables, optionally initializing each to a value.',
    duration: '15 mins',
    order: 1,
    keyPoints: [
      'Function-scoped (ignores block boundaries {})',
      'Can be re-declared and updated anywhere in its scope',
      'Hoisted to the top of its scope and initialized with undefined',
      'Creates a property on the global window object in browsers',
    ],
    codeExamples: [
      {
        title: 'Function Scoping',
        language: 'javascript',
        code: `function runLoop() {\n  for (var i = 0; i < 3; i++) {\n    // do something\n  }\n  console.log("i after loop:", i); // 3 (leaks outside loop!)\n}\nrunLoop();`,
        explanation: 'var is scoped to the enclosing function, so loop counter i remains accessible after the loop finishes.',
      },
      {
        title: 'Hoisting to Undefined',
        language: 'javascript',
        code: `console.log(city); // undefined (declaration hoisted!)\nvar city = "San Francisco";\nconsole.log(city); // "San Francisco"`,
        explanation: 'The variable declaration is hoisted to the top and initialized with undefined, avoiding a ReferenceError.',
      },
    ],
    content: `# The 'var' Keyword in JavaScript

Before ES6 (ECMAScript 2015), \`var\` was the only statement available for declaring variables in JavaScript.

## Scoping Rules
Variables declared with \`var\` are scoped to their nearest enclosing function. If declared outside of any function, they belong to the global scope.

\`\`\`javascript
function checkScope() {
  if (true) {
    var greeting = "Hello";
  }
  console.log(greeting); // "Hello"
}
\`\`\`

## Hoisting Mechanics
When JavaScript code is compiled, variable declarations using \`var\` are moved to the top of their execution context and initialized with the value \`undefined\`.

## Modern Best Practice
In modern JavaScript applications, prefer \`const\` by default and \`let\` when mutation is needed. Avoid using \`var\` in new codebases.
`,
  },
  {
    sectionSlug: 'variables',
    title: 'let',
    slug: 'let',
    summary: 'Block-scoped mutable local variable declaration with TDZ',
    description: 'The let statement declares a block-scoped local variable, optionally initializing it to a value.',
    duration: '15 mins',
    order: 2,
    keyPoints: [
      'Block-scoped (strictly contained within { ... })',
      'Can be updated/reassigned, but CANNOT be re-declared in the same block',
      'Hoisted into the Temporal Dead Zone (TDZ) until evaluation',
      'Does not create global properties on the window object',
    ],
    codeExamples: [
      {
        title: 'Block Scoping',
        language: 'javascript',
        code: `if (true) {\n  let secretCode = "XYZ-123";\n  console.log(secretCode); // "XYZ-123"\n}\n// console.log(secretCode); // ReferenceError: secretCode is not defined`,
        explanation: 'let variables are bound to the block in which they are declared and cease to exist outside that block.',
      },
      {
        title: 'Temporal Dead Zone (TDZ)',
        language: 'javascript',
        code: `// console.log(points); // ReferenceError: Cannot access 'points' before initialization\nlet points = 100;\nconsole.log(points); // 100`,
        explanation: 'Accessing let before its line of declaration throws a ReferenceError because the variable is in the Temporal Dead Zone.',
      },
    ],
    content: `# The 'let' Keyword in JavaScript

Introduced in ECMAScript 2015 (ES6), \`let\` solves the unintuitive scoping and hoisting issues of \`var\`.

## Block Scoping
A block in JavaScript is anything delimited by curly braces \`{ ... }\` — including \`if\` statements, \`for\` loops, and standalone blocks.

\`\`\`javascript
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Outputs: 0, 1, 2 (each iteration gets its own fresh lexical binding!)
\`\`\`

## Temporal Dead Zone (TDZ)
Unlike \`var\`, variables declared with \`let\` cannot be accessed before their declaration statement is executed. The region from the start of the block to the declaration is called the **Temporal Dead Zone**.
`,
  },
  {
    sectionSlug: 'variables',
    title: 'const',
    slug: 'const',
    summary: 'Block-scoped immutable binding declaration',
    description: 'The const statement declares block-scoped read-only named constants. The binding cannot be reassigned.',
    duration: '15 mins',
    order: 3,
    keyPoints: [
      'Block-scoped like let',
      'Must be initialized with a value at declaration time',
      'Variable identifier cannot be reassigned',
      'Object and array contents can still be mutated (binding is constant, not the value)',
    ],
    codeExamples: [
      {
        title: 'Constant Binding',
        language: 'javascript',
        code: `const API_URL = "https://api.example.com";\n// API_URL = "https://api.new.com"; // TypeError: Assignment to constant variable`,
        explanation: 'const prevents reassigning the variable identifier to any new value.',
      },
      {
        title: 'Object Mutation vs Reassignment',
        language: 'javascript',
        code: `const settings = { theme: "dark" };\nsettings.theme = "light"; // Valid property mutation!\nconsole.log(settings.theme); // "light"\n// settings = {}; // TypeError!`,
        explanation: 'const protects the memory reference, not the interior property values of an object or array.',
      },
    ],
    content: `# The 'const' Keyword in JavaScript

\`const\` declares an immutable binding to a value. It is the recommended keyword for the vast majority of variable declarations in modern JavaScript.

## Always Initialize
A \`const\` declaration without an initializer is a syntax error:

\`\`\`javascript
// const maxScore; // SyntaxError: Missing initializer in const declaration
const maxScore = 100; // Correct
\`\`\`

## Deep Immutability
If you need true immutability where object properties cannot be modified, use \`Object.freeze()\`:

\`\`\`javascript
const config = Object.freeze({ timeout: 5000 });
config.timeout = 10000; // Silently ignored or TypeError in strict mode!
\`\`\`
`,
  },

  // Topics for Section 'data-types'
  {
    sectionSlug: 'data-types',
    title: 'Primitive Types',
    slug: 'primitive-types',
    summary: 'Immutable data stored directly by value',
    description: 'Explore the 7 primitive types in JavaScript: string, number, bigint, boolean, undefined, symbol, and null.',
    duration: '20 mins',
    order: 1,
    keyPoints: [
      '7 primitive types: string, number, bigint, boolean, undefined, symbol, null',
      'Primitives are passed by value and immutable',
      'typeof null returns "object" (historical JavaScript quirk)',
    ],
    codeExamples: [
      {
        title: 'Copy by Value',
        language: 'javascript',
        code: `let a = 10;\nlet b = a;\nb = 20;\nconsole.log(a); // 10 (unaffected!)\nconsole.log(b); // 20`,
        explanation: 'Primitives are copied by value into a separate memory cell.',
      },
    ],
    content: `# Primitive Types in JavaScript\n\nJavaScript primitives are foundational values that are not objects and have no methods of their own (wrapper objects provide method access).`,
  },
  {
    sectionSlug: 'data-types',
    title: 'Reference Types',
    slug: 'reference-types',
    summary: 'Objects, Arrays, and Functions stored in heap memory',
    description: 'Master memory pointers, reference equality, and cloning complex nested structures.',
    duration: '25 mins',
    order: 2,
    keyPoints: [
      'Objects, Arrays, Functions, Sets, and Maps are reference types',
      'Stored in the heap and accessed via memory references (pointers)',
      'Equality checks (===) compare memory addresses, not property contents',
    ],
    codeExamples: [
      {
        title: 'Reference Sharing',
        language: 'javascript',
        code: `const obj1 = { val: 42 };\nconst obj2 = obj1;\nobj2.val = 99;\nconsole.log(obj1.val); // 99 (both point to same memory address!)`,
        explanation: 'Assigning an object copies the reference pointer, so mutations affect all references.',
      },
    ],
    content: `# Reference Types in JavaScript\n\nReference types represent non-primitive data structures stored in the heap.`,
  },
];

export async function seedTopics(disconnectAfter = false) {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/learning_hub';
  if (mongoose.connection.readyState === 0) {
    console.log(`[Seed Topics] Connecting to MongoDB: ${uri}`);
    await mongoose.connect(uri);
  }

  for (const item of initialTopics) {
    const parentSection = await Section.findOne({ slug: item.sectionSlug });
    if (!parentSection) {
      console.warn(`[Seed Topics] Section '${item.sectionSlug}' not found! Skipping topic '${item.title}'`);
      continue;
    }

    const topicData = {
      section: parentSection._id,
      title: item.title,
      slug: item.slug,
      summary: item.summary,
      description: item.description,
      duration: item.duration,
      order: item.order,
      keyPoints: item.keyPoints,
      codeExamples: item.codeExamples,
      content: item.content,
      published: true,
    };

    const existing = await Topic.findOne({ slug: item.slug });
    if (existing) {
      console.log(`[Seed Topics] Topic '${item.title}' (${item.slug}) already exists. Updating...`);
      await Topic.findByIdAndUpdate(existing._id, topicData, { new: true });
    } else {
      console.log(`[Seed Topics] Creating topic: '${item.title}' (${item.slug}) for section: ${item.sectionSlug}`);
      await Topic.create(topicData);
    }
  }

  const count = await Topic.countDocuments();
  console.log(`[Seed Topics] Successfully seeded. Total topics in DB: ${count}`);

  if (disconnectAfter) {
    await mongoose.disconnect();
  }
}

// Execute if run directly from CLI
if (process.argv[1] && process.argv[1].endsWith('seedTopics.js')) {
  seedTopics(true)
    .then(() => {
      console.log('[Seed Topics] Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed Topics Error]:', err);
      process.exit(1);
    });
}
