const bodyParser = require('body-parser');
const { EventEmitter } = require('events');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const options = require('./config');

console.log('Starting Reservations Service');

process.on('uncaughtException', err => {
  console.log('Unhandled Exception', err);
});

process.on('unhandledRejection', (err, promise) => {
  console.log('Unhandled Rejection', err);
});

const dbName = 'service-reservations';
const client = new MongoClient(options.connectURL);

client.connect(err => {
  assert.equal(null, err);
  console.log('Connected to db server');
  db = client.db(options.db);
  const port = options.port;
  const app = express();
  app.use(morgan('dev'));
  app.use(helmet());
  app.use(bodyParser.json({ extended: true }));
  require('./api')(app, db);

  app.use((err, req, res, next) => {
    console.log('The server experienced an error: ' + err);
    res.status(500).send('The server experienced an error');
  });

  const server = app.listen(port, () => {
    console.log('Listening on port ' + port);
  });
});
