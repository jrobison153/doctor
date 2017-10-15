/**
 * A Retryable Tester that validates exactly one BATCH_TICKER_PROCESSING_STARTED event was received
 */
export default class BatchProcessingStartedTester {

  constructor(eventHandler) {

    this.eventHandler = eventHandler;
  }

  checkResult() {

    return this.eventHandler.getBatchProcessingStartedEvents();
  }

  // eslint-disable-next-line class-methods-use-this
  isPassingResult(events) {

    let result = false;

    if (events && events.length === 1) {
      result = true;
    }

    return result;
  }

  // eslint-disable-next-line class-methods-use-this
  processPassingResult(events) {

    let safeEvents = [];

    if (events) {

      safeEvents = events;
    }

    return {
      test: 'Batch Processing Started Event',
      success: safeEvents.length === 1,
      expected: 1,
      received: safeEvents.length,
    };
  }

  processFailingResult(events) {

    return this.processPassingResult(events);
  }
}
