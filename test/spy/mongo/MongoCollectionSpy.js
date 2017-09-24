import MongoCursorStub from '../../stub/mongo/MongoCursorStub';
import ObjectID from '../../../fake/mongo/ObjectIdFake';

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
  }

  drop() {

    this.callStack.push('drop');

    return Promise.resolve();
  }

  insertMany(data) {

    this.callStack.push('insertMany');
    this.lastDataInserted = data;

    return Promise.resolve();
  }

  find(query) {

    this.callStack.push('find');
    this.lastFindQuery = query;
    this.findCallCount = this.findCallCount + 1;

    return this.cursorStub;
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
