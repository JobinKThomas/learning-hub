import mongoose from 'mongoose';

const readyStates = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

/**
 * Connect to MongoDB database
 */
export const connectDB = async (uri = process.env.MONGODB_URI) => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not defined.');
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
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
