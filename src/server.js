import restify from 'restify';
import batchTest from './TestService';

// TODO: replace default 8080 with portScanner
const port = process.env.PORT || 8080;

let restifyServer;

function start(testService) {

  restifyServer = restify.createServer();

  return new Promise((resolve) => {

    restifyServer.listen(port, () => {

      console.info(`${restifyServer.name} listening at ${restifyServer.url}`);

      const theTestService = testService || batchTest;

      configureResources(restifyServer, theTestService);

      resolve();
    });
  });
}

function stop() {

  restifyServer.close();
}

function configureResources(server, testService) {

  server.post('/test', (req, resp) => {

    try {
      testService.test().then((passResult) => {

        replyTestSuccessful(resp, passResult);
      }, (failResult) => {

        replyTestFailure(resp, failResult);
      });
    } catch (error) {

      replySystemException(resp, error);
    }
  });
}

function replyTestSuccessful(resp, result) {

  const response = {
    testStatus: 'passed',
    msg: `Test completed: ${result.msg}`,
    summary: result.summary,
  };

  resp.send(response);
}

function replyTestFailure(resp, e) {

  console.error(e);

  const response = {
    testStatus: 'failed',
    msg: 'Test failed, check logs for details',
    summary: e.summary,
  };

  resp.send(response);
}

function replySystemException(resp, error) {

  resp.status(500);
  resp.send(error);
}

module.exports = {
  start,
  stop,
};
