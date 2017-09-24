/* eslint-disable class-methods-use-this */
import deepEqual from 'deep-equal';
import MongoCursorFake from './MongoCursorFake';
import ObjectID from './ObjectIdFake';

/**
 * Monogo fake supporting Doctor's batch ticker processing test. Mostly oblivious to the concept of tickers
 * except for the insertMany function which adds a chromosome to support successful batch processing tests.
 */
export default class MongoCollectionFake {

  constructor() {

    this.docs = [];
    this.isDecoratingOnInsert = true;
    this.cursorStub = new MongoCursorFake();
  }

  drop() {

    this.docs = [];
    return Promise.resolve();
  }

  /**
   * insert documents into he database
   * see http://mongodb.github.io/node-mongodb-native/2.2/api/Collection.html#insertMany
   *
   * @param docs - Array of objects
   * @returns {Promise.<{insertedCount}>}
   */
  insertMany(docs) {

    const docsWithId = docs.map((doc) => {

      const updatedDocWithId = {
        _id: new ObjectID(),
        ...doc,
      };

      if (this.isDecoratingOnInsert) {

        updatedDocWithId.chromosome = '1234';
      }

      return updatedDocWithId;
    });

    this.docs = [...this.docs, ...docsWithId];

    return Promise.resolve({ insertedCount: docs.length });
  }

  /**
   * find documents in the database, see http://mongodb.github.io/node-mongodb-native/2.2/api/Collection.html#find
   *
   * @param query
   * @returns {MongoCursorFake}
   */
  find(query) {

    let docsToIterateOver = this.docs;

    if (query && query.$or) {

      const queryDocs = query.$or;

      docsToIterateOver = this.filterDocsOr(queryDocs);
    }

    this.cursorStub.iterateOver(docsToIterateOver);

    return this.cursorStub;
  }

  /**
   * Filter this collections documents based on an 'or' type query
   *
   * @param queryDocs
   * @returns {Array}
   */
  filterDocsOr(queryDocs) {

    let filteredDocs = [];

    queryDocs.forEach((queryDoc) => {

      const propertyToMatch = Object.keys(queryDoc)[0];

      const matchingDocs = this.docs.filter((doc) => {

        return MongoCollectionFake.isPropertyPresentAndMatching(doc, queryDoc, propertyToMatch);
      });

      filteredDocs = [...filteredDocs, ...matchingDocs];
    });

    return filteredDocs;
  }

  setupForFailedDecoration() {

    this.isDecoratingOnInsert = false;
  }
}

MongoCollectionFake.isPropertyPresentAndMatching = (targetObj, testObj, property) => {

  let propertyIsPresentAndMatching = false;
  const targetValue = targetObj[property];

  if (targetValue !== undefined) {

    propertyIsPresentAndMatching = deepEqual(targetValue, testObj[property], { strict: true });
  }

  return propertyIsPresentAndMatching;
};
