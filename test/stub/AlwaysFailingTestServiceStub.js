/* eslint-disable class-methods-use-this */
export default class AlwaysFailingTestServiceStub {

  test() {

    return Promise.reject('AlwaysFailingTestServiceStub: of course the test failed');
  }
}
