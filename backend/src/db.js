const { MongoClient } = require('mongodb');

const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/campus-connect';
const client = new MongoClient(uri);

let db = null;

async function connectDB() {
  try {
    if (!db) {
      await client.connect();
      db = client.db();
      console.log('MongoDB connected successfully');
    }
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function getDB() {
  if (!db) {
    await connectDB();
  }
  return db;
}

module.exports = {
  connectDB,
  getDB,
};

