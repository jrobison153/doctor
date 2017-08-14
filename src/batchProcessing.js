import { expect } from 'chai';
import mongodb from 'mongodb';
import fs from 'fs';
import path from 'path';
import requestPromise from 'request-promise';

const ObjectID = mongodb.ObjectID;

const batchTest = {};
export default batchTest;

batchTest.test = () => {

  const url = 'mongodb://localhost:27017/systemintegration';
  let tickersToInsert;
  let tickerDb;

  return mongodb.MongoClient.connect(url).then((db) => {

    tickerDb = db;
    const collection = tickerDb.collection('tickers');

    const tickersAsJson = fs.readFileSync(path.join(__dirname, 'tickerData.json'));
    tickersToInsert = JSON.parse(tickersAsJson);

    return prepareSourceData(collection, tickersToInsert);
  }, (err) => {

    throw new Error(err);
  }).then(() => {

    return batchProcessTickers().then((responseBody) => {

      const tickerIds = JSON.parse(responseBody);

      expect(tickerIds).to.have.length(10);

      const testDone = new Promise((resolve, reject) => {

        checkAllTickersInDbForChromosome(tickerDb, tickerIds, resolve, reject, 1);
      });

      return testDone;
    });
  });
};

const checkAllTickersInDbForChromosome = (tickerDb, tickerIds, resolve, reject, attemptNumber) => {

  const collection = tickerDb.collection('tickers');

  Promise.all(tickerIds.map((id) => {

    return verifyTickerHasChromosome(collection, id);
  })).then(() => {

    resolve('Test Passed, all tickers have a chromosome');
  }, () => {

    retryOrGiveup(tickerDb, tickerIds, resolve, reject, attemptNumber);
  });
};

const verifyTickerHasChromosome = (collection, id) => {

  return collection.findOne({ _id: new ObjectID(id) }).then((ticker) => {

    if (ticker.chromosome && ticker.chromosome !== '') {

      return 0;
    }

    console.error(`Ticker ${JSON.stringify(ticker)} did not have an expected chromosome`);
    throw new Error('Ticker did not have a chromosome');
  });
};

const retryOrGiveup = (tickerDb, tickerIds, resolve, reject, attemptNumber) => {

  if (attemptNumber <= 10) {

    setTimeout(() => {
      checkAllTickersInDbForChromosome(tickerDb, tickerIds, resolve, reject, attemptNumber + 1);
    }, 2000);
  } else {

    reject('Test Failed, tickers in database did not all have chromosomes');
  }
};

async function prepareSourceData(collection, tickersToInsert) {

  await dropTickerCollection(collection);
  await insertTickersIntoDb(collection, tickersToInsert);
  const tickersFromDb = await readTickersFromDb(collection);
  assertTickersWereCorrectlyInserted(tickersFromDb, tickersToInsert);
}

function dropTickerCollection(collection) {

  return collection.drop().catch(e => console.log(e));
}

function insertTickersIntoDb(collection, tickers) {

  return collection.insertMany(tickers);
}

function readTickersFromDb(collection) {

  return collection.find().toArray();
}

function assertTickersWereCorrectlyInserted(newTickers, expectedTickers) {

  expect(newTickers).to.have.length(expectedTickers.length);
}

async function batchProcessTickers() {

  const batchId = await processTickers();
  return getProcessedTickers(batchId);
}

function processTickers() {

  const options = {
    method: 'POST',
    uri: 'http://localhost:8080/chromosomes',
  };

  return requestPromise(options).then((data) => {

    return JSON.parse(data);
  });
}

function getProcessedTickers(resourceId) {

  const options = {
    method: 'GET',
    uri: `http://localhost:8080/chromosomes/${resourceId}`,
  };

  return requestPromise(options).then((data) => {

    return data;
  });
}
