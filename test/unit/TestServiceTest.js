/* eslint-disable no-unused-expressions,no-use-before-define */

import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import TestService from '../../src/TestService';
import UnhealthyDataSourceStub from '../stub/UnhealthyDataSourceStub';
import HealthyDataSourceSpy from '../spy/HealthyDataSourceSpy';
import UnavailableHopperIntegrationStub from '../stub/UnavailableHopperIntegrationStub';
import AvailableHopperIntegrationStub from '../stub/AvailableHopperIntegrationStub';
import NoUpdatedTickersDataSourceSpy from '../spy/NoUpdatedTickersDataSourceSpy';
import SomeUpdatedTickersDataSourceSpy from '../spy/SomeUpdatedTickersDataSourceSpy';
import EventHandlerSpy from '../spy/EventHandlerSpy';

chai.use(chaiAsPromised);

describe('TestService Tests', () => {

  const retryOptions = {
    attempts: 4,
    wait: 1,
  };

  let eventHandlerSpy;

  beforeEach(() => {

    eventHandlerSpy = new EventHandlerSpy();
  });

  describe('when ticker decoration is successful', () => {

    let healthyDataSourceSpy;
    let testService;

    beforeEach(() => {

      healthyDataSourceSpy = new HealthyDataSourceSpy();
      const availableHopperIntegrationStub = new AvailableHopperIntegrationStub();
      testService = new TestService(
        healthyDataSourceSpy, availableHopperIntegrationStub, eventHandlerSpy, retryOptions);
    });

    it('then the promise is resolved', () => {

      const testDonePromise = testService.test();

      return expect(testDonePromise).to.eventually.be.fulfilled;
    });

    it('does not retry when data found immediately', async () => {

      await testService.test();

      expect(healthyDataSourceSpy.findAllUpdatedTickersCallCount).to.equal(1);
    });

    it('returns a test result message', async () => {

      const results = await testService.test();

      const decorationResult = results.find(findResultByName('Ticker Decoration'));

      expect(decorationResult.msg).to.match(/Test Passed.*/);
    });

    it('returns a test success status of true', async () => {

      const results = await testService.test();

      const decorationResult = results.find(findResultByName('Ticker Decoration'));

      expect(decorationResult.success).to.be.true;
    });
  });

  describe('when test data fails to load', () => {

    it('then the test fails with a success status of false', async () => {

      const unhealthyDataSourceStub = new UnhealthyDataSourceStub();
      const availableHopperIntegrationStub = new AvailableHopperIntegrationStub();
      const testService = new TestService(
        unhealthyDataSourceStub, availableHopperIntegrationStub, eventHandlerSpy, retryOptions);

      const results = await testService.test();

      const decorationResult = results.find(findResultByName('Ticker Decoration'));

      expect(decorationResult.success).to.be.false;
    });
  });

  describe('when the connection to Hopper fails', () => {

    it('then the test fails with a success status of false', async () => {

      const healthyDataSourceStub = new HealthyDataSourceSpy();
      const unavailableHopperIntegrationStub = new UnavailableHopperIntegrationStub();
      const testService = new TestService(
        healthyDataSourceStub, unavailableHopperIntegrationStub, eventHandlerSpy, retryOptions);

      const results = await testService.test();

      const decorationResult = results.find(findResultByName('Ticker Decoration'));

      return expect(decorationResult.success).to.be.false;
    });
  });

  describe('when updated tickers do not end up in the database', () => {

    let noUpdatedTickersDataSourceSpy;
    let testService;
    let availableHopperIntegrationStub;

    beforeEach(() => {

      noUpdatedTickersDataSourceSpy = new NoUpdatedTickersDataSourceSpy();
      availableHopperIntegrationStub = new AvailableHopperIntegrationStub();

      testService = new TestService(
        noUpdatedTickersDataSourceSpy, availableHopperIntegrationStub, eventHandlerSpy, retryOptions);
    });

    it('returns a test result message', async () => {

      const results = await testService.test();

      const decorationResult = results.find(findResultByName('Ticker Decoration'));

      expect(decorationResult.msg).to.match(/Test Failed.*/);
    });

    it('returns a test success status of false', async () => {

      const results = await testService.test();

      const decorationResult = results.find(findResultByName('Ticker Decoration'));

      expect(decorationResult.success).to.be.false;
    });

    it('retries the provided number of times before giving up', async () => {

      await testService.test();

      expect(noUpdatedTickersDataSourceSpy.findAllUpdatedTickersCallCount).to.equal(4);
    });

    it('retries the default number of times before giving up if attempts not provided', async () => {

      testService = new TestService(
        noUpdatedTickersDataSourceSpy, availableHopperIntegrationStub, eventHandlerSpy, { wait: 1 });

      await testService.test();

      expect(noUpdatedTickersDataSourceSpy.findAllUpdatedTickersCallCount).to.equal(10);

    });
  });

  describe('when some updated tickers do not have a chromosome in the database', () => {

    let someUpdatedTickersDataSourceStub;
    let testService;

    beforeEach(() => {

      someUpdatedTickersDataSourceStub = new SomeUpdatedTickersDataSourceSpy();
      const availableHopperIntegrationStub = new AvailableHopperIntegrationStub();
      testService = new TestService(
        someUpdatedTickersDataSourceStub, availableHopperIntegrationStub, eventHandlerSpy, retryOptions);
    });

    it('then the test fails with a success status set to false', async () => {

      const results = await testService.test();

      const decorationResult = results.find(findResultByName('Ticker Decoration'));

      return expect(decorationResult.success).to.be.false;
    });

    it('retries the provided number of times before giving up', async () => {

      await testService.test();

      expect(someUpdatedTickersDataSourceStub.findAllUpdatedTickersCallCount).to.equal(4);
    });
  });

  describe('when testing for events', () => {

    let healthyDataSourceSpy;
    let testService;

    beforeEach(() => {

      healthyDataSourceSpy = new HealthyDataSourceSpy();
      const availableHopperIntegrationStub = new AvailableHopperIntegrationStub();
      testService = new TestService(
        healthyDataSourceSpy, availableHopperIntegrationStub, eventHandlerSpy, retryOptions);
    });

    it('returns the expected number of batch processing started events to 1', async () => {

      const results = await testService.test();

      const eventResult = results.find(findResultByName('Batch Processing Started Event'));

      expect(eventResult.expected).to.equal(1);
    });

    describe('and test is passing', () => {

      it('returns the received number of batch processing started events to 1', async () => {

        eventHandlerSpy.handleEvent({ name: 'BATCH_TICKER_PROCESSING_STARTED' });

        const results = await testService.test();
        const eventResult = results.find(findResultByName('Batch Processing Started Event'));

        expect(eventResult.received).to.equal(1);
      });
    });

    describe('and test is failing because batch processing started event was not received', () => {

      it('returns the received number of batch processing started events to 0', async () => {

        const results = await testService.test();
        const eventResult = results.find(findResultByName('Batch Processing Started Event'));

        expect(eventResult.received).to.equal(0);
      });

      it('retries the specified number of times before giving up', async () => {

        await testService.test();

        expect(eventHandlerSpy.getBatchProcessingStartedEventsCallCount).to.equal(4);
      });
    });
  });
});

const findResultByName = (testName) => {

  return (aResult) => {

    return aResult.test && aResult.test === testName;
  };
};
