/* eslint-disable no-unused-expressions,no-use-before-define */

import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import TestService from '../../src/TestService';
import RetryableTestCommandSpy from '../spy/RetryableTestCommandSpy';
import HealthyDataSourceSpy from '../spy/HealthyDataSourceSpy';
import UnhealthyDataSourceStub from '../stub/UnhealthyDataSourceStub';
import AvailableHopperIntegrationStub from '../stub/AvailableHopperIntegrationStub';
import UnavailableHopperIntegrationStub from '../stub/UnavailableHopperIntegrationStub';

chai.use(chaiAsPromised);

describe('TestService Tests', () => {

  let testResults;
  let firstTest;
  let secondTest;

  const retryOptions = {
    attempts: 4,
    wait: 1,
  };

  describe('when running test suite that passes immediately', () => {

    beforeEach(async () => {

      const testSuite = [];
      firstTest = new RetryableTestCommandSpy('First Test');
      secondTest = new RetryableTestCommandSpy('Second Test');
      testSuite.push(firstTest);
      testSuite.push(secondTest);

      const hopperIntegration = new AvailableHopperIntegrationStub();
      const dataSource = new HealthyDataSourceSpy();

      const testService = new TestService(dataSource, hopperIntegration, testSuite, retryOptions);

      testResults = await testService.test();
    });

    it('returns the result for the first test', async () => {

      const decorationResult = testResults.find(findResultByName('First Test'));

      expect(decorationResult).to.be.ok;
    });

    it('returns the result for the second test', async () => {

      const decorationResult = testResults.find(findResultByName('Second Test'));

      expect(decorationResult).to.be.ok;
    });

    it('does not retry the command', () => {

      expect(firstTest.validationCallCount).to.equal(1);
      expect(secondTest.validationCallCount).to.equal(1);
    });
  });

  describe('when running a failing test suite', () => {

    let hopperIntegration;
    let dataSource;
    let testSuite;

    beforeEach(async () => {

      testSuite = [];
      firstTest = new RetryableTestCommandSpy('First Test');
      firstTest.isFailing = true;
      testSuite.push(firstTest);

      hopperIntegration = new AvailableHopperIntegrationStub();
      dataSource = new HealthyDataSourceSpy();
    });

    it('retries the validation of each test the specified number of times before giving up', async () => {

      const testService = new TestService(dataSource, hopperIntegration, testSuite, retryOptions);

      testResults = await testService.test();

      expect(firstTest.validationCallCount).to.equal(4);
    });

    it('retries the default number of times before giving up', async () => {

      const testService = new TestService(dataSource, hopperIntegration, testSuite, { wait: 1 });

      testResults = await testService.test();

      expect(firstTest.validationCallCount).to.equal(10);
    });
  });

  describe('when running a test suite that eventually passes', () => {

    beforeEach(async () => {

      const testSuite = [];
      firstTest = new RetryableTestCommandSpy('First Test');
      firstTest.retryTimes = 3;
      testSuite.push(firstTest);


      const hopperIntegration = new AvailableHopperIntegrationStub();
      const dataSource = new HealthyDataSourceSpy();

      const testService = new TestService(dataSource, hopperIntegration, testSuite, retryOptions);

      testResults = await testService.test();
    });

    it('retries a few times before passing', () => {

      expect(firstTest.validationCallCount).to.equal(3);
    });
  });

  describe('when test data fails to load', () => {

    it('then the test fails with a success status of false', async () => {

      const unhealthyDataSourceStub = new UnhealthyDataSourceStub();
      const availableHopperIntegrationStub = new AvailableHopperIntegrationStub();
      const testService = new TestService(
        unhealthyDataSourceStub, availableHopperIntegrationStub, [], retryOptions);

      testResults = await testService.test();

      expect(testResults[0].success).to.be.false;
    });
  });

  describe('when the connection to Hopper fails', () => {

    it('then the test fails with a success status of false', async () => {

      const healthyDataSourceStub = new HealthyDataSourceSpy();
      const unavailableHopperIntegrationStub = new UnavailableHopperIntegrationStub();
      const testService = new TestService(
        healthyDataSourceStub, unavailableHopperIntegrationStub, [], retryOptions);

      const results = await testService.test();

      return expect(results[0].success).to.be.false;
    });
  });

  // describe('when testing for ticker decorated events', () => {
  //
  //   let healthyDataSourceSpy;
  //   let testService;
  //
  //   beforeEach(() => {
  //
  //     healthyDataSourceSpy = new HealthyDataSourceSpy();
  //     const availableHopperIntegrationStub = new AvailableHopperIntegrationStub();
  //     testService = new TestService(
  //       healthyDataSourceSpy, availableHopperIntegrationStub, eventHandlerSpy, retryOptions);
  //   });
  //
  //   it('returns the expected number of events', async () => {
  //
  //     const results = await testService.test();
  //
  //     const eventResult = results.find(findResultByName('Ticker Decorated Events'));
  //
  //     expect(eventResult.expected).to.equal(3);
  //   });
  //
  //   describe('and test is passing', () => {
  //
  //     it('returns the received number of events', async () => {
  //
  //       eventHandlerSpy.handleEvent({ name: 'TICKER_DECORATED' });
  //       eventHandlerSpy.handleEvent({ name: 'TICKER_DECORATED' });
  //       eventHandlerSpy.handleEvent({ name: 'TICKER_DECORATED' });
  //
  //       const results = await testService.test();
  //       const eventResult = results.find(findResultByName('Ticker Decorated Events'));
  //
  //       expect(eventResult.received).to.equal(3);
  //     });
  //   });
  //
  //   describe('and test is failing because batch processing started event was not received', () => {
  //
  //     it('returns the received number of events', async () => {
  //
  //       const results = await testService.test();
  //       const eventResult = results.find(findResultByName('Ticker Decorated Events'));
  //
  //       expect(eventResult.received).to.equal(0);
  //     });
  //
  //     it('retries the specified number of times before giving up', async () => {
  //
  //       await testService.test();
  //
  //       expect(eventHandlerSpy.getBatchProcessingStartedEventsCallCount).to.equal(4);
  //     });
  //   });
  // });
});

const findResultByName = (testName) => {

  return (aResult) => {

    return aResult.test && aResult.test === testName;
  };
};
