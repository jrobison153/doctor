require('babel-register');
require('babel-polyfill');
const server = require('../src/server');
const testServiceCreator = require('./testServiceCreator');

console.log(testServiceCreator);

testServiceCreator().then((testService) => {

  server.start(testService);
}, () => {

  console.error('Failed to create test service, aborting...');
});

