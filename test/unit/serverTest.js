import requestPromise from 'request-promise';
import {expect} from 'chai';
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

      let testServiceStub;
      let response;
      let body;

      beforeEach(async () => {

        testServiceStub = new AlwaysPassingTestServiceStub();
        await server.start(testServiceStub);

        response = await requestPromise(requestOptions);

        body = JSON.parse(response.body);
      });

      afterEach(() => {

        server.stop();
      });

      it('then an HTTP status code 200 is returned', () => {

        expect(response.statusCode).to.equal(200);
      });

      it('a test status of passed is returned', () => {

        expect(body.testStatus).to.equal('passed');
      });

      it('returns the test result msg', () => {

        expect(body.msg).to.match(/.*AlwaysPassingTestServiceStub: of course the test passed/);
      });

      it('returns the test results summary', () => {

        expect(body.summary).to.deep.equal(testServiceStub.resultsSummary);
      });
    });

    describe('when a failing test is executed', () => {

      let testServiceStub;
      let response;
      let body;

      beforeEach(async () => {

        testServiceStub = new AlwaysFailingTestServiceStub();
        await server.start(testServiceStub);

        response = await requestPromise(requestOptions);

        body = JSON.parse(response.body);
      });

      afterEach(() => {

        server.stop();
      });

      it('then an HTTP status code 200 is returned', () => {

        expect(response.statusCode).to.equal(200);
      });

      it('a test status of failed is returned', () => {

        expect(body.testStatus).to.equal('failed');
      });

      it('returns the test results summary', () => {

        expect(body.summary).to.deep.equal(testServiceStub.resultsSummary);
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

