
export default class EventHandlerSpy {

  constructor() {

    this.events = {};
    this.getBatchProcessingStartedEventsCallCount = 0;
    this.clearTickerDecoratedEventsCalled = false;
    this.clearBatchProcessingStartedEventsCalled = false;
  }

  handleEvent(event) {

    if (!this.events[event.name]) {

      this.events[event.name] = [];
    }

    this.events[event.name].push(event);
  }

  getBatchProcessingStartedEvents() {

    this.getBatchProcessingStartedEventsCallCount = this.getBatchProcessingStartedEventsCallCount + 1;

    return this.events.BATCH_TICKER_PROCESSING_STARTED;
  }

  clearBatchProcessingStartedEvents() {

    this.clearBatchProcessingStartedEventsCalled = true;
  }

  clearTickerDecoratedEvents() {

    this.clearTickerDecoratedEventsCalled = true;
  }

  getTickerDecoratedEvents() {

    return this.events.TICKER_DECORATED;
  }
}
