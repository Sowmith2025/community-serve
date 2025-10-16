const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/community-service';
    
    const conn = await mongoose.connect(mongoURI);

    console.log('MongoDB Connected');
    console.log(`MongoDB Host: ${conn.connection.host}`);
    
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
