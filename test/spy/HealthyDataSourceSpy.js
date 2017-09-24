/* eslint-disable class-methods-use-this */

export default class HealthyDataSourceSpy {

  constructor() {

    this.findAllUpdatedTickersCallCount = 0;
  }

  async loadTestData() {

    const ids = ['123', '456', '789'];

    return Promise.resolve(ids);
  }

  findAllUpdatedTickers() {

    this.findAllUpdatedTickersCallCount = this.findAllUpdatedTickersCallCount + 1;

    const tickers = HealthyDataSourceSpy.tickersToReturn;

    return Promise.resolve(tickers);
  }
}

HealthyDataSourceSpy.tickersToReturn = [
  {
    chromosome: '01010101010',
  },
  {
    chromosome: '01010101010',
  },
  {
    chromosome: '01010101010',
  },
];
