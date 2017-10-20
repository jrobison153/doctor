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

  server.get('/health', (req, resp) => {

    resp.send('ok');
  });

  server.post('/test', (req, resp) => {

    try {
      testService.test().then((results) => {

        replyTestSuccessful(resp, results);
      });
    } catch (error) {

      replySystemException(resp, error);
    }
  });
}

function replyTestSuccessful(resp, results) {

  const isExistingFailingTest = results.some((result) => {

    return result.success === false;
  });

  const response = {
    testStatus: isExistingFailingTest ? 'failed' : 'passed',
    results,
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
