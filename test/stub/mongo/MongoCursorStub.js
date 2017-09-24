
export default class MongoCursorStub {

  constructor() {

    this.data = [];
  }

  toArray() {

    return Promise.resolve(this.data);
  }

}
