/* eslint-disable class-methods-use-this */
export default class AlwaysPassingTestServiceStub {

  constructor() {

    this.resultsSummary = {
      foo: {
        a: 'b',
      },
      bar: [1, 2, 3],
    };
  }

  test() {

    return Promise.resolve({
      msg: 'AlwaysPassingTestServiceStub: of course the test passed',
      summary: this.resultsSummary,
    });
  }
}
