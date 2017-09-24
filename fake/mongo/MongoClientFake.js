import MongoDatabaseFake from './MongoDatabaseFake';

export default class MongoClientFake {

  constructor() {

    this.db = new MongoDatabaseFake();
  }

  connect() {

    return Promise.resolve(this.db);
  }
}
