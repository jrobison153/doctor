import restify from 'restify';
import batchTest from './batchProcessing';

const port = process.env.PORT || 8080;
let restifyServer = null;

restifyServer = restify.createServer();

restifyServer.listen(port, () => {

  console.info(`${restifyServer.name} listening at ${restifyServer.url}`);
});

restifyServer.post('/test', (req, resp) => {

  batchTest.test().then((msg) => {

    resp.send(`Test completed: ${msg}`);
  }, (e) => {

    console.error(e);
    resp.send('Test failed, check logs for details');
  });
});
