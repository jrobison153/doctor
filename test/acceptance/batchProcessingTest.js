/* eslint-disable no-unused-expressions */
import requestPromise from 'request-promise';
import { expect } from 'chai';
import TestService from '../../src/TestService';
import TickerDataSource from '../../src/TickerDataSource';
import HopperIntegration from '../../src/HopperIntegration';
import mongoFake from '../../fake/mongo/mongoFake';
import RequestSpy from '../spy/RequestSpy';
import EventHandler from '../../src/EventHandler';
import RedisClientFake from '../../fake/redis/RedisClientFake';
import TickerDecorationTester from '../../src/TickerDecorationTester';
import BatchProcessingStartedTester from '../../src/BatchProcessingStartedTester';
import TickersDecoratedTester from '../../src/TickersDecoratedTester';

const server = require('../../src/server');

describe('Doctor Acceptance Tests', () => {

  const requestOptions = {
    method: 'POST',
    uri: 'http://localhost:8080/test',
    resolveWithFullResponse: true,
  };

  let eventHandler;
  let redisFake;

  before(() => {

    redisFake = new RedisClientFake();
    eventHandler = new EventHandler(redisFake);

    redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'BATCH_TICKER_PROCESSING_STARTED' }));

    redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'TICKER_DECORATED' }));
    redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'TICKER_DECORATED' }));
    redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'TICKER_DECORATED' }));
    redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'TICKER_DECORATED' }));
    redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'TICKER_DECORATED' }));
    redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'TICKER_DECORATED' }));
    redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'TICKER_DECORATED' }));
    redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'TICKER_DECORATED' }));
    redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'TICKER_DECORATED' }));
    redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'TICKER_DECORATED' }));
  });

  describe('given a healthy Kaching system where batch processing is successful', () => {

    describe('when a test is executed', () => {

      let response;
      let body;

      before(async () => {

        const dataSource = new TickerDataSource(mongoFake);

        await dataSource.connect();

        const requestSpy = new RequestSpy();
        const hopperIntegration = new HopperIntegration(requestSpy.request.bind(requestSpy));

        const decorationTester = new TickerDecorationTester(dataSource);
        const batchProcessingStartedTester = new BatchProcessingStartedTester(eventHandler);
        const tickersDecoratedTester = new TickersDecoratedTester(eventHandler);
        const testers = [];
        testers.push(decorationTester);
        testers.push(batchProcessingStartedTester);
        testers.push(tickersDecoratedTester);

        const retryOptions = {
          attempts: 5,
          wait: 300,
        };

        const testService = new TestService(dataSource, hopperIntegration, testers, retryOptions);

        await server.start(testService);

        response = await requestPromise(requestOptions);
        body = JSON.parse(response.body);

        return response;
      });

      after(() => {

        server.stop();
        mongoFake.reset();
      });

      it('returns an HTTP status code 200', () => {

        expect(response.statusCode).to.equal(200);
      });

      it('returns a test status of passed', () => {

        expect(body.testStatus).to.equal('passed');
      });

      it('returns the BATCH_TICKER_PROCESSING_STARTED event with a count of 1', () => {

        const testResult = body.results.find((result) => {

          return result.test === 'Batch Processing Started Event';
        });

        expect(testResult).to.be.ok;
        expect(testResult.success).to.be.true;
        expect(testResult.received).to.equal(1);
        expect(testResult.expected).to.equal(1);
      });

      it('returns the tickers decorated event test with a count equal to the number of tickers w/o a chromosome in db',
        () => {

          const testResult = body.results.find((result) => {

            return result.test === 'Tickers Decorated Events';
          });

          expect(testResult).to.be.ok;
          expect(testResult.success).to.be.true;
          expect(testResult.received).to.equal(10);
          expect(testResult.expected).to.equal(10);
        });

      describe('and the test is executed multiple times in a row', () => {

        before(async () => {

          redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'BATCH_TICKER_PROCESSING_STARTED' }));

          redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'TICKER_DECORATED' }));
          redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'TICKER_DECORATED' }));
          redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'TICKER_DECORATED' }));
          redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'TICKER_DECORATED' }));
          redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'TICKER_DECORATED' }));
          redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'TICKER_DECORATED' }));
          redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'TICKER_DECORATED' }));
          redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'TICKER_DECORATED' }));
          redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'TICKER_DECORATED' }));
          redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'TICKER_DECORATED' }));

          response = await requestPromise(requestOptions);
          body = JSON.parse(response.body);
        });

        it('continues to pass', () => {

          expect(body.testStatus).to.equal('passed');
        });
      });
    });
  });

  describe('given an unhealthy Kaching system where batch processing is unsuccessful', () => {

    describe('when a test is executed', () => {

      before(async () => {

        const fakeMongoDb = await mongoFake.MongoClient.connect();
        const fakeCollection = fakeMongoDb.collection();
        fakeCollection.setupForFailedDecoration();

        const dataSource = new TickerDataSource(mongoFake);

        await dataSource.connect();

        const requestSpy = new RequestSpy();
        const hopperIntegration = new HopperIntegration(requestSpy.request.bind(requestSpy));

        const decorationTester = new TickerDecorationTester(dataSource);
        const batchProcessingStartedTester = new BatchProcessingStartedTester(eventHandler);
        const testers = [];
        testers.push(decorationTester);
        testers.push(batchProcessingStartedTester);

        const retryOptions = {
          attempts: 2,
          wait: 10,
        };

        const testService = new TestService(dataSource, hopperIntegration, testers, retryOptions);
        return server.start(testService);
      });

      after(() => {

        server.stop();
        mongoFake.reset();
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

