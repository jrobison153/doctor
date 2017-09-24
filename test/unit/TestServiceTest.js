
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import TestService from '../../src/TestService';
import UnhealthyDataSourceStub from '../stub/UnhealthyDataSourceStub';
import HealthyDataSourceSpy from '../spy/HealthyDataSourceSpy';
import UnavailableHopperIntegrationStub from '../stub/UnavailableHopperIntegrationStub';
import AvailableHopperIntegrationStub from '../stub/AvailableHopperIntegrationStub';
import NoUpdatedTickersDataSourceSpy from '../spy/NoUpdatedTickersDataSourceSpy';
import SomeUpdatedTickersDataSourceSpy from '../spy/SomeUpdatedTickersDataSourceSpy';

chai.use(chaiAsPromised);

describe('TestService Tests', () => {

  const retryOptions = {
    attempts: 4,
    wait: 1,
  };

  describe('when running a passing test', () => {

    let healthyDataSourceSpy;

    it('then the promise is resolved', () => {

      healthyDataSourceSpy = new HealthyDataSourceSpy();
      const availableHopperIntegrationStub = new AvailableHopperIntegrationStub();
      const testService = new TestService(healthyDataSourceSpy, availableHopperIntegrationStub, retryOptions);

      const testDonePromise = testService.test();

      return expect(testDonePromise).to.eventually.be.fulfilled;
    });

    it('does not retry when data found immediately', async () => {

      expect(healthyDataSourceSpy.findAllUpdatedTickersCallCount).to.equal(1);
    });

  });

  describe('when test data fails to load', () => {

    it('then the test fails with a rejected promise', () => {

      const unhealthyDataSourceStub = new UnhealthyDataSourceStub();
      const availableHopperIntegrationStub = new AvailableHopperIntegrationStub();
      const testService = new TestService(unhealthyDataSourceStub, availableHopperIntegrationStub, retryOptions);

      const testDonePromise = testService.test();

      return expect(testDonePromise).to.eventually.be.rejected;
    });
  });

  describe('when the connection to Hopper fails', () => {

    it('then the test fails with a rejected promise', () => {

      const healthyDataSourceStub = new HealthyDataSourceSpy();
      const unavailableHopperIntegrationStub = new UnavailableHopperIntegrationStub();
      const testService = new TestService(healthyDataSourceStub, unavailableHopperIntegrationStub, retryOptions);

      const testDonePromise = testService.test();

      return expect(testDonePromise).to.eventually.be.rejected;
    });
  });

  describe('when updated tickers do not end up in the database', () => {

    let noUpdatedTickersDataSourceSpy;
    let testService;
    let availableHopperIntegrationStub;

    beforeEach(() => {

      noUpdatedTickersDataSourceSpy = new NoUpdatedTickersDataSourceSpy();
      availableHopperIntegrationStub = new AvailableHopperIntegrationStub();

      testService = new TestService(noUpdatedTickersDataSourceSpy, availableHopperIntegrationStub, retryOptions);
    });

    it('then the test fails with a rejected promise', () => {

      const testDonePromise = testService.test();

      return expect(testDonePromise).to.eventually.be.rejected;
    });

    it('retries the provided number of times before giving up', () => {

      return testService.test().then(() => {

        expect(true).to.equal(false, 'Promise should have been rejected');
      }, () => {

        expect(noUpdatedTickersDataSourceSpy.findAllUpdatedTickersCallCount).to.equal(4);
      });
    });

    it('retries the default number of times before giving up if attempts not provided', (done) => {

      testService = new TestService(noUpdatedTickersDataSourceSpy, availableHopperIntegrationStub, { wait: 1 });

      testService.test().then(() => {

        expect(true).to.equal(false, 'Promise should have been rejected');
        done();
      }, () => {

        expect(noUpdatedTickersDataSourceSpy.findAllUpdatedTickersCallCount).to.equal(10);
        done();
      });
    });
  });

  describe('when some updated tickers do not have a chromosome in the database', () => {

    let someUpdatedTickersDataSourceStub;
    let testService;

    beforeEach(() => {

      someUpdatedTickersDataSourceStub = new SomeUpdatedTickersDataSourceSpy();
      const availableHopperIntegrationStub = new AvailableHopperIntegrationStub();
      testService = new TestService(
        someUpdatedTickersDataSourceStub, availableHopperIntegrationStub, retryOptions);
    });

    it('then the test fails with a rejected promise', () => {

      const testDonePromise = testService.test();

      return expect(testDonePromise).to.eventually.be.rejected;
    });

    it('retries the provided number of times before giving up', () => {

      return testService.test().then(() => {

        expect(true).to.equal(false, 'Promise should have been rejected');
      }, () => {

        expect(someUpdatedTickersDataSourceStub.findAllUpdatedTickersCallCount).to.equal(4);
      });
    });
  });
});
