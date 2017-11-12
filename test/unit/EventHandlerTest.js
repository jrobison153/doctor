import { expect } from 'chai';
import redisFakeClientFactory from 'redis-fake';
import EventHandler from '../../src/EventHandler';

describe('EventHandler Tests', () => {

  let redisClientFake;
  let handler;

  beforeEach(() => {

    redisClientFake = redisFakeClientFactory();
    handler = new EventHandler(redisClientFake);
  });

  describe('when events have been received on the TICKER_BATCH_PROCESSING channel', () => {

    it('handles those messages', () => {

      redisClientFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'FOO_HAPPENED' }));
      redisClientFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'FOO_HAPPENED' }));

      const handledEvents = handler.getEventsByName('FOO_HAPPENED');

      expect(handledEvents).to.have.lengthOf(2);
    });
  });

  describe('when events have been received on channel other than TICKER_BATCH_PROCESSING', () => {

    it('does not handle those messages', () => {

      redisClientFake.publish('NON_INTERESTED_CHANNEL', JSON.stringify({ name: 'FOO_HAPPENED' }));
      redisClientFake.publish('NON_INTERESTED_CHANNEL', JSON.stringify({ name: 'FOO_HAPPENED' }));

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

      redisClientFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'BATCH_TICKER_PROCESSING_STARTED' }));
      redisClientFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify(anEvent));
      redisClientFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'BATCH_TICKER_PROCESSING_STARTED' }));
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

      redisClientFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'TICKER_DECORATED' }));
      redisClientFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify(anEvent));
      redisClientFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'TICKER_DECORATED' }));

      const handledEvents = handler.getTickerDecoratedEvents();

      expect(handledEvents).to.have.lengthOf(3);
      expect(handledEvents).to.deep.contain(anEvent);
    });

    it('clears out the events', () => {

      const anEvent = {
        name: 'TICKER_DECORATED',
        someData: 1024,
      };

      redisClientFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'TICKER_DECORATED' }));
      redisClientFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify(anEvent));
      redisClientFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'TICKER_DECORATED' }));

      handler.clearTickerDecoratedEvents();
      const handledEvents = handler.getTickerDecoratedEvents();

      expect(handledEvents).to.have.lengthOf(0);
    });
  });
});
