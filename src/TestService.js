
export default class TestService {

  /**
   *
   * @param dataSource
   * @param hopperIntegration
   * @param retryOptions  Object - valid options
   *   attempts: Integer value specifying how many times to try finding tickers before giving up. Default is 10.
   *   wait: Integer specifying the number of milliseconds to wait between retry attempts. Default is 1000
   */
  constructor(dataSource, hopperIntegration, eventHandler, retryOptions) {

    this.retryOptions = retryOptions || {};
    this.initializeRetryOptions();
    this.dataSource = dataSource;
    this.hopperIntegration = hopperIntegration;
  }

  initializeRetryOptions() {

    this.retryOptions.attempts = this.retryOptions.attempts || 10;
    this.retryOptions.wait = this.retryOptions.wait || 1000;
  }

  async test() {

    const decorationResult = await this.testTickerDecoration();

    let testResult;
    if (decorationResult.passed) {

      testResult = TestService.buildPassingResultObject();
    } else {

      testResult = {
        msg: 'Test Failed, tickers in database did not all have chromosomes',
      };
    }

    return Promise.resolve(testResult)
  }

  async testTickerDecoration() {

    const tickerIds = await this.dataSource.loadTestData();

    await this.hopperIntegration.batchProcessTickers();

    return this.checkAllTickersInDbForChromosome(tickerIds);
  }

  async checkAllTickersInDbForChromosome(tickerIds) {

    return new Promise((resolve, reject) => {

      this.retryOrGiveup(tickerIds, 1, resolve, reject);
    });
  }

  async retryOrGiveup(tickerIds, attemptNumber, resolve, reject) {

    if (attemptNumber <= this.retryOptions.attempts) {

      setTimeout(async () => {

        await this.findOrRetry(tickerIds, attemptNumber, resolve, reject);
      }, this.retryOptions.wait);
    } else {

      reject({
        msg: 'Test Failed, tickers in database did not all have chromosomes',
      });
    }
  }

  async findOrRetry(tickerIds, attemptNumber, resolve, reject) {

    const foundTickers = await this.dataSource.findAllUpdatedTickers(tickerIds);

    if (foundTickers.length !== tickerIds.length) {

      this.retryOrGiveup(tickerIds, attemptNumber + 1, resolve, reject);
    } else {

      const allTickersHaveChromosome = TestService.checkAllTickersForChromosome(foundTickers);

      if (allTickersHaveChromosome) {

        const result = TestService.buildPassingResultObject();
        resolve(result);
      } else {

        this.retryOrGiveup(tickerIds, attemptNumber + 1, resolve, reject);
      }
    }
  }
}

TestService.checkAllTickersForChromosome = (foundTickers) => {

  let allTickersHaveChromosome = true;

  foundTickers.forEach((ticker) => {

    if (!ticker.chromosome || ticker.chromosome === '') {

      console.error(`Ticker ${JSON.stringify(ticker)} did not have an expected chromosome`);
      allTickersHaveChromosome = false;
    }
  });

  return allTickersHaveChromosome;
};

TestService.buildPassingResultObject = () => {

  return {
    msg: 'Test Passed, all tickers have a chromosome',
    summary: {
      events: {
        BATCH_TICKER_PROCESSING_STARTED: {
          received: 1,
          expected: 1,
        },
      },
    },
  };
};
