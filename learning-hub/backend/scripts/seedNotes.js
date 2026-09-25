import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Topic } from '../src/models/Topic.js';
import { Note } from '../src/models/Note.js';

const initialNotes = [
  // Notes for Topic 'let'
  {
    topicSlug: 'let',
    title: 'What is let?',
    slug: 'what-is-let',
    summary: 'A deep dive into block-scoped mutable variables, lexical scoping, and why let was introduced in ES6.',
    readingTime: '5 mins',
    order: 1,
    tags: ['javascript', 'es6', 'variables', 'scoping'],
    content: `# What is let?

Introduced in **ECMAScript 2015 (ES6)**, the \`let\` statement declares a block-scoped, local variable that can be re-assigned, but cannot be re-declared in the same block.

---

## 1. Motivation: Why was \`let\` created?

Prior to ES6, JavaScript only had \`var\`. While functional, \`var\` suffered from unintuitive behaviors:
- **Function scoping**: Variables declared inside \`if\` blocks or \`for\` loops leaked outside.
- **Hoisting quirks**: Variables were initialized with \`undefined\`, masking bugs.
- **Accidental re-declarations**: Re-declaring the same variable name in the same scope did not trigger errors.

\`let\` was designed to solve all three problems by introducing strict lexical block scoping and the **Temporal Dead Zone (TDZ)**.

---

## 2. Block Scoping in Practice

A block is delimited by curly braces \`{ ... }\`. A variable declared with \`let\` exists solely within that block and child blocks:

\`\`\`javascript
function calculateDiscount(price) {
  let finalPrice = price;

  if (price > 100) {
    let discount = 20; // Scoped exclusively to this if-block
    finalPrice = price - discount;
  }

  // console.log(discount); // ReferenceError: discount is not defined!
  return finalPrice;
}
\`\`\`

---

## 3. Re-assignment vs Re-declaration

Variables declared with \`let\` are **mutable** (they can be assigned new values), but **cannot be re-declared** within the same lexical scope:

\`\`\`javascript
let score = 50;
score = 75; // Valid: Re-assignment is allowed!

// let score = 100; 
// SyntaxError: Identifier 'score' has already been declared
\`\`\`

---

## 4. The Loop Closure Fix

One of the most celebrated features of \`let\` is how it interacts with \`for\` loops. Each iteration of a \`for (let ...)\` loop receives its own unique binding:

\`\`\`javascript
// With var (The Classic Bug):
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log("var i:", i), 100);
}
// Prints: 3, 3, 3

// With let (The Clean Solution):
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log("let j:", j), 100);
}
// Prints: 0, 1, 2
\`\`\`

---

## Summary Checklist
- Use \`let\` when you know a variable's value needs to change over time (e.g., counters, accumulators, toggles).
- Avoid using \`var\` in modern codebases.
`,
  },
  {
    topicSlug: 'let',
    title: 'let vs const',
    slug: 'let-vs-const',
    summary: 'A direct comparison of mutability, identifier re-assignment, object manipulation, and modern best practices.',
    readingTime: '6 mins',
    order: 2,
    tags: ['javascript', 'es6', 'best-practices', 'immutability'],
    content: `# let vs const: Modern Variable Declaration

Both \`let\` and \`const\` were introduced in ES6 and share block-scoping rules. However, they serve fundamentally different semantic intents.

---

## Comparison Matrix

| Feature | \`let\` | \`const\` | \`var\` |
| :--- | :--- | :--- | :--- |
| **Scope** | Block \`{ }\` | Block \`{ }\` | Function / Global |
| **Hoisting** | TDZ (ReferenceError) | TDZ (ReferenceError) | Initialized as \`undefined\` |
| **Re-assignment** | Allowed | Not Allowed (TypeError) | Allowed |
| **Re-declaration** | Error in same scope | Error in same scope | Allowed silently |
| **Initial Value Required** | No (defaults to \`undefined\`) | **Yes** (SyntaxError if missing) | No |

---

## The Core Rule: Constant Binding, Not Value

A common misconception is that \`const\` creates immutable values. In JavaScript, **\`const\` creates an immutable binding (memory pointer)**, not an immutable value!

\`\`\`javascript
// 1. Primitive values cannot be altered:
const pi = 3.14159;
// pi = 3.14; // TypeError: Assignment to constant variable.

// 2. Objects and arrays CAN have their contents mutated:
const userProfile = {
  name: "Alice",
  role: "Developer"
};

// This is perfectly valid:
userProfile.role = "Lead Architect";
userProfile.verified = true;

// But this will throw an error:
// userProfile = { name: "Bob" }; // TypeError!
\`\`\`

---

## When to Use Which?

The industry consensus followed by Google, Airbnb, and the TypeScript team:

> **Default to \`const\` for every variable. Only use \`let\` when you have an explicit need to reassign the identifier.**

### Why default to \`const\`?
1. **Reduces cognitive load**: When reading code, you immediately know that variable identifier will never point to something else.
2. **Prevents accidental bugs**: Guards against unintended assignments in complex conditionals.
3. **Compiler optimization**: Modern JavaScript engines (like V8) can make certain memory optimizations for constant bindings.
`,
  },
  {
    topicSlug: 'let',
    title: 'Block scope',
    slug: 'block-scope',
    summary: 'Understanding lexical environments, curly braces boundaries, variable shadowing, and nested scope chains.',
    readingTime: '4 mins',
    order: 3,
    tags: ['javascript', 'scope', 'lexical-environment', 'closures'],
    content: `# Block Scope in JavaScript

Scope defines the accessibility and visibility of variables, functions, and objects in some particular part of your code during runtime.

---

## What Constitutes a Block?

In JavaScript, any pair of curly braces \`{ ... }\` defines a **block statement**. Common examples include:
- \`if (...) { ... }\` and \`else { ... }\`
- \`switch (...) { case ...: { ... } }\`
- \`for (...; ...; ...) { ... }\`
- \`while (...) { ... }\`
- Standalone blocks: \`{ let x = 10; }\`

---

## Lexical Variable Shadowing

When a variable inside an inner block shares the name of a variable in an outer block, the inner variable **shadows** the outer one without overwriting it:

\`\`\`javascript
let theme = "light";

{
  let theme = "dark"; // Shadows the outer theme
  console.log("Inside inner block:", theme); // "dark"
}

console.log("Inside outer block:", theme); // "light" (intact!)
\`\`\`

### Shadowing across Functions:
\`\`\`javascript
const apiKey = "GLOBAL_KEY_999";

function initializeClient() {
  const apiKey = "LOCAL_CLIENT_KEY_123";
  console.log("Client using:", apiKey); // "LOCAL_CLIENT_KEY_123"
}

initializeClient();
console.log("Global key:", apiKey); // "GLOBAL_KEY_999"
\`\`\`

---

## Scope Pollution & Garbage Collection

Block-scoping helps keep memory clean. Once execution leaves a block, variables declared with \`let\` or \`const\` inside that block that are not referenced in closures are eligible for immediate **garbage collection**:

\`\`\`javascript
{
  const temporaryLargeData = new Array(1000000).fill("data");
  processData(temporaryLargeData);
}
// temporaryLargeData is now eligible for GC!
\`\`\`
`,
  },

  // Notes for Topic 'const'
  {
    topicSlug: 'const',
    title: 'What is const?',
    slug: 'what-is-const',
    summary: 'Everything you need to know about const: immutable bindings, temporal dead zones, and Object.freeze().',
    readingTime: '5 mins',
    order: 1,
    tags: ['javascript', 'es6', 'const', 'immutability'],
    content: `# What is const?

The \`const\` declaration creates a read-only named constant. Like \`let\`, it is block-scoped and subject to the **Temporal Dead Zone**.

---

## 1. Syntax and Initialization Requirement

Unlike \`var\` or \`let\`, every \`const\` statement **must** include an assignment initializer at the point of declaration:

\`\`\`javascript
// Valid:
const DEFAULT_TIMEOUT_MS = 5000;

// SyntaxError: Missing initializer in const declaration:
// const MAX_RETRIES;
\`\`\`

---

## 2. Naming Conventions

By convention in the JavaScript ecosystem:
- Use **UPPER_SNAKE_CASE** for global configuration primitives and compile-time constants (e.g., \`MAX_USERS\`, \`API_BASE_URL\`).
- Use **camelCase** for local variables, functions, components, and objects (e.g., \`userSession\`, \`fetchProfile\`).

---

## 3. Achieving True Deep Immutability

Because \`const\` only prevents re-assignment of the variable itself, object properties can still be modified. If your application demands immutable state, combine \`const\` with \`Object.freeze()\`:

\`\`\`javascript
const appConfig = Object.freeze({
  appName: "Learning Hub",
  version: "1.0.0",
  features: {
    darkMode: true
  }
});

// appConfig.version = "2.0.0"; // Throws TypeError in strict mode!
\`\`\`

> **Note**: \`Object.freeze()\` is shallow. For nested objects, use a recursive deep freeze or libraries like Immer.
`,
  },
];

