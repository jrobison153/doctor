/* eslint-disable class-methods-use-this */
import HealthyDataSourceSpy from './HealthyDataSourceSpy';

export default class SomeUpdatedTickersDataSourceSpy extends HealthyDataSourceSpy {

  findAllUpdatedTickers() {

    this.findAllUpdatedTickersCallCount = this.findAllUpdatedTickersCallCount + 1;

    const tickers = HealthyDataSourceSpy.tickersToReturn;

    delete tickers[1].chromosome;

    return Promise.resolve(tickers);
  }
}
