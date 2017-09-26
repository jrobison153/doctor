/* eslint-disable class-methods-use-this */
export default class AlwaysFailingTestServiceStub {

  constructor() {

    this.resultsSummary = {
      blah: {
        grr: 'a',
      },
      top: 'bottom',
    };
  }

  test() {

    return Promise.reject({
      msg: 'AlwaysFailingTestServiceStub: of course the test failed',
      summary: this.resultsSummary,
    });
  }
}
