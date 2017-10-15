/* eslint-disable class-methods-use-this */

/**
 * a Retryable tester that validates exactly 10 TICKER_DECORATED events were received
 */
export default class TickersDecoratedTester {

  constructor(eventHandler) {

    this.eventHandler = eventHandler;
  }

  checkResult() {

    return this.eventHandler.getTickerDecoratedEvents();
  }

  isPassingResult(events) {

    let isExactlyTenEvents = false;

    if (events && events.length === 10) {
      isExactlyTenEvents = true;
    }

    return isExactlyTenEvents;
  }

  processPassingResult() {

    return {
      test: 'Tickers Decorated Events',
      success: true,
      expected: 10,
      received: 10,
    };
  }

  processFailingResult(events) {

    return {
      test: 'Tickers Decorated Events',
      success: false,
      expected: 10,
      received: events ? events.length : 0,
    };
  }
}
