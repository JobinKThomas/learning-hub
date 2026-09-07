import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { LearningPath } from '../src/models/LearningPath.js';

const initialPaths = [
  {
    title: 'JavaScript',
    slug: 'javascript',
    description:
      'Master modern JavaScript from core syntax and ES6+ features to asynchronous programming, closures, prototypes, and browser APIs.',
    category: 'Frontend',
    level: 'Beginner',
    estimatedHours: 25,
    icon: 'FileCode',
    color: 'amber',
    published: true,
    modules: [
      {
        title: 'Modern JS Fundamentals',
        description: 'Variables, data types, scope, arrow functions, template literals, and destructuring.',
        duration: '5 hours',
        topics: ['Variables & Primitive Types', 'Arrow Functions & Lexical Scope', 'Destructuring & Spread Operator', 'Control Flow & Logic'],
        order: 1,
      },
      {
        title: 'Asynchronous JavaScript & Promises',
        description: 'Deep dive into event loop, callbacks, Promises, and async/await syntax.',
        duration: '6 hours',
        topics: ['The Event Loop & Task Queue', 'Creating & Chaining Promises', 'Async / Await Patterns', 'Error Handling with Try/Catch'],
        order: 2,
      },
      {
        title: 'DOM Manipulation & Events',
        description: 'Interacting with HTML elements, event listeners, bubbling, and event delegation.',
        duration: '7 hours',
        topics: ['Query Selectors & Modifying Nodes', 'Event Listeners & Event Delegation', 'Forms & Client-Side Validation', 'Working with LocalStorage'],
        order: 3,
      },
      {
        title: 'Object-Oriented & Functional Patterns',
        description: 'Prototypes, ES6 Classes, higher-order functions (map, filter, reduce), and immutability.',
        duration: '7 hours',
        topics: ['Prototype Chain & Classes', 'Higher-Order Array Methods', 'Closures & Currying', 'Pure Functions & Immutability'],
        order: 4,
      },
    ],
  },
  {
    title: 'React & Modern Frontend',
    slug: 'react-frontend',
    description:
      'Build reactive, high-performance web applications using React 18, React Router, Tailwind CSS, and Redux Toolkit.',
    category: 'Frontend',
    level: 'Intermediate',
    estimatedHours: 35,
    icon: 'Layers',
    color: 'indigo',
    published: true,
    modules: [
      {
        title: 'React Core & Hooks',
        description: 'Component lifecycles, JSX, useState, useEffect, and custom hooks.',
        duration: '8 hours',
        topics: ['JSX & Component Hierarchy', 'State & Props Flow', 'Effect Hook & Lifecycles', 'Building Custom Hooks'],
        order: 1,
      },
      {
        title: 'State Management with Redux Toolkit',
        description: 'Centralized state, slices, createAsyncThunk, and redux devtools.',
        duration: '10 hours',
        topics: ['Redux Store Architecture', 'Creating Feature Slices', 'Async Thunks & API Calls', 'Optimistic Updates'],
        order: 2,
      },
      {
        title: 'Navigation & Single Page Apps',
        description: 'Client-side routing with React Router v6, dynamic routes, and protected guards.',
        duration: '8 hours',
        topics: ['BrowserRouter & Route Hierarchy', 'Dynamic Path Parameters (:slug)', 'Protected Route Patterns', 'Navigation State & Redirection'],
        order: 3,
      },
      {
        title: 'Styling & Design Systems with Tailwind CSS',
        description: 'Utility-first styling, component encapsulation, dark mode, and responsive grids.',
        duration: '9 hours',
        topics: ['Tailwind Utility Classes', 'Responsive Layouts & Breakpoints', 'Custom Design Tokens', 'Micro-interactions & Animations'],
        order: 4,
      },
    ],
  },
  {
    title: 'Node.js Backend Architecture',
    slug: 'nodejs-backend',
    description:
      'Architect robust RESTful APIs with Node.js, Express, MongoDB, Mongoose, JWT authentication, and Swagger documentation.',
    category: 'Backend',
    level: 'Advanced',
    estimatedHours: 40,
    icon: 'Server',
    color: 'emerald',
    published: true,
    modules: [
      {
        title: 'Express & RESTful Design',
        description: 'Routing, middleware chains, controller layer, and error envelopes.',
        duration: '10 hours',
        topics: ['HTTP Protocols & Status Codes', 'Centralized Error Middleware', 'Standardized API Envelopes', 'Configuring Helmet & CORS'],
        order: 1,
      },
      {
        title: 'Data Modeling with MongoDB & Mongoose',
        description: 'Schemas, relations, indexing, population, and validation hooks.',
        duration: '10 hours',
        topics: ['Connecting to MongoDB', 'Schema Definitions & Indexes', 'Pre-save Hooks & Virtuals', 'Complex Queries & Aggregation'],
        order: 2,
      },
      {
        title: 'Authentication & RBAC Security',
        description: 'Dual-token JWT architecture, password hashing with bcrypt, and role guards.',
        duration: '10 hours',
        topics: ['Salting & Hashing with Bcrypt', 'Access & Refresh Token Rotation', 'Authorization & Role Guards', 'Preventing Token Reuse'],
        order: 3,
      },
      {
        title: 'Testing & API Documentation',
        description: 'Automated integration testing with node:test and OpenAPI 3.0 Swagger UI.',
        duration: '10 hours',
        topics: ['Integration Testing with Supertest', 'Test Assertions & Edge Cases', 'Swagger JSDoc Annotations', 'Continuous Verification'],
        order: 4,
      },
    ],
  },
];

export async function seedLearningPaths(disconnectAfter = false) {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/learning_hub';
  if (mongoose.connection.readyState === 0) {
    console.log(`[Seed] Connecting to MongoDB: ${uri}`);
    await mongoose.connect(uri);
  }

  for (const item of initialPaths) {
    const existing = await LearningPath.findOne({ slug: item.slug });
    if (existing) {
      console.log(`[Seed] Learning path '${item.title}' (${item.slug}) already exists. Updating...`);
      await LearningPath.findByIdAndUpdate(existing._id, { ...item, published: true }, { new: true });
    } else {
      console.log(`[Seed] Creating new learning path: '${item.title}' (${item.slug})`);
      await LearningPath.create(item);
    }
  }

  // Ensure any other existing paths have published: true if not specified
  await LearningPath.updateMany({ published: { $exists: false } }, { $set: { published: true } });

  const count = await LearningPath.countDocuments();
  console.log(`[Seed] Successfully seeded. Total learning paths in DB: ${count}`);
  if (disconnectAfter) {
    await mongoose.disconnect();
  }
}

// Execute if run directly from CLI
if (process.argv[1] && process.argv[1].endsWith('seedLearningPaths.js')) {
  seedLearningPaths(true)
    .then(() => {
      console.log('[Seed] Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed Error]:', err);
      process.exit(1);
    });
}
