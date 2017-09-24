import uuid from 'uuid';

export default class ObjectIdFake {

  constructor(id) {

    if (id) {

      this.id = id;
    } else {

      const tempId = uuid.v4();

      const uuidNoDashes = tempId.replace(/-/g, '');

      this.id = uuidNoDashes.substring(0, 24);
    }
  }

  toHexString() {

    return this.id;
  }
}
