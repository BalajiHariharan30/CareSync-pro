const mongoose = require('mongoose');

const dbConnectionMiddleware = async (req, res, next) => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/doctor_appointment';
    
    // 1 = connected
    if (mongoose.connection.readyState !== 1) {
      console.log(`🔄 Database state is ${mongoose.connection.readyState}. Awaiting active connection...`);
      
      // Trigger connection (it will use existing pending connection if state is 2)
      mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000
      });
      
      // Explicitly wait for the connection to open
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Mongoose connection timed out (8000ms) in middleware'));
        }, 8000);
        
        mongoose.connection.once('connected', () => {
          clearTimeout(timeout);
          resolve();
        });
        
        mongoose.connection.once('error', (err) => {
          clearTimeout(timeout);
          reject(err);
        });
      });
      
      console.log('🚀 Database connection established successfully!');
    }
    
    next();
  } catch (err) {
    console.error('❌ Database connection error in CareSync:', err.message);
    res.status(500).json({ 
      message: 'Database connection failed: ' + err.message 
    });
  }
};

module.exports = { dbConnectionMiddleware };
