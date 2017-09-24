import MongoCollectionSpy from '../../spy/mongo/MongoCollectionSpy';

export default class MongoDatabaseStub {

  constructor() {

    this.collectionFake = new MongoCollectionSpy();
    this.lastCollection = '';
  }

  collection(name) {

    this.lastCollection = name;
    return this.collectionFake;
  }
}
