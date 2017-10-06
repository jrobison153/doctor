require('babel-register');
require('babel-polyfill');
const server = require('../src/server');
const testServiceCreator = require('./testServiceCreator');

testServiceCreator().then((testService) => {

  server.start(testService);
}, (e) => {

  console.error(e);
  console.error('Failed to create test service, aborting...');
});

