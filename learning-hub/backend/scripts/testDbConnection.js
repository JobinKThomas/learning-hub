import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { maskMongoURI, getMongoURI } from '../src/config/db.js';

async function testSingleConnection(name, uri) {
  console.log(`\n------------------------------------------------------------`);
  console.log(`Testing Connection: [${name}]`);
  console.log(`URI: ${maskMongoURI(uri)}`);

  if (!uri) {
    console.log(`Result: SKIPPED (No URI provided for ${name})`);
    return { name, status: 'SKIPPED' };
  }

  const startTime = Date.now();
  try {
    const conn = await mongoose.createConnection(uri, {
      serverSelectionTimeoutMS: 8000,
    }).asPromise();

    const latency = Date.now() - startTime;
    const db = conn.db;
    const pingRes = await db.command({ ping: 1 });
    const collections = await db.listCollections().toArray();

    console.log(`Status:      SUCCESS (Ping latency: ${latency}ms)`);
    console.log(`Host:        ${conn.host}`);
    console.log(`Port:        ${conn.port || 'default SRV'}`);
    console.log(`Database:    ${conn.name}`);
    console.log(`Collections: ${collections.length} collection(s) present`);

    if (collections.length > 0) {
      console.log('Collection counts:');
      for (const col of collections.slice(0, 5)) {
        const count = await db.collection(col.name).countDocuments();
        console.log(` - ${col.name}: ${count} document(s)`);
      }
      if (collections.length > 5) {
        console.log(` ... and ${collections.length - 5} more collections`);
      }
    }

    await conn.close();
    return { name, status: 'SUCCESS', latency, database: conn.name };
  } catch (error) {
    const latency = Date.now() - startTime;
    console.error(`Status:      FAILED (${latency}ms)`);
    console.error(`Error:       ${error.message}`);

    if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      console.error(`Troubleshooting Tip: Check your Atlas Database User username and password. Ensure special characters in password are URL-encoded.`);
    } else if (error.message.includes('querySrv') || error.message.includes('ECONNREFUSED') || error.message.includes('ServerSelectionError')) {
      console.error(`Troubleshooting Tip: Check Network Access in Atlas. Ensure your current IP is added to the IP Access List (or 0.0.0.0/0 for testing).`);
    }

    return { name, status: 'FAILED', error: error.message };
  }
}

async function main() {
  console.log('============================================================');
  console.log('         LEARNING HUB - MONGODB CONNECTION CHECK            ');
  console.log('============================================================');

  const targetArg = process.argv[2];

  if (targetArg && targetArg.startsWith('mongodb')) {
    await testSingleConnection('CLI Provided URI', targetArg);
    process.exit(0);
  }

  const devUri = process.env.MONGODB_URI_DEV || (process.env.NODE_ENV === 'development' ? process.env.MONGODB_URI : null);
  const prodUri = process.env.MONGODB_URI_PROD || (process.env.NODE_ENV === 'production' ? process.env.MONGODB_URI : null);
  const defaultUri = process.env.MONGODB_URI;

  console.log(`Environment (NODE_ENV): ${process.env.NODE_ENV || 'development'}`);

  // Test Dev
  if (process.env.MONGODB_URI_DEV) {
    await testSingleConnection('Development (MONGODB_URI_DEV)', process.env.MONGODB_URI_DEV);
  } else if (defaultUri && (!prodUri || defaultUri !== prodUri)) {
    await testSingleConnection('Development / Default (MONGODB_URI)', defaultUri);
  }

  // Test Prod
  if (process.env.MONGODB_URI_PROD) {
    await testSingleConnection('Production (MONGODB_URI_PROD)', process.env.MONGODB_URI_PROD);
  }

  console.log('\n============================================================\n');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error during connection check:', err);
  process.exit(1);
});