export async function seedNotes(disconnectAfter = false) {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/learning_hub';
  if (mongoose.connection.readyState === 0) {
    console.log(`[Seed Notes] Connecting to MongoDB: ${uri}`);
    await mongoose.connect(uri);
  }

  for (const item of initialNotes) {
    const parentTopic = await Topic.findOne({ slug: item.topicSlug });
    if (!parentTopic) {
      console.warn(`[Seed Notes] Topic '${item.topicSlug}' not found! Skipping note '${item.title}'`);
      continue;
    }

    const noteData = {
      topic: parentTopic._id,
      title: item.title,
      slug: item.slug,
      summary: item.summary,
      content: item.content,
      readingTime: item.readingTime,
      order: item.order,
      tags: item.tags,
      published: true,
    };

    const existing = await Note.findOne({ slug: item.slug });
    if (existing) {
      console.log(`[Seed Notes] Note '${item.title}' (${item.slug}) already exists. Updating...`);
      await Note.findByIdAndUpdate(existing._id, noteData, { new: true });
    } else {
      console.log(`[Seed Notes] Creating note: '${item.title}' (${item.slug}) for topic: ${item.topicSlug}`);
      await Note.create(noteData);
    }
  }

  const count = await Note.countDocuments();
  console.log(`[Seed Notes] Successfully seeded. Total notes in DB: ${count}`);

  if (disconnectAfter) {
    await mongoose.disconnect();
  }
}

// Execute if run directly from CLI
if (process.argv[1] && process.argv[1].endsWith('seedNotes.js')) {
  seedNotes(true)
    .then(() => {
      console.log('[Seed Notes] Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed Notes Error]:', err);
      process.exit(1);
    });
}
