/* eslint-disable no-underscore-dangle */
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import MongoCollectionFake from '../../../../fake/mongo/MongoCollectionFake';
import ObjectID from '../../../../fake/mongo/ObjectIdFake';

chai.use(chaiAsPromised);

describe('MongoCollectionFake tests', () => {

  const docs = [
    {
      a: '1',
    },
    {
      a: '2',
    },
    {
      a: '3',
    },
  ];

  let mongoCollectionFake;

  beforeEach(async () => {

    mongoCollectionFake = new MongoCollectionFake();
  });

  describe('given fake is setup for healthy system', () => {

    let insertResult;

    beforeEach(async () => {

      insertResult = await mongoCollectionFake.insertMany(docs);
    });

    describe('when insertingMany documents', () => {

      it('returns a resolved promise with insertedCount equal to the number of inserted documents', async () => {

        expect(insertResult.insertedCount).to.equal(3);
      });

      it('assigns each document an _id field of type ObjectID', async () => {

        const retrievedDocs = await mongoCollectionFake.find().toArray();

        const filteredDocs = retrievedDocs.filter((doc) => {

          return doc._id && doc._id.toHexString().length === 24;
        });

        expect(filteredDocs).to.have.lengthOf(3);
      });

      it('by default assigns each document a chromosome', () => {

        const filteredDocs = mongoCollectionFake.docs.filter((doc) => {

          return doc.chromosome && doc.chromosome.length > 0;
        });

        expect(filteredDocs).to.have.lengthOf(3);
      });
    });

    describe('when finding documents', () => {

      it('returns all documents when no query is specified', async () => {

        const foundDocs = await mongoCollectionFake.find().toArray();

        const foundDocsStripped = stripKeysFromDocs(foundDocs, ['_id', 'chromosome']);

        expect(foundDocsStripped).to.deep.equal(docs);
      });

      it('returns all documents when an empty query is specified', async () => {

        const foundDocs = await mongoCollectionFake.find({}).toArray();

        const foundDocsWithoutId = stripKeysFromDocs(foundDocs, ['_id', 'chromosome']);

        expect(foundDocsWithoutId).to.deep.equal(docs);
      });

      it('returns subset of documents when $or query used on single object property', async () => {

        const orQuery = {
          $or: [
            {
              a: '1',
            },
            {
              a: '3',
            },
          ],
        };

        const foundDocs = await mongoCollectionFake.find(orQuery).toArray();

        const foundDocsWithoutIds = stripKeysFromDocs(foundDocs, ['_id', 'chromosome']);

        const expectedDocs = [
          {
            a: '1',
          },
          {
            a: '3',
          },
        ];

        expect(foundDocsWithoutIds).to.deep.equal(expectedDocs);
      });

      describe('and $or query has an object match criteria', () => {

        it('returns all documents that match', async () => {

          const expectedDocs = mongoCollectionFake.docs;

          const docIds = expectedDocs.map((doc) => {

            return doc._id;
          });

          const orQueryGuts = docIds.map((id) => {

            return {
              _id: new ObjectID(id.toHexString()),
            };
          });

          const orQuery = {
            $or: orQueryGuts,
          };

          const foundDocs = await mongoCollectionFake.find(orQuery).toArray();

          expect(foundDocs).to.deep.equal(expectedDocs);
        });
      });
    });

    describe('when dropping a collection', () => {

      it('removes all documents', async () => {

        const fakeCollection = new MongoCollectionFake();

        fakeCollection.insertMany(docs);

        // guard assertion
        let foundDocs = await fakeCollection.find().toArray();
        expect(foundDocs).to.have.lengthOf(3);

        await fakeCollection.drop();

        foundDocs = await fakeCollection.find().toArray();
        expect(foundDocs).to.have.lengthOf(0);
      });
    });
  });

  describe('given fake is setup for failed ticker decoration', () => {

    describe('when inserting documents', () => {

      it('does not assign any documents a chromosome', async () => {

        mongoCollectionFake.setupForFailedDecoration();
        await mongoCollectionFake.insertMany(docs);

        const filteredDocs = mongoCollectionFake.docs.filter((doc) => {

          return doc.chromosome && doc.chromosome.length > 0;
        });

        expect(filteredDocs).to.have.lengthOf(0);
      });
    });
  });
});

function stripKeysFromDocs(docs, keysToRemove) {

  const docsWithoutKeys = docs.map((doc) => {

    const docWithoutKeys = { ...doc };

    keysToRemove.forEach((key) => {

      delete docWithoutKeys[key];
    });

    return docWithoutKeys;
  });

  return docsWithoutKeys;
}
