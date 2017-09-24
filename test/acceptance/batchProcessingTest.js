import requestPromise from 'request-promise';
import { expect } from 'chai';
import TestService from '../../src/TestService';
import TickerDataSource from '../../src/TickerDataSource';
import HopperIntegration from '../../src/HopperIntegration';
import mongoFake from '../../fake/mongo/mongoFake';
import RequestSpy from '../spy/RequestSpy';

const server = require('../../src/server');

describe('Doctor Acceptance Tests', () => {

  const requestOptions = {
    method: 'POST',
    uri: 'http://localhost:8080/test',
    resolveWithFullResponse: true,
  };

  afterEach(() => {

    mongoFake.reset();
  });

  describe('given a healthy Kaching system where batch processing is successful', () => {

    describe('when a test is executed', () => {

      beforeEach(async () => {

        const dataSource = new TickerDataSource(mongoFake);

        await dataSource.connect();

        const requestSpy = new RequestSpy();
        const hopperIntegration = new HopperIntegration(requestSpy.request.bind(requestSpy));

        const testService = new TestService(dataSource, hopperIntegration);
        return server.start(testService);
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
  });

  describe('given an unhealthy Kaching system where batch processing is unsuccessful', () => {

    describe('when a test is executed', () => {

      beforeEach(async () => {

        const fakeMongoDb = await mongoFake.MongoClient.connect();
        const fakeCollection = fakeMongoDb.collection();
        fakeCollection.setupForFailedDecoration();

        const dataSource = new TickerDataSource(mongoFake);

        await dataSource.connect();

        const requestSpy = new RequestSpy();
        const hopperIntegration = new HopperIntegration(requestSpy.request.bind(requestSpy));

        const retryOptions = {
          attempts: 2,
          wait: 10,
        };

        const testService = new TestService(dataSource, hopperIntegration, retryOptions);
        return server.start(testService);
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
  });
});

