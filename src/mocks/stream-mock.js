// Stream Mock for Browser Environment
export class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(listener);
    return this;
  }

  emit(event, ...args) {
    if (!this.events[event]) return false;
    this.events[event].forEach(listener => listener(...args));
    return true;
  }
}

export class Readable extends EventEmitter {
  constructor(options) {
    super();
    this.readable = true;
    this._read = () => {};
  }

  read(size) {
    return null;
  }

  pause() {
    return this;
  }

  resume() {
    return this;
  }

  pipe(destination) {
    return destination;
  }

  unpipe(destination) {
    return this;
  }

  destroy(error) {
    this.emit('close');
    return this;
  }
}

export class Writable extends EventEmitter {
  constructor(options) {
    super();
    this.writable = true;
    this._write = () => {};
  }

  write(chunk, encoding, callback) {
    if (typeof encoding === 'function') {
      callback = encoding;
      encoding = null;
    }
    if (callback) callback();
    return true;
  }

  end(chunk, encoding, callback) {
    if (typeof encoding === 'function') {
      callback = encoding;
      encoding = null;
    }
    this.emit('finish');
    if (callback) callback();
    return this;
  }

  destroy(error) {
    this.emit('close');
    return this;
  }
}

export class Duplex extends Readable {
  constructor(options) {
    super(options);
    this.writable = true;
  }

  write(chunk, encoding, callback) {
    if (typeof encoding === 'function') {
      callback = encoding;
      encoding = null;
    }
    if (callback) callback();
    return true;
  }

  end(chunk, encoding, callback) {
    if (typeof encoding === 'function') {
      callback = encoding;
      encoding = null;
    }
    this.emit('finish');
    if (callback) callback();
    return this;
  }
}

export class Transform extends Duplex {
  constructor(options) {
    super(options);
    this._transform = () => {};
  }

  _transform(chunk, encoding, callback) {
    this.push(chunk);
    callback();
  }
}

export default {
  Readable,
  Writable,
  Duplex,
  Transform,
};
