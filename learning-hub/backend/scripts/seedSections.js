import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Module } from '../src/models/Module.js';
import { Section } from '../src/models/Section.js';

const initialSections = [
  // Sections for 'javascript-basics'
  {
    moduleSlug: 'javascript-basics',
    title: 'Variables',
    slug: 'variables',
    description: 'Learn JavaScript variable declarations and understand scope, hoisting, and immutability with var, let, and const.',
    duration: '45 mins',
    order: 1,
    items: ['var', 'let', 'const'],
    content: `# Variables in JavaScript

Variables are named containers used for storing data values. In modern JavaScript, you declare variables using \`var\`, \`let\`, or \`const\`.

## 1. \`var\`
- **Scope**: Function-scoped (or globally scoped if declared outside a function). It ignores curly-bracket \`{}\` blocks.
- **Re-declaration**: Can be redeclared and reassigned anytime.
- **Hoisting**: Hoisted to the top of its scope and initialized with \`undefined\`.

\`\`\`javascript
var name = "Alice";
var name = "Bob"; // Allowed!
\`\`\`

## 2. \`let\`
- **Scope**: Block-scoped (contained within \`{ ... }\`).
- **Re-assignment**: Can be reassigned, but CANNOT be re-declared in the same block.
- **Hoisting**: Hoisted, but resides in the "Temporal Dead Zone" (TDZ) until evaluation.

\`\`\`javascript
let score = 10;
score = 15; // Allowed
// let score = 20; // SyntaxError: Identifier 'score' has already been declared
\`\`\`

## 3. \`const\`
- **Scope**: Block-scoped.
- **Re-assignment**: Cannot be reassigned or re-declared. Must be initialized upon declaration.
- **Mutability**: The binding is immutable, but if the value is an object or array, its contents can be modified.

\`\`\`javascript
const PI = 3.14159;
// PI = 3.14; // TypeError: Assignment to constant variable

const user = { name: "Carol" };
user.name = "Dan"; // Valid! Object reference is maintained.
\`\`\`
`,
  },
  {
    moduleSlug: 'javascript-basics',
    title: 'Data Types',
    slug: 'data-types',
    description: 'Explore JavaScript primitive types and reference types, type coercion, and memory allocation in depth.',
    duration: '50 mins',
    order: 2,
    items: ['Primitives', 'Strings & Numbers', 'Booleans & Null', 'Undefined & Symbol', 'Reference Types'],
    content: `# Data Types in JavaScript

JavaScript is dynamically and weakly typed. Variables do not have types; values do.

## Primitive Types (Passed by Value)
1. **String**: Textual data enclosed in single quotes, double quotes, or backticks.
2. **Number**: Double-precision 64-bit binary format IEEE 754 values.
3. **BigInt**: Arbitrary precision integers (\`123n\`).
4. **Boolean**: Logical values \`true\` and \`false\`.
5. **Undefined**: A variable that has been declared but not assigned a value.
6. **Null**: Intentional representation of 'no value' or 'empty'.
7. **Symbol**: Unique and immutable primitive values used as object keys.

## Reference Types (Passed by Reference)
- **Objects**: Key-value collections \`{ a: 1 }\`.
- **Arrays**: Ordered list of elements \`[1, 2, 3]\`.
- **Functions**: Executable code blocks.
`,
  },
  {
    moduleSlug: 'javascript-basics',
    title: 'Operators & Conditionals',
    slug: 'operators-and-conditionals',
    description: 'Master arithmetic, comparison operators (== vs ===), logical operators, and flow control with if/else and switch.',
    duration: '40 mins',
    order: 3,
    items: ['Arithmetic Operators', 'Strict Equality (===)', 'Logical Operators (&&, ||, ??)', 'Conditionals & Switch'],
    content: `# Operators and Conditionals in JavaScript

Master essential operators and control flow structures to direct program execution.

## Strict Equality vs Loose Equality
Always prefer \`===\` (strict equality) over \`==\` (loose equality) to avoid unexpected type coercion.

\`\`\`javascript
0 == false;   // true (type coercion)
0 === false;  // false (different types)
\`\`\`
`,
  },

  // Sections for 'functions'
  {
    moduleSlug: 'functions',
    title: 'Function Declarations & Expressions',
    slug: 'function-declarations-and-expressions',
    description: 'Understand the differences between function declarations and function expressions, hoisting behavior, and parameter defaults.',
    duration: '45 mins',
    order: 1,
    items: ['Declarations vs Expressions', 'Default Parameters', 'Rest Parameters', 'Return Statements'],
    content: `# Function Declarations vs Expressions

Functions are first-class citizens in JavaScript. They can be stored in variables, passed into arguments, and returned from other functions.
`,
  },
  {
    moduleSlug: 'functions',
    title: 'Arrow Functions & Lexical Scope',
    slug: 'arrow-functions-and-lexical-scope',
    description: 'Master concise arrow function syntax and how arrow functions capture lexical this.',
    duration: '40 mins',
    order: 2,
    items: ['Arrow Syntax', 'Lexical this', 'Implicit Returns', 'Limitations of Arrow Functions'],
    content: `# Arrow Functions in ES6+

Arrow functions provide a more concise syntax for writing function expressions and lexically bind the \`this\` value.
`,
  },
];

export async function seedSections(disconnectAfter = false) {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/learning_hub';
  if (mongoose.connection.readyState === 0) {
    console.log(`[Seed Sections] Connecting to MongoDB: ${uri}`);
    await mongoose.connect(uri);
  }

  for (const item of initialSections) {
    const parentModule = await Module.findOne({ slug: item.moduleSlug });
    if (!parentModule) {
      console.warn(`[Seed Sections] Module '${item.moduleSlug}' not found! Skipping section '${item.title}'`);
      continue;
    }

    const sectionData = {
      module: parentModule._id,
      title: item.title,
      slug: item.slug,
      description: item.description,
      duration: item.duration,
      order: item.order,
      items: item.items,
      content: item.content,
      published: true,
    };

    const existing = await Section.findOne({ slug: item.slug });
    if (existing) {
      console.log(`[Seed Sections] Section '${item.title}' (${item.slug}) already exists. Updating...`);
      await Section.findByIdAndUpdate(existing._id, sectionData, { new: true });
    } else {
      console.log(`[Seed Sections] Creating section: '${item.title}' (${item.slug}) for module: ${item.moduleSlug}`);
      await Section.create(sectionData);
    }
  }

  const count = await Section.countDocuments();
  console.log(`[Seed Sections] Successfully seeded. Total sections in DB: ${count}`);

  if (disconnectAfter) {
    await mongoose.disconnect();
  }
}

// Execute if run directly from CLI
if (process.argv[1] && process.argv[1].endsWith('seedSections.js')) {
  seedSections(true)
    .then(() => {
      console.log('[Seed Sections] Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed Sections Error]:', err);
      process.exit(1);
    });
}
