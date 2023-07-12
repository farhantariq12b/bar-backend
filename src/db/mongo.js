const mongoose = require('mongoose');
/* global logger:readonly */
const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info("'Database connected'");
  } catch (e) {
    logger.error('database error', e);
  }
};

module.exports = connectDb;
