import MongoDatabaseStub from '../../stub/mongo/MongoDatabaseStub';

export default class MongoClientSpy {

  constructor() {

    this.db = new MongoDatabaseStub();
  }

  connect(url) {

    this.connectionUrl = url;

    return Promise.resolve(this.db);
  }
}
