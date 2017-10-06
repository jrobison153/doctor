/* eslint-disable class-methods-use-this */
export default class AlwaysPassingTestServiceStub {

  constructor() {

    this.results = [
      {
        success: true,
        a: 'b',
        c: 'd',
      },
      {
        success: true,
        foo: 'bar',
        baz: 100,
      },
    ];
  }

  test() {

    return Promise.resolve(this.results);
  }
}
