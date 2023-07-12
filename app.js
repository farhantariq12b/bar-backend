const express = require('express');
const setupApp = require('./src');
const connectDb = require('./src/db/mongo');
const logger = require('./src/helpers/logger');

const port = process.env.PORT || 9000;

const app = express();

async function setup() {
    setupApp(app);
    // Database connected
    await connectDb();

    app.use(express.static(`${__dirname}/uploads`));
}

setup();

module.exports = app.listen(port, () => {
    logger.info(`App is running on port: ${port}`);
});