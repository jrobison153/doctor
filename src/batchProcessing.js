import { expect } from 'chai';
import mongodb from 'mongodb';
import fs from 'fs';
import path from 'path';
import requestPromise from 'request-promise';

const ObjectID = mongodb.ObjectID;

describe('System Integration Tests for the Batch Processing of Tickers', () => {

  describe('given tickers are present in the database without chromosomes', () => {

    const url = 'mongodb://localhost:27017/systemintegration';
    let tickersToInsert;
    let tickerDb;

    before(() => {

      return mongodb.MongoClient.connect(url).then((db) => {

        tickerDb = db;
        const collection = tickerDb.collection('tickers');

        const tickersAsJson = fs.readFileSync(path.join(__dirname, 'tickerData.json'));
        tickersToInsert = JSON.parse(tickersAsJson);

        return prepareSourceData(collection, tickersToInsert);
      }, (err) => {

        throw new Error(err);
      });
    });

    describe('when batch processed', () => {

      it('then each ticker is written back to the database with a chromosome', () => {

        return batchProcessTickers().then((responseBody) => {

          const tickerIds = JSON.parse(responseBody);

          expect(tickerIds).to.have.length(10);

          const collection = tickerDb.collection('tickers');

          const findPromises = tickerIds.map((id) => {

            return collection.findOne({ _id: new ObjectID(id) }).then((ticker) => {

              expect(ticker).to.include.keys('chromosome');
              expect(ticker.chromosome).to.not.be.empty();
            });
          });

          return Promise.all(findPromises);
        });
      });
    });
  });
});

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
