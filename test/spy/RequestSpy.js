
export default class RequestSpy {

  constructor() {

    this.lastOperationOptions = {};
    this.postToChromosomesReturns = '';
    this.getToChromosomesReturns = [];
  }

  request(options) {

    this.lastOperationOptions[options.method] = options;

    let resolveWith = '';

    if (options.method === 'POST' && options.uri.match(/^.*\/chromosomes$/)) {

      resolveWith = this.postToChromosomesReturns;
    } else if (options.method === 'GET' && options.uri.match(/^.*\/chromosomes\/[0-9a-fA-F]+$/)) {

      resolveWith = this.getToChromosomesReturns;
    }

    resolveWith = JSON.stringify(resolveWith);

    return Promise.resolve(resolveWith);
  }
}
