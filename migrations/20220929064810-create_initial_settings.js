const logger = require('../src/helpers/logger');

module.exports = {
	async up(db /* client */) {
		return db.collection('general_settings').insertOne({
			phone: '111-002-002',
			email: 'info@packagingden.com',
			social: {},
		}, (err) => {
			if (err) {
				logger.error(err);
			}
			logger.info('Settings inserted');
		});
	},

	async down(/* db, client */) {
		// TODO write the statements to rollback your migration (if possible)
		// Example:
		// await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
	},
};
