import mongoose from 'mongoose';

const readyStates = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

/**
 * Safely masks database credentials from connection strings for logging
 */
export const maskMongoURI = (uri) => {
  if (!uri) return 'undefined';
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
};

const hasPlaceholder = (val) => typeof val === 'string' && (val.includes('<db_password>') || val.includes('<password>'));

/**
 * Resolves the appropriate MongoDB connection string based on NODE_ENV
 */
export const getMongoURI = () => {
  const env = (process.env.NODE_ENV || 'development').toLowerCase();

  let targetUri;
  if (env === 'production') {
    targetUri = process.env.MONGODB_URI_PROD || process.env.MONGO_URI_PROD;
  } else if (env === 'development') {
    targetUri = process.env.MONGODB_URI_DEV || process.env.MONGO_URI_DEV;
  } else if (env === 'test') {
    targetUri = process.env.MONGODB_URI_TEST || process.env.MONGO_URI_TEST;
  }

  // Fallback to general URI
  const fallbackUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (targetUri) {
    if (hasPlaceholder(targetUri)) {
      console.warn(
        `[MongoDB] Warning: Target ${env.toUpperCase()} URI contains '<db_password>'. Please replace it with your actual MongoDB Atlas password in .env.`
      );
      if (fallbackUri && !hasPlaceholder(fallbackUri)) {
        console.warn(`[MongoDB] Falling back to: ${maskMongoURI(fallbackUri)}`);
        return fallbackUri;
      }
    }
    return targetUri;
  }

  return fallbackUri;
};

/**
 * Connect to MongoDB database
 */
export const connectDB = async (uri = getMongoURI()) => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!uri) {
    const env = process.env.NODE_ENV || 'development';
    throw new Error(
      `MongoDB URI is not defined for environment '${env}'. Please set MONGODB_URI or MONGODB_URI_${env.toUpperCase()} in your environment.`
    );
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    const masked = maskMongoURI(uri);
    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}/${conn.connection.name} (${masked})`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    throw error;
  }
};

/**
 * Returns the current status of MongoDB connection
 */
export const getDbStatus = () => {
  const stateCode = mongoose.connection.readyState;
  return {
    state: readyStates[stateCode] || 'unknown',
    code: stateCode,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  };
};

/**
 * Disconnect from MongoDB
 */
export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('[MongoDB] Disconnected.');
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Connection lost.');
});

mongoose.connection.on('reconnected', () => {
  console.log('[MongoDB] Connection restored.');
});
