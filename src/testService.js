import { expect } from 'chai';
import mongodb from 'mongodb';
import fs from 'fs';
import path from 'path';
import requestPromise from 'request-promise';

const ObjectID = mongodb.ObjectID;

const batchTest = {};
export default batchTest;


batchTest.test = () => {

  return runIt();
};

async function runIt() {

  const db = await connectToMongo();
  await loadTestData(db);
  const hopperResponse = await batchProcessTickers();

  const tickerIds = JSON.parse(hopperResponse);

  expect(tickerIds).to.have.length(10);

  const testDone = new Promise((resolve, reject) => {

    checkAllTickersInDbForChromosome(db, tickerIds, resolve, reject, 1);
  });

  return testDone;
}

async function connectToMongo() {

  const url = buildConnectionUrlFromEnv();
  return mongodb.MongoClient.connect(url);
}

function buildConnectionUrlFromEnv() {

  const host = resolveValueFromEnv('localhost', 'DOCTOR_DB_HOST');

  const port = resolveValueFromEnv('27017', 'DOCTOR_DB_PORT');

  const databaseName = resolveValueFromEnv('systemintegration', 'DOCTOR_DB_NAME');

  const connectionUrl = `mongodb://${host}:${port}/${databaseName}`;

  console.info(`Connecting to mongo database ${connectionUrl}`);

  return connectionUrl;
}

function loadTestData(db) {

  const collection = db.collection('tickers');

  const tickersAsJson = fs.readFileSync(path.join(__dirname, 'tickerData.json'));
  const tickersToInsert = JSON.parse(tickersAsJson);

  return prepareSourceData(collection, tickersToInsert);
}

async function prepareSourceData(collection, tickersToInsert) {

  await dropTickerCollection(collection);
  await insertTickersIntoDb(collection, tickersToInsert);
  const tickersFromDb = await readTickersFromDb(collection);
  assertTickersWereCorrectlyInserted(tickersFromDb, tickersToInsert);
}

function dropTickerCollection(collection) {

  return collection.drop().catch((e) => { console.info(e); });
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

function resolveValueFromEnv(defaultValue, envVarName) {

  return process.env[envVarName] ? process.env[envVarName] : defaultValue;
}

function checkAllTickersInDbForChromosome(tickerDb, tickerIds, resolve, reject, attemptNumber) {

  const collection = tickerDb.collection('tickers');

  Promise.all(tickerIds.map((id) => {

    return verifyTickerHasChromosome(collection, id);
  })).then(() => {

    resolve('Test Passed, all tickers have a chromosome');
  }, () => {

    retryOrGiveup(tickerDb, tickerIds, resolve, reject, attemptNumber);
  });
}

function verifyTickerHasChromosome(collection, id) {

  return collection.findOne({ _id: new ObjectID(id) }).then((ticker) => {

    if (ticker.chromosome && ticker.chromosome !== '') {

      return 0;
    }

    console.error(`Ticker ${JSON.stringify(ticker)} did not have an expected chromosome`);
    throw new Error('Ticker did not have a chromosome');
  });
}

function retryOrGiveup(tickerDb, tickerIds, resolve, reject, attemptNumber) {

  if (attemptNumber <= 10) {

    setTimeout(() => {
      checkAllTickersInDbForChromosome(tickerDb, tickerIds, resolve, reject, attemptNumber + 1);
    }, 2000);
  } else {

    reject('Test Failed, tickers in database did not all have chromosomes');
  }
}

async function batchProcessTickers() {

  const batchId = await processTickers();
  return getProcessedTickers(batchId);
}

function processTickers() {

  const options = {
    method: 'POST',
    uri: `${buildHopperUrlFromEnv()}/chromosomes`,
  };

  return requestPromise(options).then((data) => {

    return JSON.parse(data);
  });
}

function getProcessedTickers(resourceId) {

  const options = {
    method: 'GET',
    uri: `${buildHopperUrlFromEnv()}/chromosomes/${resourceId}`,
  };

  return requestPromise(options).then((data) => {

    return data;
  });
}

function buildHopperUrlFromEnv() {

  const hopperUrl = resolveValueFromEnv('http://localhost:8080', 'HOPPER_URL');

  console.info(`Connecting to hopper via url: ${hopperUrl}`);

  return hopperUrl;
}
