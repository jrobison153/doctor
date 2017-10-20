
export default class TestService {

  /**
   *
   * @param {Array} validationCommands - array of Retryable Test validation Command objects
   * @param {Object} retryOptions - valid options
   *   attempts: Integer value specifying how many times to try finding tickers before giving up. Default is 10.
   *   wait: Integer specifying the number of milliseconds to wait between retry attempts. Default is 1000
   */
  constructor(dataSource, hopperIntegration, validationCommands, retryOptions) {

    this.dataSource = dataSource;
    this.hopperIntegration = hopperIntegration;
    this.validationCommands = validationCommands;
    this.retryOptions = retryOptions || {};
    this.initializeRetryOptions();
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

    try {

      await this.dataSource.loadTestData();

      await this.hopperIntegration.batchProcessTickers();

      return new Promise(async (resolve) => {

        const testValidationPromises = this.validationCommands.map((validationCommand) => {

          return this.runRetryableTestValidation(validationCommand);
        });

        Promise.all(testValidationPromises).then((results) => {

          resolve(results);
        }).catch((e) => {

          // hmmm would we ever get here unless it was a code error, don't have a test case for it
          console.error(e);
        });
      });
    } catch (e) {

      console.error(e);

      return [
        {
          success: false,
        },
      ];
    }
  }

  async runRetryableTestValidation(testValidationCommand) {

    return new Promise((resolve) => {

      this.retryOrGiveup(
        testValidationCommand,
        1,
        resolve);
    });
  }

  async retryOrGiveup(
    testCommand,
    attemptNumber,
    resolve,
  ) {

    if (attemptNumber <= this.retryOptions.attempts) {

      setTimeout(async () => {

        await this.testAndRetry(testCommand, attemptNumber, resolve);

      }, this.retryOptions.wait);
    } else {

      const failResult = testCommand.processFailingResult();

      testCommand.reset();

      resolve(failResult);
    }
  }

  async testAndRetry(
    testCommand,
    attemptNumber,
    resolve,
  ) {

    const asyncResult = await testCommand.checkResult();

    if (!testCommand.isPassingResult(asyncResult)) {

      this.retryOrGiveup(testCommand, attemptNumber + 1, resolve);
    } else {

      const resultObject = testCommand.processPassingResult(asyncResult);

      testCommand.reset();

      resolve(resultObject);
    }
  }
}
