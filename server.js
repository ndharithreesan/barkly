const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const bodyParser = require('body-parser');

const start = options => {
  return new Promise((resolve, reject) => {
    const port = options.port || 8000;
    const app = express();
    app.use(morgan('dev'));
    app.use(helmet());
    app.use(bodyParser.json({ extended: true }));
    app.use((err, req, res, next) => {
      reject(new Error('The server experienced an error: ' + err));
      res.status(500).send('The server experienced an error');
    });

    const url = 'mongodb://localhost:27017';
    const dbName = 'service-reservations';
    const client = new MongoClient(url);

    client.connect(err => {
      assert.equal(null, err);
      console.log('Connected to db server');

      const db = client.db(dbName);
      require('./api/api')(app, db);
    });
    const server = app.listen(port, () => resolve(server));
  });
};

module.exports = Object.assign({}, { start });
