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

  describe('when batch processing started events have not been received', () => {

    it('returns an empty collection', () => {

      expect(handler.getBatchProcessingStartedEvents()).to.have.lengthOf(0);
    });
  });

  describe('when BATCH_TICKER_PROCESSING_STARTED events have been received', () => {

    describe('and the topic is TICKER_BATCH_PROCESSING', () => {

      it('returns a collection with the events in it', () => {

        const anEvent = {
          name: 'BATCH_TICKER_PROCESSING_STARTED',
          someData: 1024,
        };

        redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'BATCH_TICKER_PROCESSING_STARTED' }));
        redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify(anEvent));
        redisFake.publish('TICKER_BATCH_PROCESSING', JSON.stringify({ name: 'BATCH_TICKER_PROCESSING_STARTED' }));

        const handledEvents = handler.getBatchProcessingStartedEvents();

        expect(handledEvents).to.have.lengthOf(3);
        expect(handledEvents).to.deep.contain(anEvent);
      });
    });

    describe('and the topic is not TICKER_BATCH_PROCESSING', () => {

      it('returns an empty collection', () => {

        const anEvent = {
          name: 'BATCH_TICKER_PROCESSING_STARTED',
          someData: 1024,
        };

        redisFake.publish('blah_topic', JSON.stringify({ name: 'BATCH_TICKER_PROCESSING_STARTED' }));
        redisFake.publish('blah_topic', JSON.stringify(anEvent));
        redisFake.publish('blah_topic', JSON.stringify({ name: 'BATCH_TICKER_PROCESSING_STARTED' }));

        const handledEvents = handler.getBatchProcessingStartedEvents();

        expect(handledEvents).to.have.lengthOf(0);
      });
    });
  });
});
