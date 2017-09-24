import MongoClientFake from './MongoClientFake';
import ObjectIdFake from './ObjectIdFake';

const mongoFake = {

  MongoClient: new MongoClientFake(),
  ObjectID: ObjectIdFake,
};

mongoFake.reset = () => {

  mongoFake.MongoClient = new MongoClientFake();
};

export default mongoFake;
