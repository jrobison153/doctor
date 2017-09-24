/* eslint-disable class-methods-use-this */

export default class UnhealthyDataSourceStub {

  async loadTestData() {

    return Promise.reject();
  }
}
