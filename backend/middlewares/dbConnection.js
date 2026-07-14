const mongoose = require('mongoose');

const dbConnectionMiddleware = async (req, res, next) => {
  try {
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (mongoose.connection.readyState !== 1) {
      console.log('🔄 Serverless cold start: Ensuring MongoDB connection in CareSync...');
      const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/doctor_appointment';
      await mongoose.connect(mongoURI);
      console.log('🚀 Database connected successfully in CareSync!');
    }
    next();
  } catch (err) {
    console.error('❌ Database connection error in CareSync:', err.message);
    next(err);
  }
};

module.exports = { dbConnectionMiddleware };
