import mongodb from 'mongodb';
import requestPromise from 'request-promise';
import TickerDataSource from '../src/TickerDataSource';
import HopperIntegration from '../src/HopperIntegration';
import TestService from '../src/TestService';

const dataSource = new TickerDataSource(mongodb);

module.exports = () => {

  return dataSource.connect().then(() => {

    const hopperIntegration = new HopperIntegration(requestPromise);

    return new TestService(dataSource, hopperIntegration);
  });
};
