export default class RedisClientFake {

  constructor() {

    this.channelsSubscribedTo = [];
  }

  on(event, handler) {

    if (event === 'message') {

      this.messageHandler = handler;
    }
  }

  publish(channel, message) {

    const foundChannel = this.channelsSubscribedTo.find((subChannel) => {
      return subChannel === channel;
    });

    if (foundChannel && this.messageHandler) {

      this.messageHandler(channel, message);
    }
  }

  subscribe(channel) {

    this.channelsSubscribedTo.push(channel);
  }
}
