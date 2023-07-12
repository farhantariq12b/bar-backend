const winston = require('winston');

const level = process.env.LOG_LEVEL || 'info';
const silent = process.env.NODE_ENV === 'production';

// const loggerFormat = winston.format.printf(({ level, message, timestamp }) => `{"level": "${level}", "timestamp": "${timestamp}", "message": "${message}"}`);

const loggerWithColorAndTime = winston.format.combine(
	winston.format.json(),
	winston.format.timestamp(),
	winston.format.errors({ stack: true }),
	winston.format.metadata(),
	winston.format.printf((info) => {
		const {
			timestamp,
			level,
			message,
			metadata: { timestamp: metaTimestamp, ...metadata },
		} = info;
		let { models } = metadata;
		if (models && !Array.isArray(models)) {
			models = [models];
		}
		if (models) {
			const maskableKeys = ['password', 'masterKey', 'devicePicture'];
			models = models
				.filter((model) => !!model.toJSON)
				.map((model) => {
					const data = model.toJSON();
					maskableKeys.forEach((key) => {
						if (data[key]) data[key] = '############';
					});
					return data;
				});
			if (models.length === 1) {
				models = [...models[0]];
			}
		}
		const ts = (timestamp || metaTimestamp).slice(0, 19).replace('T', ' ');
		const payload = {
			message,
		};
		if (models && models.length) {
			payload.models = models;
		}
		if (metadata && Object.keys(metadata).length) {
			payload.metadata = metadata;
		}
		return `{"level": "${level}", "timestamp": "${ts}", "message": "${JSON.stringify(payload)}"}`;
	}),
	winston.format.colorize({ all: true }),
);

const transports = [
	new winston.transports.Console({
		level,
		format: loggerWithColorAndTime,
	}),
];

const logger = winston.createLogger({
	level,
	format: loggerWithColorAndTime,
	transports,
	exitOnError: false,
	silent,
});

// Allow morgan middleware to write to winston
const stream = {
	write: (message) => {
		logger.info(message.trim());
	},
};

if (require.main === module) {
	const obj = { _id: '123', a: { b: 1, c: { d: [1, 2, 3, 4], e: { _id: '456', name: 'child' } } } };
	const error = new Error('Something bad happened');
	logger.info('Information message with object', { obj, models: [{}, {}] });
	logger.info('Information message with error', error);
	logger.warn('Warning message with object', { obj, models: [{}, {}] });
	logger.warn('Warning message with error', error);
	logger.error('Error message with object', { obj, models: [{}, {}] });
	logger.error('Error message with error', error);
	logger.error('Error occurs:', error);
}


exports.logger = logger;

module.exports = logger;
module.exports.stream = stream;