import fs from 'fs';
import path from 'path';
import EventEmitter from 'events';

export default class TickerDataSource extends EventEmitter {

  constructor(mongo) {

    super();

    this.ObjectID = mongo.ObjectID;
    this.mongoClient = mongo.MongoClient;
  }

  connect() {

    this.host = TickerDataSource.resolveValueFromEnv('localhost', 'DOCTOR_DB_HOST');
    this.port = TickerDataSource.resolveValueFromEnv('27017', 'DOCTOR_DB_PORT');
    this.dbName = TickerDataSource.resolveValueFromEnv('systemintegration', 'DOCTOR_DB_NAME');

    const connectionUrl = `mongodb://${this.host}:${this.port}/${this.dbName}`;

    return this.mongoClient.connect(connectionUrl).then((db) => {

      this.db = db;
      this.tickerCollection = db.collection('tickers');
    });
  }

  /**
   * adds a default chromosome`` to each ticker in the database
   * @returns {Promise.<void>}
   */
  async addChromosomeToAllTickers() {

    const update = { $set:
      { chromosome: '12345' },
    };

    return this.tickerCollection.updateMany({}, update);
  }

  /**
   * Populates the database with test data from tickerData.json.
   *
   * @returns {Promise.<void>} resolves to an array of database ids for each ticker that was
   * inserted into the database. Rejects on failures to correctly populate data in the database.
   */
  async loadTestData() {

    await this.removeExistingCollection();
    const numTickersExpectedToBeInserted = await this.insertNewTickers();
    const tickerCursor = this.readTickersBack();

    const tickers = await tickerCursor.toArray();
    const numTickersActuallyInserted = tickers.length;

    await TickerDataSource.checkAllTickersCorrectlyInserted(numTickersExpectedToBeInserted,
      numTickersActuallyInserted);

    this.emit('TEST_DATA_LOADED');

    return tickers.map((ticker) => {

      // eslint-disable-next-line no-underscore-dangle
      return ticker._id.toHexString();
    });
  }

  /**
   * search the database for any tickers with the provided ids, if no ids provided then searches for
   * all tickers.
   *
   * @param tickerIds - Array of ids that identify tickers in the database
   * @returns {Promise.<Promise|*>} resolves to an array of tickers retrieved from the database. Can
   * be less than or equal to the tickers asked for.
   */
  async findAllUpdatedTickers(tickerIds) {

    let findQuery = {};

    if (tickerIds) {

      const tickerIdsForQuery = tickerIds.map((id) => {

        return { _id: new this.ObjectID(id) };
      });

      findQuery = {
        $or: tickerIdsForQuery,
      };
    }

    return this.tickerCollection.find(findQuery).toArray();
  }

  async removeExistingCollection() {

    this.tickerCollection.drop().catch((e) => {
      console.info(e);
    });
  }

  async insertNewTickers() {

    const tickersAsJson = fs.readFileSync(path.join(__dirname, 'tickerData.json'));
    const tickersToInsert = JSON.parse(tickersAsJson);

    await this.tickerCollection.insertMany(tickersToInsert);

    return tickersToInsert.length;
  }

  readTickersBack() {

    return this.tickerCollection.find();
  }
}

TickerDataSource.resolveValueFromEnv = (defaultValue, envVarName) => {

  return process.env[envVarName] ? process.env[envVarName] : defaultValue;
};

TickerDataSource.checkAllTickersCorrectlyInserted =
  (numTickersExpectedToBeInserted, numTickersActuallyInserted) => {

    return new Promise((resolve, reject) => {

      if (numTickersExpectedToBeInserted !== numTickersActuallyInserted) {

        // eslint-disable-next-line prefer-template
        const message = 'Failed to load test data. Expected ' + numTickersExpectedToBeInserted +
          ' tickers to be inserted but ' + numTickersActuallyInserted + ' were actually inserted';

        reject(message);
      } else {

        resolve();
      }
    });
  };

