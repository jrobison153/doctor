
export default class EventHandlerSpy {

  constructor() {

    this.events = {};
    this.getBatchProcessingStartedEventsCallCount = 0;
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
}
