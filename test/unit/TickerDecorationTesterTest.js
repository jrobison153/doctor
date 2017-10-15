/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import HealthyDataSourceSpy from '../spy/HealthyDataSourceSpy';
import TickerDecorationTester from '../../src/TickerDecorationTester';

chai.use(chaiAsPromised);
describe('TickerDecorationTester Tests', () => {

  let healthyDataSourceSpy;
  let tickerDecorationTest;

  describe('when checking the result', () => {

    it('returns any tickers found in the datasource', async () => {

      healthyDataSourceSpy = new HealthyDataSourceSpy();
      tickerDecorationTest = new TickerDecorationTester(healthyDataSourceSpy);

      const foundTickers = await tickerDecorationTest.checkResult();

      expect(foundTickers).to.deep.equal(HealthyDataSourceSpy.tickersToReturn);
    });
  });

  describe('when validating test pass/fail status', () => {

    const fullyDecoratedTickers = [
      {
        chromosome: 'abc',
      },
      {
        chromosome: 'abc',
      },
      {
        chromosome: 'abc',
      },
      {
        chromosome: 'abc',
      },
      {
        chromosome: 'abc',
      },
      {
        chromosome: 'abc',
      },
      {
        chromosome: 'abc',
      },
      {
        chromosome: 'abc',
      },
      {
        chromosome: 'abc',
      },
      {
        chromosome: 'abc',
      },
    ];

    const partialyDecoratedTickers = [
      {
        chromosome: 'abc',
      },
      {
        chromosome: 'abc',
      },
      {
      },
      {
        chromosome: 'abc',
      },
      {
        chromosome: 'abc',
      },
      {
        chromosome: 'abc',
      },
      {
        chromosome: 'abc',
      },
      {
        chromosome: 'abc',
      },
      {
      },
      {
        chromosome: 'abc',
      },
    ];

    beforeEach(() => {

      healthyDataSourceSpy = new HealthyDataSourceSpy();
      tickerDecorationTest = new TickerDecorationTester(healthyDataSourceSpy);

    });

    it('returns true when ten tickers are found', () => {

      const result = tickerDecorationTest.isPassingResult(fullyDecoratedTickers);
      expect(result).to.be.true;
    });

    it('returns false when ten tickers are not found', () => {
      const tickers = [
        {
        },
        {
        },
      ];

      const result = tickerDecorationTest.isPassingResult(tickers);
      expect(result).to.be.false;
    });

    it('returns false if no tickers are provided', () => {

      const result = tickerDecorationTest.isPassingResult(undefined);
      expect(result).to.be.false;
    });

    it('returns false if all tickers do not have a chromosome', () => {

      const result = tickerDecorationTest.isPassingResult(partialyDecoratedTickers);
      expect(result).to.be.false;
    });
  });

  describe('when building a passing result object', () => {

    let passingResultObject;

    beforeEach(() => {

      healthyDataSourceSpy = new HealthyDataSourceSpy();
      tickerDecorationTest = new TickerDecorationTester(healthyDataSourceSpy);

      passingResultObject = tickerDecorationTest.processPassingResult();
    });

    it('returns an object with the test property set to the name of this test', () => {

      expect(passingResultObject.test).to.equal('Ticker Decoration');
    });

    it('returns an object with success property set to true', () => {

      expect(passingResultObject.success).to.be.true;
    });

    it('returns an object with a msg property set to Test Passed', () => {

      expect(passingResultObject.msg).to.match(/Test Passed/);
    });
  });

  describe('when building a failing result object', () => {

    let passingResultObject;

    beforeEach(() => {

      healthyDataSourceSpy = new HealthyDataSourceSpy();
      tickerDecorationTest = new TickerDecorationTester(healthyDataSourceSpy);

      passingResultObject = tickerDecorationTest.processFailingResult();
    });

    it('returns an object with the test property set to the name of this test', () => {

      expect(passingResultObject.test).to.equal('Ticker Decoration');
    });

    it('returns an object with success property set to false', () => {

      expect(passingResultObject.success).to.be.false;
    });

    it('returns an object with a msg property set to Test Failed', () => {

      expect(passingResultObject.msg).to.match(/Test Failed/);
    });
  });
});

