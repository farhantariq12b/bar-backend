
const whitelist = ['http://localhost:3000', 'http://127.0.0.1:3000'];
exports.corsOptions = {
  origin(origin, callback) {
    if (whitelist.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200
};