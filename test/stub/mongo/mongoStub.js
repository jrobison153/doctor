import mongoFake from 'mongo-fake';
import MongoClientSpy from '../../spy/mongo/MongoClientSpy';

const ObjectIdFake = mongoFake.ObjectID;

const mongoStub = {

  MongoClient: new MongoClientSpy(),
  ObjectID: ObjectIdFake,
};

mongoStub.reset = () => {

  mongoStub.MongoClient = new MongoClientSpy();
};

export default mongoStub;
