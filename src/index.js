const cookieParser = require('cookie-parser');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const logger = require('./helpers/logger');

const routes = require('./routes');
const { successResponse, errorResponse } = require('./helpers/http_response');
const { newHttpError } = require('./errors/error');
const { corsOptions } = require('../config/app/cors');


const setupApp = (app) => {
  // Rest API security
  app.use(helmet({
    crossOriginResourcePolicy: false
  }));

  // request methods
  app.use(express.json({ limit: '30mb' }));
  app.use(express.urlencoded({ extended: false, limit: '30mb' }));

  app.use(cookieParser());

  // cors and logs
  app.options(corsOptions);
  app.use(cors(corsOptions));
  app.use(morgan('combined', { stream: logger.stream }));

  app.use(routes);

  process.on('uncaughtException', (reason, promise) => {
    logger.error(
      `Uncaught Exception due to: ${reason}`,
      promise
    );
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error(
      `Unhandled Rejection due to: ${reason}`,
      promise
    );
  });

  global.successResponse = successResponse;
  global.errorResponse = errorResponse;
  global.newHttpError = newHttpError;
  global.logger = logger;
};

module.exports = setupApp;
