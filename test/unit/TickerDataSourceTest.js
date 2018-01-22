/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import fs from 'fs';
import path from 'path';
import TickerDataSource from '../../src/TickerDataSource';
import mongoStub from '../stub/mongo/mongoStub';

chai.use(chaiAsPromised);

describe('TickerDataSource Tests', () => {

  afterEach(mongoStub.reset);

  let dataSource;
  let dbStub;
  let testDataLoadedEventEmitted;
  let collectionSpy;

  beforeEach(async () => {

    dataSource = new TickerDataSource(mongoStub);

    dbStub = await mongoStub.MongoClient.connect();
    collectionSpy = dbStub.collection();

    testDataLoadedEventEmitted = false;

    dataSource.on('TEST_DATA_LOADED', () => {

      testDataLoadedEventEmitted = true;
    });
  });

  describe('when connecting to the database', () => {

    const envBackup = {};

    beforeEach(() => {

      envBackup.DOCTOR_DB_HOST = process.env.DOCTOR_DB_HOST;
      envBackup.DOCTOR_DB_PORT = process.env.DOCTOR_DB_PORT;
      envBackup.DOCTOR_DB_NAME = process.env.DOCTOR_DB_NAME;
    });

    afterEach(() => {

      process.env.DOCTOR_DB_HOST = envBackup.DOCTOR_DB_HOST;
      process.env.DOCTOR_DB_PORT = envBackup.DOCTOR_DB_PORT;
      process.env.DOCTOR_DB_NAME = envBackup.DOCTOR_DB_NAME;
    });

    it('defaults host if DOCTOR_DB_HOST environment variable is not set', () => {

      delete process.env.DOCTOR_DB_HOST;

      return dataSource.connect().then(() => {

        expect(dataSource.host).to.equal('localhost');
      });
    });

    it('sets the host to the value of the DOCTOR_DB_HOST environment variable', () => {

      process.env.DOCTOR_DB_HOST = 'somehost';

      return dataSource.connect().then(() => {

        expect(dataSource.host).to.equal('somehost');
      });
    });

    it('defaults the port if DOCTOR_DB_PORT environment variable is not set', () => {

      delete process.env.DOCTOR_DB_PORT;

      return dataSource.connect().then(() => {

        expect(dataSource.port).to.equal('27017');
      });
    });

    it('sets the port to the value of the DOCTOR_DB_PORT environment variable', () => {

      process.env.DOCTOR_DB_PORT = '12345';

      return dataSource.connect().then(() => {

        expect(dataSource.port).to.equal('12345');
      });
    });

    it('defaults the database name if DOCTOR_DB_NAME environment variable is not set', () => {

      delete process.env.DOCTOR_DB_NAME;

      return dataSource.connect().then(() => {

        expect(dataSource.dbName).to.equal('systemintegration');
      });
    });

    it('sets the database name to the value of the DOCTOR_DB_NAME environment variable', () => {

      process.env.DOCTOR_DB_NAME = 'somename';

      return dataSource.connect().then(() => {

        expect(dataSource.dbName).to.equal('somename');
      });
    });

    it('connects to the database using a correctly formed url', () => {

      delete process.env.DOCTOR_DB_HOST;
      delete process.env.DOCTOR_DB_PORT;
      delete process.env.DOCTOR_DB_NAME;

      const mongoClientSpy = mongoStub.MongoClient;

      return dataSource.connect().then(() => {

        expect(mongoClientSpy.connectionUrl).to.equal('mongodb://localhost:27017/systemintegration');
      });
    });
  });

  describe('when loading test data into the database', () => {

    describe('and everything goes swimmingly', () => {

      let tickerData;
      let idsOfLoadedTickers;

      beforeEach(async () => {

        const tickersAsJson = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'tickerData.json'));
        tickerData = JSON.parse(tickersAsJson);

        collectionSpy.findReturnsGoodData(tickerData.length);

        await dataSource.connect();

        idsOfLoadedTickers = await dataSource.loadTestData();
      });

      it('returns a collection of the inserted ticker ids', async () => {

        const expectedIds = collectionSpy.cursorStubData.map((data) => {

          // eslint-disable-next-line no-underscore-dangle
          return data._id.toHexString();
        });

        expect(idsOfLoadedTickers).to.deep.equal(expectedIds);
      });

      it('works on the tickers collection', async () => {

        return expect(dbStub.lastCollection).to.equal('tickers');
      });

      it('drops the existing collection from the database first', async () => {

        expect(collectionSpy.dropCalledFirst()).to.equal(true);
      });

      it('inserts new tickers into the database second', async () => {

        expect(collectionSpy.insertManyCalledSecond()).to.equal(true);
      });

      it('inserts the contents of tickerData.json into the database', async () => {

        expect(collectionSpy.lastDataInserted).to.deep.equal(tickerData);
      });

      it('reads the recently inserted tickers back from the database third', async () => {

        expect(collectionSpy.findCalledThird()).to.equal(true);
      });

      it('emits a TEST_DATA_LOADED event when done', () => {

        expect(testDataLoadedEventEmitted).to.be.true;
      });
    });

    describe('and things do not go as planned', () => {

      beforeEach(async () => {

        dbStub.collection().findReturns([
          {
            foo: 'bar',
          },
          {
            bar: 'foo',
          },
        ]);

        await dataSource.connect();
      });

      it('fails the test data load if the number of tickers read back ' +
        'from the db is not the same as that inserted', async () => {

        return expect(dataSource.loadTestData()).to.eventually.be.rejected;
      });

      it('does not emit a TEST_DATA_LOADED event', () => {

        expect(testDataLoadedEventEmitted).to.be.false;
      });
    });
  });

  describe('when finding all updated (with a chromosome) tickers in the database', () => {

    beforeEach(async () => {

      await dataSource.connect();
    });

    describe('and they are all found', () => {

      it('returns a collection of all found tickers', async () => {

        const updatedTickers = [
          { a: 'b' },
          { c: 'd' },
          { e: 'f' },
        ];

        collectionSpy.findReturns(updatedTickers);

        const foundTickers = await dataSource.findAllUpdatedTickers(['a', 'c', 'e']);

        expect(foundTickers).to.deep.equal(updatedTickers);
      });
    });

    it('returns a subset of found tickers if all cannot be found before giving up', async () => {

      const updatedTickers = [
        { a: 'b' },
        { c: 'd' },
      ];

      collectionSpy.findReturns(updatedTickers);

      const foundTickers = await dataSource.findAllUpdatedTickers(['a', 'c', 'e'], { attempts: 1 });

      expect(foundTickers).to.deep.equal(updatedTickers);
    });

    it('searches for all provided ticker ids', async () => {

      const tickerIds = ['123', '456', '789'];
      await dataSource.findAllUpdatedTickers(tickerIds);

      const expectedFindQuery = {
        $or: [
          {
            _id: new mongoStub.ObjectID('123'),
          },
          {
            _id: new mongoStub.ObjectID('456'),
          },
          {
            _id: new mongoStub.ObjectID('789'),
          },
        ],
      };

      expect(collectionSpy.lastFindQuery).to.deep.equal(expectedFindQuery);
    });

    it('searches for everything if no ids provided', async () => {

      await dataSource.findAllUpdatedTickers();
      expect(collectionSpy.lastFindQuery).to.deep.equal({});
    });
  });

  describe('when updating each ticker with a chromosome', () => {

    beforeEach(async () => {

      await dataSource.connect();

      await dataSource.addChromosomeToAllTickers();
    });

    it('calls the db driver updateMany function', () => {

      expect(collectionSpy.updateManyCalled).to.be.true;
    });

    it('updates all chromosomes, no filter applied', async () => {

      expect(collectionSpy.lastUpdateManyFilter).to.deep.equal({});
    });

    it('sets the chromosome to a bogus value', async () => {

      const addChromosomeUpdate = {
        $set:
          { chromosome: '12345' },
      };

      expect(collectionSpy.lastUpdateManyUpdate).to.deep.equal(addChromosomeUpdate);
    });
  });
});
