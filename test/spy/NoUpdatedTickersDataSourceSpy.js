/* eslint-disable class-methods-use-this */
import HealthyDataSourceSpy from './HealthyDataSourceSpy';

export default class NoUpdatedTickersDataSourceSpy extends HealthyDataSourceSpy {

  findAllUpdatedTickers() {

    this.findAllUpdatedTickersCallCount = this.findAllUpdatedTickersCallCount + 1;
    return Promise.resolve([]);
  }
}
