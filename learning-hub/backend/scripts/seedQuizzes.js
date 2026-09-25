import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Topic } from '../src/models/Topic.js';
import { Quiz } from '../src/models/Quiz.js';

export const initialQuizzes = [
  {
    topicSlug: 'let',
    title: 'Let & Scoping Knowledge Check',
    slug: 'let-scoping-quiz',
    description: 'Test your understanding of block scoping, variable reassignment, and the Temporal Dead Zone (TDZ).',
    passingScore: 70,
    timeLimitMinutes: 5,
    order: 1,
    published: true,
    questions: [
      {
        question: "What is the scope of variables declared with the 'let' keyword?",
        options: [
          'Function scope only',
          'Block scope ({ ... })',
          'Global scope only',
          'Module scope only',
        ],
        correctAnswer: 1,
        explanation: "'let' is lexically block-scoped, meaning its visibility is restricted to the nearest enclosing pair of curly braces.",
        codeSnippet: '',
      },
      {
        question: "What occurs when you attempt to access a 'let' variable before its declaration line?",
        options: [
          'It returns undefined',
          'It throws a ReferenceError due to the Temporal Dead Zone (TDZ)',
          'It returns null',
          'It silently initializes to 0',
        ],
        correctAnswer: 1,
        explanation: 'Unlike var which is hoisted and initialized to undefined, let remains uninitialized in the Temporal Dead Zone until execution reaches its declaration.',
        codeSnippet: 'console.log(score);\nlet score = 100;',
      },
      {
        question: "Can a variable declared with 'let' be reassigned to a new value in the same scope?",
        options: [
          'Yes, let allows variable reassignment',
          'No, let creates read-only immutable bindings',
          'Only if the value is an object',
          'Only inside for-loops',
        ],
        correctAnswer: 0,
        explanation: "'let' permits reassigning the variable identifier to new values, whereas 'const' prohibits identifier reassignment.",
        codeSnippet: 'let count = 1;\ncount = 2; // Is this valid?',
      },
    ],
  },
  {
    topicSlug: 'const',
    title: 'Const & Immutability Quiz',
    slug: 'const-immutability-quiz',
    description: 'Validate your grasp of constant variable bindings, object mutation, and Object.freeze().',
    passingScore: 70,
    timeLimitMinutes: 5,
    order: 1,
    published: true,
    questions: [
      {
        question: "What guarantee does 'const' provide in JavaScript?",
        options: [
          'The object properties and array elements cannot be mutated',
          'The variable identifier cannot be reassigned to a new reference',
          'The value is automatically deep frozen',
          'The variable is garbage collected immediately',
        ],
        correctAnswer: 1,
        explanation: "'const' creates an immutable variable identifier binding, not an immutable value in memory.",
        codeSnippet: '',
      },
      {
        question: 'Given the code below, which statement throws a TypeError at runtime?',
        options: [
          'user.name = "Jane";',
          'user.age = 30;',
          'user = { name: "Bob" };',
          'delete user.name;',
        ],
        correctAnswer: 2,
        explanation: 'Reassigning user to a new object reference throws TypeError: Assignment to constant variable. Mutating properties of the object is completely allowed.',
        codeSnippet: 'const user = { name: "John" };\n// Which line throws TypeError?',
      },
      {
        question: 'Which built-in JavaScript method prevents mutating properties of an object?',
        options: [
          'Object.seal()',
          'Object.freeze()',
          'const objects are automatically frozen',
          'Object.lock()',
        ],
        correctAnswer: 1,
        explanation: 'Object.freeze() makes an object shallowly immutable, preventing addition, modification, or removal of properties.',
        codeSnippet: '',
      },
    ],
  },
  {
    topicSlug: 'var',
    title: 'Var Quirks & Hoisting Quiz',
    slug: 'var-hoisting-quiz',
    description: 'Assess your knowledge of legacy variable hoisting and lack of block scoping.',
    passingScore: 70,
    timeLimitMinutes: 5,
    order: 1,
    published: true,
    questions: [
      {
        question: "What is logged to the console when accessing a 'var' variable before its assignment line?",
        options: [
          'ReferenceError: x is not defined',
          'undefined',
          'null',
          '0',
        ],
        correctAnswer: 1,
        explanation: "'var' declarations are hoisted to the top of their function/global scope and automatically initialized to undefined during compilation.",
        codeSnippet: 'console.log(x);\nvar x = 5;',
      },
      {
        question: "What scope does a 'var' variable have when declared inside a for-loop?",
        options: [
          'It is scoped strictly to the for-loop block',
          'It leaks into the enclosing function or global scope',
          'It throws a SyntaxError',
          'It becomes read-only outside the loop',
        ],
        correctAnswer: 1,
        explanation: "'var' does not have block scope ({ ... }), so loop counter variables declared with var leak into the enclosing function scope.",
        codeSnippet: 'for (var i = 0; i < 3; i++) {}\nconsole.log(i); // What happens?',
      },
    ],
  },
];

export async function seedQuizzes(disconnectAfter = true) {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/learning_hub';

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }

  for (const item of initialQuizzes) {
    const topic = await Topic.findOne({ slug: item.topicSlug });
    if (!topic) {
      console.warn(`[Seed Quizzes] Topic '${item.topicSlug}' not found. Skipping.`);
      continue;
    }

    const quizData = {
      topic: topic._id,
      title: item.title,
      slug: item.slug,
      description: item.description,
      passingScore: item.passingScore,
      timeLimitMinutes: item.timeLimitMinutes,
      order: item.order,
      published: item.published,
      questions: item.questions,
    };

    const existing = await Quiz.findOne({ slug: item.slug });
    if (existing) {
      await Quiz.findByIdAndUpdate(existing._id, { $set: quizData });
      console.log(`[Seed Quizzes] Updated quiz '${item.title}' (${item.slug})`);
    } else {
      await Quiz.create(quizData);
      console.log(`[Seed Quizzes] Created quiz '${item.title}' (${item.slug})`);
    }
  }

  const count = await Quiz.countDocuments();
  console.log(`[Seed Quizzes] Seeding complete. Total quizzes in DB: ${count}`);

  if (disconnectAfter) {
    await mongoose.disconnect();
    console.log('[Seed Quizzes] Disconnected from MongoDB.');
  }
}

if (process.argv[1] && process.argv[1].endsWith('seedQuizzes.js')) {
  seedQuizzes(true)
    .then(() => {
      console.log('[Seed Quizzes] Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed Quizzes Error]:', err);
      process.exit(1);
    });
}
