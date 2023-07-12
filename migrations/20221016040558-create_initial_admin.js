const bcrypt = require('bcrypt');
const { DEFAULT_SALT } = require('../src/helpers/constants');
const logger = require('../src/helpers/logger');

module.exports = {
  async up(db /* client */) {
    const password = await bcrypt.hash('Password@123!', DEFAULT_SALT);
    return db.collection('users').insertOne({
      name: 'Admin',
      email: 'admin@bar.com',
      password,
      default: true,
      isActive: true
    }, (error) => {
      if (error) {
        logger.error(error);
      } else {
        logger.info('User Inserted');
      }

    });
  },

  async down(/* db, client */) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
