import { expect } from 'chai';
import EventHandler from '../../src/EventHandler';
import RedisClientFake from '../../fake/redis/RedisClientFake';

describe('EventHandler Tests', () => {

  let redisFake;
  let handler;

  beforeEach(() => {

    redisFake = new RedisClientFake();
    handler = new EventHandler(redisFake);
  });

  describe('when events have been received on the TICKER_BATCH_PROCESSING channel', () => {

    it('handles those messages', () => {

      redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'FOO_HAPPENED' }));
      redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'FOO_HAPPENED' }));

      const handledEvents = handler.getEventsByName('FOO_HAPPENED');

      expect(handledEvents).to.have.lengthOf(2);
    });
  });

  describe('when events have been received on channel other than TICKER_BATCH_PROCESSING', () => {

    it('does not handle those messages', () => {

      redisFake.publish('NON_INTERESTED_CHANNEL', JSON.stringify({ name: 'FOO_HAPPENED' }));
      redisFake.publish('NON_INTERESTED_CHANNEL', JSON.stringify({ name: 'FOO_HAPPENED' }));

      const handledEvents = handler.getEventsByName('FOO_HAPPENED');

      expect(handledEvents).to.have.lengthOf(0);
    });
  });

  describe('when batch processing started events have not been received', () => {

    it('returns an empty collection', () => {

      expect(handler.getBatchProcessingStartedEvents()).to.have.lengthOf(0);
    });

    it('resets the events to an empty collection', () => {

      handler.clearBatchProcessingStartedEvents();

      const handledEvents = handler.getBatchProcessingStartedEvents();

      expect(handledEvents).to.have.lengthOf(0);
    });
  });

  describe('when BATCH_TICKER_PROCESSING_STARTED events have been received', () => {

    const anEvent = {
      name: 'BATCH_TICKER_PROCESSING_STARTED',
      someData: 1024,
    };

    beforeEach(() => {

      redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'BATCH_TICKER_PROCESSING_STARTED' }));
      redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify(anEvent));
      redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'BATCH_TICKER_PROCESSING_STARTED' }));
    });

    it('returns a collection with the events in it', () => {

      const handledEvents = handler.getBatchProcessingStartedEvents();

      expect(handledEvents).to.have.lengthOf(3);
      expect(handledEvents).to.deep.contain(anEvent);
    });

    it('clears out the Batch Processing Started Events', () => {

      handler.clearBatchProcessingStartedEvents();

      const handledEvents = handler.getBatchProcessingStartedEvents();

      expect(handledEvents).to.have.lengthOf(0);
    });

  });

  describe('when ticker decorated events have not been received', () => {

    it('returns an empty collection', () => {

      expect(handler.getTickerDecoratedEvents()).to.have.lengthOf(0);
    });
  });

  describe('when the TICKER_DECORATED event has been received', () => {

    it('returns a collection with the events in it', () => {

      const anEvent = {
        name: 'TICKER_DECORATED',
        someData: 1024,
      };

      redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'TICKER_DECORATED' }));
      redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify(anEvent));
      redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'TICKER_DECORATED' }));

      const handledEvents = handler.getTickerDecoratedEvents();

      expect(handledEvents).to.have.lengthOf(3);
      expect(handledEvents).to.deep.contain(anEvent);
    });

    it('clears out the events', () => {

      const anEvent = {
        name: 'TICKER_DECORATED',
        someData: 1024,
      };

      redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'TICKER_DECORATED' }));
      redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify(anEvent));
      redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'TICKER_DECORATED' }));

      handler.clearTickerDecoratedEvents();
      const handledEvents = handler.getTickerDecoratedEvents();

      expect(handledEvents).to.have.lengthOf(0);
    });
  });
});
