export default class EventHandler {

  constructor(messageClient) {

    this.messageClient = messageClient;
    this.handledEvents = {};

    this.messageClient.subscribe('TICKER_BATCH_PROCESSING');
    this.messageClient.on('message', this.handleBatchProcessingTopicMessages.bind(this));
  }

  handleBatchProcessingTopicMessages(channel, message) {

    const msgAsObj = JSON.parse(message);

    if (this.handledEvents[msgAsObj.name] === undefined) {

      this.handledEvents[msgAsObj.name] = [];
    }

    this.handledEvents[msgAsObj.name].push(msgAsObj);
  }

  getBatchProcessingStartedEvents() {

    return this.getEventsByName('BATCH_TICKER_PROCESSING_STARTED');
  }

  clearBatchProcessingStartedEvents() {

    this.handledEvents['BATCH_TICKER_PROCESSING_STARTED'] = [];
  }

  getTickerDecoratedEvents() {

    return this.getEventsByName('TICKER_DECORATED');
  }

  clearTickerDecoratedEvents() {

    this.handledEvents['TICKER_DECORATED'] = [];
  }

  getEventsByName(eventName) {

    let handledEvents = this.handledEvents[eventName];

    if (!handledEvents) {

      handledEvents = [];
    }

    return handledEvents;
  }
}
