const { MongoClient, ServerApiVersion } = require('mongodb');

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  const uri = process.env.DATABASE_URL;

  if (!uri) {
    throw new Error('Please add your Mongo URI to your environment variables');
  }

  // If we have a cached connection, reuse it
  if (cachedClient && cachedDb) {
    return cachedDb;
  }

  // If not, create a new connection
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    ssl: true,
    sslValidate: true,
    maxPoolSize: 1,
    minPoolSize: 0,
    maxIdleTimeMS: 5000,
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 10000,
    retryWrites: true,
    retryReads: true,
    w: "majority"
  });

  try {
    await client.connect();
    const db = client.db();

    // Cache the connection for future requests
    cachedClient = client;
    cachedDb = db;

    console.log('MongoDB connected successfully');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Do not exit the process, just throw the error
    throw error;
  }
}

// Renaming getDB to be more explicit for reuse
async function getDB() {
  return await connectToDatabase();
}

module.exports = {
  getDB,
};

