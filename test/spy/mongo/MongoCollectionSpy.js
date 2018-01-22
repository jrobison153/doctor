import mongoFake from 'mongo-fake';
import MongoCursorStub from '../../stub/mongo/MongoCursorStub';


const ObjectID = mongoFake.ObjectID;
const FIRST = 0;
const SECOND = 1;
const THIRD = 2;

export default class MongoCollectionSpy {

  constructor() {

    this.cursorStub = new MongoCursorStub();

    this.callStack = [];

    this.lastDataInserted = {};

    this.lastFindQuery = {};
    this.findCallCount = 0;

    this.updateManyCalled = false;
    this.lastUpdateManyFilter = undefined;
    this.lastUpdateManyUpdate = undefined;
  }

  drop() {

    this.callStack.push('drop');

    return Promise.resolve();
  }

  find(query) {

    this.callStack.push('find');
    this.lastFindQuery = query;
    this.findCallCount = this.findCallCount + 1;

    return this.cursorStub;
  }

  insertMany(data) {

    this.callStack.push('insertMany');
    this.lastDataInserted = data;

    return Promise.resolve();
  }

  updateMany(filter, update) {

    this.updateManyCalled = true;
    this.lastUpdateManyFilter = filter;
    this.lastUpdateManyUpdate = update;

    return Promise.resolve();
  }

  // ======================== non-Mongo Collection API functions below

  dropCalledFirst() {

    return this.operationCalledInOrder('drop', FIRST);
  }

  insertManyCalledSecond() {

    return this.operationCalledInOrder('insertMany', SECOND);
  }

  findCalledThird() {

    return this.operationCalledInOrder('find', THIRD);
  }

  findReturns(cannedResponseForCursor) {

    this.cursorStubData = cannedResponseForCursor;
    this.cursorStub.data = cannedResponseForCursor;
  }

  findReturnsGoodData(numItemsToReturn) {

    this.cursorStub.data = [];

    [...Array(numItemsToReturn).keys()].forEach(() => {

      const itemToAddToCursor = {
        _id: new ObjectID(),
      };

      this.cursorStub.data.push(itemToAddToCursor);
    });

    this.cursorStubData = this.cursorStub.data;
  }

  operationCalledInOrder(operation, order) {

    let wasCalledInRightOrder = false;

    if (this.callStack[order] === operation) {

      wasCalledInRightOrder = true;
    }

    return wasCalledInRightOrder;
  }
}
