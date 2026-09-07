import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Topic } from '../src/models/Topic.js';
import { Resource } from '../src/models/Resource.js';

const initialResources = [
  // Resources for Topic 'let'
  {
    topicSlug: 'let',
    title: 'MDN Web Docs: let statement',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let',
    type: 'DOCUMENTATION',
    description: 'Official Mozilla reference on block-scoped let declarations, syntax definitions, browser compatibility, and Temporal Dead Zone examples.',
    author: 'MDN Web Docs',
    order: 1,
    isFree: true,
  },
  {
    topicSlug: 'let',
    title: 'JavaScript Visualized: Block Scope & Hoisting',
    url: 'https://www.youtube.com/watch?v=1G4Fh_9hQ_Q',
    type: 'VIDEO',
    description: 'Animated visual explanation of execution context, lexical environments, and why let variables cannot be accessed before declaration.',
    author: 'Lydia Hallie',
    order: 2,
    isFree: true,
  },
  {
    topicSlug: 'let',
    title: 'Variables and Scoping in ECMAScript 6',
    url: 'https://exploringjs.com/es6/ch_variables.html',
    type: 'ARTICLE',
    description: 'In-depth technical breakdown of let vs var, the Temporal Dead Zone in detail, and loop iteration closure bindings.',
    author: 'Dr. Axel Rauschmayer',
    order: 3,
    isFree: true,
  },
  {
    topicSlug: 'let',
    title: 'Clean Code JavaScript: Variables and Scoping',
    url: 'https://github.com/ryanmcdermott/clean-code-javascript#variables',
    type: 'GITHUB',
    description: 'Software engineering principles and style guidelines for writing clean, readable JavaScript variable bindings.',
    author: 'Ryan McDermott',
    order: 4,
    isFree: true,
  },

  // Resources for Topic 'const'
  {
    topicSlug: 'const',
    title: 'MDN Web Docs: const statement',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const',
    type: 'DOCUMENTATION',
    description: 'Official Mozilla developer reference on block-scoped read-only named constants and immutable identifiers.',
    author: 'MDN Web Docs',
    order: 1,
    isFree: true,
  },
  {
    topicSlug: 'const',
    title: 'ES6 const is not about immutability',
    url: 'https://mathiasbynens.be/notes/es6-const',
    type: 'ARTICLE',
    description: 'Clarifying the critical distinction between immutable variable bindings and mutable object reference values.',
    author: 'Mathias Bynens',
    order: 2,
    isFree: true,
  },
  {
    topicSlug: 'const',
    title: 'Airbnb JavaScript Style Guide: References & const',
    url: 'https://github.com/airbnb/javascript#references',
    type: 'GITHUB',
    description: 'Industry standard style guide explaining why developers should default to const for all variable references.',
    author: 'Airbnb Engineering',
    order: 3,
    isFree: true,
  },

  // Resources for Topic 'var'
  {
    topicSlug: 'var',
    title: 'MDN Web Docs: var statement',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var',
    type: 'DOCUMENTATION',
    description: 'Historical JavaScript reference detailing function-scoped variables, window object properties, and hoisting to undefined.',
    author: 'MDN Web Docs',
    order: 1,
    isFree: true,
  },
];

export async function seedResources(disconnectAfter = false) {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/learning_hub';
  if (mongoose.connection.readyState === 0) {
    console.log(`[Seed Resources] Connecting to MongoDB: ${uri}`);
    await mongoose.connect(uri);
  }

  for (const item of initialResources) {
    const parentTopic = await Topic.findOne({ slug: item.topicSlug });
    if (!parentTopic) {
      console.warn(`[Seed Resources] Topic '${item.topicSlug}' not found! Skipping resource '${item.title}'`);
      continue;
    }

    const resourceData = {
      topic: parentTopic._id,
      title: item.title,
      url: item.url,
      type: item.type,
      description: item.description,
      author: item.author,
      order: item.order,
      isFree: item.isFree,
      published: true,
    };

    const existing = await Resource.findOne({
      topic: parentTopic._id,
      url: item.url,
    });

    if (existing) {
      console.log(`[Seed Resources] Resource '${item.title}' already exists. Updating...`);
      await Resource.findByIdAndUpdate(existing._id, resourceData, { new: true });
    } else {
      console.log(`[Seed Resources] Creating resource: '${item.title}' for topic: ${item.topicSlug}`);
      await Resource.create(resourceData);
    }
  }

  const count = await Resource.countDocuments();
  console.log(`[Seed Resources] Successfully seeded. Total resources in DB: ${count}`);

  if (disconnectAfter) {
    await mongoose.disconnect();
  }
}

// Execute if run directly from CLI
if (process.argv[1] && process.argv[1].endsWith('seedResources.js')) {
  seedResources(true)
    .then(() => {
      console.log('[Seed Resources] Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed Resources Error]:', err);
      process.exit(1);
    });
}
