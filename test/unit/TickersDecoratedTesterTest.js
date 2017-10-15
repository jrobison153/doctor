/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import TickersDecoratedTester from '../../src/TickersDecoratedTester';
import EventHandlerSpy from '../spy/EventHandlerSpy';

describe('TickersDecoratedTester Tests', () => {

  let eventHandlerSpy;
  let tester;

  beforeEach(() => {

    eventHandlerSpy = new EventHandlerSpy();
    tester = new TickersDecoratedTester(eventHandlerSpy);
  });

  describe('when checking result', () => {

    it('returns all of the ticker decorated events from the event handler', () => {

      eventHandlerSpy.handleEvent({ name: 'TICKER_DECORATED' });
      eventHandlerSpy.handleEvent({ name: 'TICKER_DECORATED' });
      eventHandlerSpy.handleEvent({ name: 'TICKER_DECORATED' });
      eventHandlerSpy.handleEvent({ name: 'TICKER_DECORATED' });

      const tickerDecoratedEvents = tester.checkResult();

      expect(tickerDecoratedEvents).to.have.lengthOf(4);
    });
  });

  describe('when validating test pass/fail status', () => {

    const passingResult = [
      {
        name: 'TICKER_DECORATED',
      },
      {
        name: 'TICKER_DECORATED',
      },
      {
        name: 'TICKER_DECORATED',
      },
      {
        name: 'TICKER_DECORATED',
      },
      {
        name: 'TICKER_DECORATED',
      },
      {
        name: 'TICKER_DECORATED',
      },
      {
        name: 'TICKER_DECORATED',
      },
      {
        name: 'TICKER_DECORATED',
      },
      {
        name: 'TICKER_DECORATED',
      },
      {
        name: 'TICKER_DECORATED',
      },
    ];

    it('returns true if there were 10 handled ticker decoration events', () => {

      const result = tester.isPassingResult(passingResult);

      expect(result).to.be.true;
    });

    it('returns false if no events passed', () => {

      const result = tester.isPassingResult(undefined);

      expect(result).to.be.false;
    });

    it('returns false if 10 events were not handled', () => {

      const failingResult = [
        {
          name: 'TICKER_DECORATED',
        },
        {
          name: 'TICKER_DECORATED',
        },
      ];

      const result = tester.isPassingResult(failingResult);

      expect(result).to.be.false;
    });
  });

  describe('when building a passing result object', () => {

    let passingResultObject;

    beforeEach(() => {

      passingResultObject = tester.processPassingResult();
    });

    it('sets the test name', () => {

      expect(passingResultObject.test).to.equal('Tickers Decorated Events');
    });

    it('sets the success status to true', () => {

      expect(passingResultObject.success).to.be.true;
    });

    it('sets the expected number of events to 10', () => {

      expect(passingResultObject.expected).to.equal(10);
    });

    it('sets the received number of events to 10', () => {

      expect(passingResultObject.received).to.equal(10);
    });
  });

  describe('when building a failing result object', () => {

    const handledEvents = [
      {
        name: 'TICKER_DECORATED',
      },
      {
        name: 'TICKER_DECORATED',
      },
    ];

    let failingResultObject;

    beforeEach(() => {

      failingResultObject = tester.processFailingResult(handledEvents);
    });

    it('sets the test name', () => {

      expect(failingResultObject.test).to.equal('Tickers Decorated Events');
    });

    it('sets the success status to true', () => {

      expect(failingResultObject.success).to.be.false;
    });

    it('sets the expected number of events to 10', () => {

      expect(failingResultObject.expected).to.equal(10);
    });

    it('sets the received number of events to the number actually handled', () => {

      expect(failingResultObject.received).to.equal(2);
    });

    describe('and no events provided', () => {

      it('sets the received number of events to 0', () => {

        failingResultObject = tester.processFailingResult(undefined);

        expect(failingResultObject.received).to.equal(0);
      });
    });
  });
});
