/* eslint-disable class-methods-use-this */
export default class AlwaysPassingTestServiceStub {

  test() {

    return Promise.resolve('AlwaysPassingTestServiceStub: of course the test passed');
  }
}
