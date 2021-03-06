/* eslint-disable class-methods-use-this */

export default class RetryableTestCommandSpy {

  constructor(testName) {

    this.retryTimes = -1;
    this.isFailing = false;
    this.name = testName;
    this.validationCallCount = 0;
    this.resetCalled = false;
    this.status = {};
    this.argPassedToProcessPassingResult = undefined;
    this.argPassedToProcessFailingResult = undefined;
  }

  checkResult() {

    this.validationCallCount += 1;
    this.status = {
      status: this.determineStatus(),
    };

    return Promise.resolve(this.status);
  }

  isPassingResult(resultObject) {


    let isPassing = false;

    if (resultObject.status === 'passing') {
      isPassing = true;
    }

    return isPassing;
  }

  processPassingResult(resultObject) {

    this.argPassedToProcessPassingResult = resultObject;

    return {
      test: this.name,
      status: resultObject.status,
    };
  }

  processFailingResult(resultObject) {

    this.argPassedToProcessFailingResult = resultObject;

    return {
      test: this.name,
      status: 'failed',
    };
  }

  determineStatus() {

    let status = 'passing';

    if (this.isFailing) {

      status = 'failing';
    } else if (this.retryTimes > 0 && this.validationCallCount !== this.retryTimes) {

      status = 'failing';
    }

    return status;
  }

  reset() {

    this.resetCalled = true;
  }
}
