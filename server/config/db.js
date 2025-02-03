const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false); // Disable strict mode for queries
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true, // Ensure compatibility with MongoDB connection string
      useUnifiedTopology: true, // Use the new topology engine
    });
    console.log(`Database MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit the process with a failure code
  }
};

module.exports = connectDB;
