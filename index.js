const bodyParser = require('body-parser');
const { EventEmitter } = require('events');
const server = require('./server.js');
const mediator = new EventEmitter();

console.log('Starting Reservations Service');

process.on('uncaughtException', err => {
  console.error('Unhandled Exception', err);
});

process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Rejection', err);
});

server.start({}).then(app => {
  console.log('Server started on port: 8000');
});

mediator.emit('boot.ready');
