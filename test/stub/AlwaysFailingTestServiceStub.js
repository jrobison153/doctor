/* eslint-disable class-methods-use-this */
export default class AlwaysFailingTestServiceStub {

  constructor() {

    this.results = [
      {
        success: true,
        a: 'b',
        c: 'd',
      },
      {
        success: false,
        foo: 'bar',
        baz: 100,
      },
    ];
  }

  test() {

    return Promise.resolve(this.results);
  }
}
