import MongoClientSpy from '../../spy/mongo/MongoClientSpy';
import ObjectIdFake from '../../../fake/mongo/ObjectIdFake';

const mongoStub = {

  MongoClient: new MongoClientSpy(),
  ObjectID: ObjectIdFake,
};

mongoStub.reset = () => {

  mongoStub.MongoClient = new MongoClientSpy();
};

export default mongoStub;
