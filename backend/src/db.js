const { MongoClient } = require('mongodb');

const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/campus-connect';
const client = new MongoClient(uri);

let db = null;

async function connectDB() {
  try {
    if (!db) {
      await client.connect();
      db = client.db();
      console.log('Connected to MongoDB');
    }
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

function getDB() {
  if (!db) {
    throw new Error('Database not connected. Call connectDB first.');
  }
  return db;
}

module.exports = { connectDB, getDB };
