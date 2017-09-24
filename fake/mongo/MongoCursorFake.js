
export default class MongoCursorFake {

  toArray() {

    return Promise.resolve(this.docsToIterateOver);
  }

  iterateOver(docs) {

    this.docsToIterateOver = docs;
  }
}
