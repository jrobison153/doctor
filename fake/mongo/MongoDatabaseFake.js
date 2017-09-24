import MongoCollectionFake from './MongoCollectionFake';

export default class MongoDatabaseFake {

  constructor() {

    this.collectionFake = new MongoCollectionFake();
  }

  collection() {

    return this.collectionFake;
  }
}
