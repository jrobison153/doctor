import requestPromise from 'request-promise';
import { expect } from 'chai';
import AlwaysPassingTestServiceStub from '../stub/AlwaysPassingTestServiceStub';
import AlwaysFailingTestServiceStub from '../stub/AlwaysFailingTestServiceStub';
import AlwaysSystemExceptionTestServiceStub from '../stub/AlwaysSystemExceptionTestServiceStub';

const server = require('../../src/server');

describe('Server Tests', () => {

  const requestOptions = {
    method: 'POST',
    uri: 'http://localhost:8080/test',
    resolveWithFullResponse: true,
  };

  describe('given a running server', () => {

    describe('when a successful test is executed', () => {

      beforeEach(() => {

        const testServiceStub = new AlwaysPassingTestServiceStub();
        return server.start(testServiceStub);
      });

      afterEach(() => {

        server.stop();
      });

      it('then an HTTP status code 200 is returned with a test status of passed', () => {

        return requestPromise(requestOptions).then((response) => {

          expect(response.statusCode).to.equal(200);

          const body = JSON.parse(response.body);

          expect(body.testStatus).to.equal('passed');
        });
      });
    });

    describe('when a failing test is executed', () => {

      beforeEach(() => {

        const testServiceStub = new AlwaysFailingTestServiceStub();
        return server.start(testServiceStub);
      });

      afterEach(() => {

        server.stop();
      });

      it('then an HTTP status code 200 is returned with a test status of failed', () => {

        return requestPromise(requestOptions).then((response) => {

          expect(response.statusCode).to.equal(200);

          const body = JSON.parse(response.body);

          expect(body.testStatus).to.equal('failed');
        });
      });
    });

    describe('when a test is executed and a system failure occurs', () => {

      beforeEach(() => {

        const testServiceStub = new AlwaysSystemExceptionTestServiceStub();
        return server.start(testServiceStub);
      });

      afterEach(() => {

        server.stop();
      });

      it('then an HTTP status code 500 is returned', () => {

        return requestPromise(requestOptions).then(() => {

          expect(false).to.equal(true, 'Test should have rejected the promise because of a returned 500 http status');
        }, (response) => {

          expect(response.statusCode).to.equal(500);
        });
      });
    });
  });
});

