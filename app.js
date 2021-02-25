'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const { sequelize } = require('./models');
const routes = require('./routes/routes');

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// ------------------------------------------
// Import sequelize from models/index.js
// ------------------------------------------


// create the Express app
const app = express();

// ------------------------------------------
// ASYNCHRONOUSLY CONNECT TO THE DATABASE
// ------------------------------------------
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection success!');

    /* Sync the model with the database */
    await sequelize.sync();
  } catch (err) {

    console.log('Error while connecting to the database: ', err);
  }
})();

// ------------------------------------------
// Request JSON body parsing
// ------------------------------------------
app.use(express.json());

// setup morgan which gives us http request logging
app.use(morgan('dev'));

// ------------------------------------------
// ADD ROUTES
// ------------------------------------------
app.use('/api', routes);

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
