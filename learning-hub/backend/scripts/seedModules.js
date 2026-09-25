import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { LearningPath } from '../src/models/LearningPath.js';
import { Module } from '../src/models/Module.js';

const initialModules = [
  // Modules for JavaScript path
  {
    pathSlug: 'javascript',
    title: 'JavaScript Basics',
    slug: 'javascript-basics',
    description: 'Master core syntax, variable scopes (var, let, const), primitive data types, operators, and conditional flow control.',
    duration: '3 hours',
    order: 1,
    topics: [
      'Variables & Declaration (let, const, var)',
      'Primitive vs Reference Types',
      'Arithmetic & Logical Operators',
      'Type Conversion & Strict Equality (===)',
      'Conditionals (if/else, ternary, switch)',
    ],
    learningObjectives: [
      'Understand variable scoping and memory allocation',
      'Write clean conditional control flow',
      'Avoid subtle type coercion bugs',
    ],
  },
  {
    pathSlug: 'javascript',
    title: 'Functions',
    slug: 'functions',
    description: 'Deep dive into function declarations, expressions, arrow functions, lexical scope, closures, and the call stack.',
    duration: '4 hours',
    order: 2,
    topics: [
      'Function Declarations vs Expressions',
      'Arrow Functions & Lexical this',
      'Closures & The Scope Chain',
      'Higher-Order Functions & Callbacks',
      'Default Parameters & Rest Operator',
    ],
    learningObjectives: [
      'Master lexical scoping and closures',
      'Effectively use arrow functions and understand this binding',
      'Leverage higher-order functions for composable logic',
    ],
  },
  {
    pathSlug: 'javascript',
    title: 'Arrays',
    slug: 'arrays',
    description: 'Array methods, immutable transformation patterns, functional iteration (map, filter, reduce), and modern Set/Map data structures.',
    duration: '4 hours',
    order: 3,
    topics: [
      'Array Creation & Mutation Methods',
      'Functional Transforms: map, filter, reduce',
      'Array Destructuring & Spread Syntax',
      'Searching & Sorting Algorithms (find, some, every)',
      'Keyed Collections: Map and Set',
    ],
    learningObjectives: [
      'Write concise functional pipelines with map/filter/reduce',
      'Maintain immutability when updating arrays',
      'Select optimal collection structures for performance',
    ],
  },
  {
    pathSlug: 'javascript',
    title: 'Objects',
    slug: 'objects',
    description: 'Object creation, property descriptors, prototype inheritance chain, ES6 class syntax, and copying patterns.',
    duration: '5 hours',
    order: 4,
    topics: [
      'Object Literals & Computed Property Names',
      'Prototypes & The Prototype Chain',
      'ES6 Classes, Constructors & Inheritance',
      'Object Utility Methods (keys, values, entries)',
      'Shallow vs Deep Cloning (structuredClone)',
    ],
    learningObjectives: [
      'Demystify JavaScript prototype chain inheritance',
      'Build scalable object-oriented abstractions using ES6 Classes',
      'Properly clone and serialize complex object graphs',
    ],
  },

  // Modules for React path
  {
    pathSlug: 'react-frontend',
    title: 'Components & JSX',
    slug: 'react-components-jsx',
    description: 'Component architecture, Virtual DOM, JSX syntax rules, and prop passing fundamentals.',
    duration: '5 hours',
    order: 1,
    topics: [
      'JSX Syntax & Rules',
      'Functional Components',
      'Props & Prop Drilling',
      'Conditional Rendering in React',
      'Rendering Lists with Keys',
    ],
    learningObjectives: [
      'Structure clean component hierarchies',
      'Pass and validate props across component trees',
      'Avoid common React key and re-render pitfalls',
    ],
  },
  {
    pathSlug: 'react-frontend',
    title: 'React Hooks & State',
    slug: 'react-hooks-state',
    description: 'useState, useEffect lifecycles, useRef, and creating production-ready custom hooks.',
    duration: '6 hours',
    order: 2,
    topics: [
      'useState for Local State Management',
      'useEffect & Cleanup Mechanisms',
      'useRef for DOM Access & Persisted Values',
      'useMemo & useCallback for Performance',
      'Building Reusable Custom Hooks',
    ],
    learningObjectives: [
      'Master the hook rules and state update batching',
      'Manage component lifecycle synchronization',
      'Encapsulate business logic into reusable custom hooks',
    ],
  },

  // Modules for Node.js Backend path
  {
    pathSlug: 'nodejs-backend',
    title: 'Express REST Architecture',
    slug: 'express-rest-architecture',
    description: 'Building production-grade REST APIs, middleware pipelines, routing, and centralized error envelopes.',
    duration: '6 hours',
    order: 1,
    topics: [
      'Express Application Lifecycle & Middleware',
      'RESTful Resource Routing',
      'Request Parsing & Validation',
      'Centralized Error Handling Middleware',
      'Security Headers with Helmet & CORS',
    ],
    learningObjectives: [
      'Architect maintainable 3-tier RESTful applications',
      'Compose clean middleware chains',
      'Enforce consistent error envelopes across all routes',
    ],
  },
];

export async function seedModules(disconnectAfter = false) {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/learning_hub';
  if (mongoose.connection.readyState === 0) {
    console.log(`[Seed Modules] Connecting to MongoDB: ${uri}`);
    await mongoose.connect(uri);
  }

  for (const item of initialModules) {
    const learningPath = await LearningPath.findOne({ slug: item.pathSlug });
    if (!learningPath) {
      console.warn(`[Seed Modules] Learning path '${item.pathSlug}' not found! Skipping module '${item.title}'`);
      continue;
    }

    const moduleData = {
      learningPath: learningPath._id,
      title: item.title,
      slug: item.slug,
      description: item.description,
      duration: item.duration,
      order: item.order,
      topics: item.topics,
      learningObjectives: item.learningObjectives,
      published: true,
    };

    const existing = await Module.findOne({ slug: item.slug });
    if (existing) {
      console.log(`[Seed Modules] Module '${item.title}' (${item.slug}) already exists. Updating...`);
      await Module.findByIdAndUpdate(existing._id, moduleData, { new: true });
    } else {
      console.log(`[Seed Modules] Creating module: '${item.title}' (${item.slug}) for path: ${item.pathSlug}`);
      await Module.create(moduleData);
    }
  }

  const count = await Module.countDocuments();
  console.log(`[Seed Modules] Successfully seeded. Total modules in DB: ${count}`);

  if (disconnectAfter) {
    await mongoose.disconnect();
  }
}

// Execute if run directly from CLI
if (process.argv[1] && process.argv[1].endsWith('seedModules.js')) {
  seedModules(true)
    .then(() => {
      console.log('[Seed Modules] Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed Modules Error]:', err);
      process.exit(1);
    });
}
