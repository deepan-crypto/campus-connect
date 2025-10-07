const { MongoClient, ServerApiVersion } = require('mongodb');

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  const uri = process.env.DATABASE_URL;

  if (!uri) {
    throw new Error('Please add your Mongo URI to your environment variables');
  }

  // If we have a cached connection and it's connected, reuse it
  if (cachedClient && cachedDb) {
    try {
      // Check if connection is still alive
      await cachedClient.db().command({ ping: 1 });
      return cachedDb;
    } catch (error) {
      // Connection is dead, clean up
      console.log('Cached connection is dead, creating new connection...');
      try {
        await cachedClient.close();
      } catch (e) {
        console.error('Error closing dead connection:', e);
      }
      cachedClient = null;
      cachedDb = null;
    }
  }

  // If not, create a new connection
  // Parse the connection string to get the host
  const parsedUri = new URL(uri);
  const host = parsedUri.host;

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    ssl: true,
    tlsAllowInvalidCertificates: false,
    tlsAllowInvalidHostnames: false,
    directConnection: false,
    maxPoolSize: 1,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    retryWrites: true,
    retryReads: true,
    monitorCommands: true,
    heartbeatFrequencyMS: 10000,
    appName: "campus-connect",
    driverInfo: { name: "nodejs-mongodb", version: "6.0" }
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

