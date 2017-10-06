import clone from 'clone';

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
    this.eventHandler = eventHandler;
  }

  initializeRetryOptions() {

    this.retryOptions.attempts = this.retryOptions.attempts || 10;
    this.retryOptions.wait = this.retryOptions.wait || 1000;
  }

  /**
   * Run a ticker batch process and verify that all the expected pieces are working
   * @returns {Promise} - resolves to an array of test result objects
   */
  async test() {

    const finalTestStatusPromise = new Promise(async (resolve) => {

      const decorationResultPromise = this.testTickerDecoration();
      const eventsEmittedResultPromise = this.testBatchStartedEventEmitted();

      Promise.all([decorationResultPromise, eventsEmittedResultPromise]).then((results) => {

        const decorationResult = results[0];
        const eventsEmittedResult = results[1];

        const testResult = [];

        testResult.push(decorationResult);
        testResult.push(eventsEmittedResult);

        resolve(testResult);
      }).catch((e) => {

        // hmmm would we ever get here unless it was a code error, don't have a test case for it
        console.error(e);
      });
    });

    return finalTestStatusPromise;
  }

  async testBatchStartedEventEmitted() {

    return new Promise((resolve) => {

      const isExactlyOneEvent = (events) => {

        let result = false;

        if (events && events.length === 1) {
          result = true;
        }

        return result;
      };

      const buildBatchProcessingStartedResult = (events) => {

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
      };

      this.retryOrGiveup(
        this.eventHandler.getBatchProcessingStartedEvents.bind(this.eventHandler),
        isExactlyOneEvent,
        buildBatchProcessingStartedResult,
        buildBatchProcessingStartedResult,
        1,
        resolve,
      );
    });
  }

  async testTickerDecoration() {

    try {

      const tickerIds = await this.dataSource.loadTestData();

      await this.hopperIntegration.batchProcessTickers();

      return this.checkAllTickersInDbForChromosome(tickerIds);
    } catch (err) {

      const failResult = TestService.buildFailingDecorationResultObject({
        msg: `Test Failed: ${err}`,
      });

      return failResult;
    }
  }

  async checkAllTickersInDbForChromosome(tickerIds) {

    const curriedFindAllUpdatedTickers = (ids) => {

      return async () => {

        return this.dataSource.findAllUpdatedTickers(ids);
      };
    };

    const areAllTickersPresentWithChromosome = (foundTickers) => {

      let allTickersPresentWithChromosome = false;

      if (foundTickers.length === tickerIds.length) {

        allTickersPresentWithChromosome = TestService.checkAllTickersForChromosome(foundTickers);
      }

      return allTickersPresentWithChromosome;
    };

    const curriedBuildFailingDecorationResultObject = () => {

      return () => {

        return TestService.buildFailingDecorationResultObject({
          msg: 'Test Failed, tickers in database did not all have chromosomes',
        });
      };
    };

    return new Promise((resolve) => {

      this.retryOrGiveup(
        curriedFindAllUpdatedTickers(tickerIds),
        areAllTickersPresentWithChromosome,
        TestService.buildPassingDecorationResultObject,
        curriedBuildFailingDecorationResultObject(),
        1,
        resolve);
    });
  }

  async retryOrGiveup(
    asyncFunction,
    isPassingResultFunction,
    processPassingResultFunction,
    processFailingResultFunction,
    attemptNumber,
    resolve,
  ) {

    if (attemptNumber <= this.retryOptions.attempts) {

      setTimeout(async () => {

        await this.testAndRetry(asyncFunction,
          isPassingResultFunction, processPassingResultFunction, processFailingResultFunction, attemptNumber, resolve);

      }, this.retryOptions.wait);
    } else {

      const failResult = processFailingResultFunction();
      resolve(failResult);
    }
  }

  async testAndRetry(
    asyncFunction,
    isPassingResultFunction,
    processPassingResultFunction,
    processFailingResultFunction,
    attemptNumber,
    resolve,
  ) {

    const asyncResult = await asyncFunction();

    if (!isPassingResultFunction(asyncResult)) {

      this.retryOrGiveup(asyncFunction,
        isPassingResultFunction, processPassingResultFunction,
        processFailingResultFunction, attemptNumber + 1, resolve);
    } else {

      const resultObject = processPassingResultFunction(asyncResult);

      resolve(resultObject);
    }
  }

  static buildPassingDecorationResultObject() {

    return {
      test: 'Ticker Decoration',
      msg: 'Test Passed, all tickers have a chromosome',
      success: true,
    };
  }

  static buildFailingDecorationResultObject(baseResult) {

    const failResult = clone(baseResult);

    failResult.test = 'Ticker Decoration';
    failResult.success = false;

    if (!failResult.msg || failResult.msg === '') {

      failResult.msg = 'Test Failed with an unspecified reason';
    }

    return failResult;
  }

  static checkAllTickersForChromosome(foundTickers) {

    let allTickersHaveChromosome = true;

    foundTickers.forEach((ticker) => {

      if (!ticker.chromosome || ticker.chromosome === '') {

        console.error(`Ticker ${JSON.stringify(ticker)} did not have an expected chromosome`);
        allTickersHaveChromosome = false;
      }
    });

    return allTickersHaveChromosome;
  }
}
