/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import EventHandlerSpy from '../spy/EventHandlerSpy';
import BatchProcessingStartedTester from '../../src/BatchProcessingStartedTester';

chai.use(chaiAsPromised);

describe('BatchProcessingStartedTester Tests', () => {

  let batchProcessingStartedTester;
  let eventHandlerSpy;

  const retryOptions = {
    attempts: 4,
    wait: 1,
  };

  beforeEach(() => {

    eventHandlerSpy = new EventHandlerSpy();
    batchProcessingStartedTester = new BatchProcessingStartedTester(eventHandlerSpy, retryOptions);
  });

  describe('when checking the result', () => {

    it('returns the events from the event handler', async () => {

      const expectedEvents = [
        {
          name: 'BATCH_TICKER_PROCESSING_STARTED',
        },
      ];

      eventHandlerSpy.handleEvent({ name: 'BATCH_TICKER_PROCESSING_STARTED' });

      const result = await batchProcessingStartedTester.checkResult();
      expect(result).to.deep.equal(expectedEvents);
    });
  });

  describe('when validating test pass/fail status', () => {

    describe('and there is exactly one event', () => {

      it('returns true', () => {

        const passingResult = [
          {
            name: 'some event',
          },
        ];

        const isPassing = batchProcessingStartedTester.isPassingResult(passingResult);

        expect(isPassing).to.be.true;
      });
    });

    describe('and there is more than one event', () => {

      it('returns true', () => {

        const passingResult = [
          {
            name: 'some event',
          },
          {
            name: 'some event',
          },
        ];

        const isPassing = batchProcessingStartedTester.isPassingResult(passingResult);

        expect(isPassing).to.be.false;
      });
    });

    describe('when building a passing result object', () => {

      let passingResultObject;

      beforeEach(() => {

        passingResultObject = batchProcessingStartedTester.processPassingResult([{ name: 'some event' }]);
      });

      it('sets the test name', () => {

        expect(passingResultObject.test).to.equal('Batch Processing Started Event');
      });

      it('sets the success status to true', () => {

        expect(passingResultObject.success).to.be.true;
      });

      it('sets the expected number of events to 1', () => {

        expect(passingResultObject.expected).to.equal(1);
      });

      it('sets the received number of events to 1', () => {

        expect(passingResultObject.received).to.equal(1);
      });
    });

    describe('when building a failing result object', () => {

      let passingResultObject;

      beforeEach(() => {

        passingResultObject = batchProcessingStartedTester.processFailingResult([]);
      });

      it('sets the test name', () => {

        expect(passingResultObject.test).to.equal('Batch Processing Started Event');
      });

      it('sets the success status to false', () => {

        expect(passingResultObject.success).to.be.false;
      });

      it('sets the expected number of events to 1', () => {

        expect(passingResultObject.expected).to.equal(1);
      });

      it('sets the received number of events to 1', () => {

        expect(passingResultObject.received).to.equal(0);
      });

      describe('and more than one event was handled', () => {

        let failingResultObject;

        beforeEach(() => {

          const events = [
            {
              name: 'some event',
            },
            {
              name: 'some event',
            },
          ];

          failingResultObject = batchProcessingStartedTester.processFailingResult(events);
        });

        it('sets the success status to false', () => {

          expect(failingResultObject.success).to.be.false;
        });

        it('sets the number of received events to the number actually received', () => {

          expect(failingResultObject.received).to.equal(2);
        });
      });

      describe('and no events are passed in', () => {

        let failingResultObject;

        beforeEach(() => {

          failingResultObject = batchProcessingStartedTester.processFailingResult(undefined);
        });

        it('sets success to false', () => {

          expect(failingResultObject.success).to.be.false;
        });

        it('sets the number of received events to 0', () => {

          expect(failingResultObject.received).to.equal(0);
        });
      });
    });
  });
});
