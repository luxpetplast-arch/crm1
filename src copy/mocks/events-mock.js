// Events Mock for Browser Environment
export class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return this;
  }

  addListener(event, listener) {
    return this.on(event, listener);
  }

  once(event, listener) {
    const onceWrapper = (...args) => {
      this.off(event, onceWrapper);
      listener(...args);
    };
    return this.on(event, onceWrapper);
  }

  off(event, listener) {
    if (!this.events[event]) return this;
    this.events[event] = this.events[event].filter(l => l !== listener);
    return this;
  }

  removeListener(event, listener) {
    return this.off(event, listener);
  }

  removeAllListeners(event) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
    return this;
  }

  emit(event, ...args) {
    if (!this.events[event]) return false;
    this.events[event].forEach(listener => {
      try {
        listener(...args);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
    return true;
  }

  listenerCount(event) {
    return this.events[event] ? this.events[event].length : 0;
  }

  listeners(event) {
    return this.events[event] ? [...this.events[event]] : [];
  }

  rawListeners(event) {
    return this.events[event] ? [...this.events[event]] : [];
  }

  setMaxListeners(n) {
    console.log('Mock setMaxListeners:', n);
    return this;
  }

  getMaxListeners() {
    return 10;
  }
}

export default EventEmitter;
