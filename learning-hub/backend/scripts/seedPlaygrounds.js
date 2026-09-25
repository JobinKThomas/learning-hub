import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Topic } from '../src/models/Topic.js';
import { Playground } from '../src/models/Playground.js';

export const initialPlaygrounds = [
  {
    topicSlug: 'let',
    title: 'Let Reassignment & Block Scope',
    slug: 'let-scope-playground',
    description: 'Explore how let enables reassignment while strictly enforcing lexical block scoping.',
    instructions: `# Challenge: Fix Block Scoping with let\n\n1. In this challenge, inspect how 'let' behaves inside an if-block versus outside.\n2. Predict the output of the console statements.\n3. Try reassigning 'counter' and observe what happens.`,
    initialCode: `let counter = 10;\n\nif (true) {\n  let counter = 99; // Shadowed in block scope\n  console.log("Inside block scope, counter is:", counter);\n}\n\nconsole.log("Outside block scope, counter is:", counter);\n\n// Task: Reassign the outer counter to 25 and log it\ncounter = 25;\nconsole.log("Reassigned counter is:", counter);\n`,
    solutionCode: `let counter = 10;\nif (true) {\n  let counter = 99;\n  console.log("Inside block scope, counter is:", counter);\n}\nconsole.log("Outside block scope, counter is:", counter);\ncounter = 25;\nconsole.log("Reassigned counter is:", counter);\n`,
    expectedOutput: `Inside block scope, counter is: 99\nOutside block scope, counter is: 10\nReassigned counter is: 25`,
    hints: [
      'let is block-scoped, meaning variables declared inside { ... } do not leak out.',
      'Unlike const, let allows subsequent reassignment without throwing a TypeError.',
      'Variable shadowing occurs when a nested scope re-declares a variable with the same name.',
    ],
    language: 'javascript',
    difficulty: 'BEGINNER',
    order: 1,
    published: true,
  },
  {
    topicSlug: 'const',
    title: 'Const Mutability & Object Freezing',
    slug: 'const-immutability-playground',
    description: 'Learn the difference between constant variable binding and object mutation with const.',
    instructions: `# Challenge: Understand const Mutability\n\n1. const prevents reassigning the variable identifier itself.\n2. However, properties of an object or array declared with const CAN still be mutated!\n3. Run this code to see how Object.freeze prevents property mutation.`,
    initialCode: `const user = {\n  name: "Alice",\n  role: "Developer"\n};\n\n// Modifying a property is allowed with const objects\nuser.role = "Senior Architect";\nconsole.log("Updated role:", user.role);\n\n// Freezing the object prevents further mutation\nconst config = Object.freeze({\n  apiUrl: "https://api.learninghub.dev",\n  port: 5000\n});\n\nconsole.log("API URL is:", config.apiUrl);\n`,
    solutionCode: `const user = {\n  name: "Alice",\n  role: "Developer"\n};\nuser.role = "Senior Architect";\nconsole.log("Updated role:", user.role);\nconst config = Object.freeze({\n  apiUrl: "https://api.learninghub.dev",\n  port: 5000\n});\nconsole.log("API URL is:", config.apiUrl);\n`,
    expectedOutput: `Updated role: Senior Architect\nAPI URL is: https://api.learninghub.dev`,
    hints: [
      'const creates an immutable binding to the memory reference, not an immutable value.',
      'To make an object itself immutable, use Object.freeze().',
      'Attempting to reassign a const variable (e.g. user = {}) throws a TypeError.',
    ],
    language: 'javascript',
    difficulty: 'INTERMEDIATE',
    order: 1,
    published: true,
  },
  {
    topicSlug: 'var',
    title: 'Var Hoisting & Function Scoping',
    slug: 'var-hoisting-playground',
    description: 'Observe the legacy quirks of var: hoisting and lack of block scope.',
    instructions: `# Challenge: Observe Hoisting in Action\n\n1. Notice how accessing 'legacyVar' before declaration prints undefined instead of throwing a ReferenceError.\n2. Observe how var declared inside a loop leaks out to the enclosing function/global scope.`,
    initialCode: `console.log("Before declaration, legacyVar is:", legacyVar);\n\nvar legacyVar = "I am hoisted!";\nconsole.log("After declaration, legacyVar is:", legacyVar);\n\nfor (var i = 0; i < 3; i++) {\n  // Loop body\n}\n\nconsole.log("After loop, i leaked outside:", i);\n`,
    solutionCode: `console.log("Before declaration, legacyVar is:", legacyVar);\nvar legacyVar = "I am hoisted!";\nconsole.log("After declaration, legacyVar is:", legacyVar);\nfor (var i = 0; i < 3; i++) {}\nconsole.log("After loop, i leaked outside:", i);\n`,
    expectedOutput: `Before declaration, legacyVar is: undefined\nAfter declaration, legacyVar is: I am hoisted!\nAfter loop, i leaked outside: 3`,
    hints: [
      'var declarations are hoisted to the top of their function/global scope and initialized to undefined.',
      'var lacks block scope ({ ... }), leaking out of loops and conditionals.',
      'Modern JavaScript recommends let and const over var to prevent subtle scoping bugs.',
    ],
    language: 'javascript',
    difficulty: 'INTERMEDIATE',
    order: 1,
    published: true,
  },
];

export async function seedPlaygrounds(disconnectAfter = true) {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/learning_hub';

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }

  for (const item of initialPlaygrounds) {
    const topic = await Topic.findOne({ slug: item.topicSlug });
    if (!topic) {
      console.warn(`[Seed Playgrounds] Topic '${item.topicSlug}' not found. Skipping.`);
      continue;
    }

    const playgroundData = {
      topic: topic._id,
      title: item.title,
      slug: item.slug,
      description: item.description,
      instructions: item.instructions,
      initialCode: item.initialCode,
      solutionCode: item.solutionCode,
      expectedOutput: item.expectedOutput,
      hints: item.hints,
      language: item.language,
      difficulty: item.difficulty,
      order: item.order,
      published: item.published,
    };

    const existing = await Playground.findOne({ slug: item.slug });
    if (existing) {
      await Playground.findByIdAndUpdate(existing._id, { $set: playgroundData });
      console.log(`[Seed Playgrounds] Updated playground '${item.title}' (${item.slug})`);
    } else {
      await Playground.create(playgroundData);
      console.log(`[Seed Playgrounds] Created playground '${item.title}' (${item.slug})`);
    }
  }

  const count = await Playground.countDocuments();
  console.log(`[Seed Playgrounds] Seeding complete. Total playgrounds in DB: ${count}`);

  if (disconnectAfter) {
    await mongoose.disconnect();
    console.log('[Seed Playgrounds] Disconnected from MongoDB.');
  }
}

if (process.argv[1] && process.argv[1].endsWith('seedPlaygrounds.js')) {
  seedPlaygrounds(true)
    .then(() => {
      console.log('[Seed Playgrounds] Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed Playgrounds Error]:', err);
      process.exit(1);
    });
}
