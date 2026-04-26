// MySQL2 Mock for Browser Environment
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

export class Connection extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.connected = false;
  }

  connect(callback) {
    console.log('Mock MySQL connection:', this.config);
    this.connected = true;
    if (callback) callback(null, this);
    return Promise.resolve(this);
  }

  end(callback) {
    console.log('Mock MySQL connection ended');
    this.connected = false;
    if (callback) callback();
    return Promise.resolve();
  }

  destroy() {
    this.connected = false;
  }

  query(sql, values, callback) {
    console.log('Mock MySQL query:', sql, values);
    const result = {
      rows: [],
      affectedRows: 0,
      insertId: 0,
      fields: [],
    };
    
    if (typeof values === 'function') {
      callback = values;
      values = [];
    }
    
    if (callback) callback(null, result);
    return Promise.resolve(result);
  }

  execute(sql, values, callback) {
    console.log('Mock MySQL execute:', sql, values);
    const result = {
      rows: [],
      affectedRows: 0,
      insertId: 0,
      fields: [],
    };
    
    if (typeof values === 'function') {
      callback = values;
      values = [];
    }
    
    if (callback) callback(null, result);
    return Promise.resolve(result);
  }

  beginTransaction(callback) {
    console.log('Mock MySQL beginTransaction');
    if (callback) callback();
    return Promise.resolve();
  }

  commit(callback) {
    console.log('Mock MySQL commit');
    if (callback) callback();
    return Promise.resolve();
  }

  rollback(callback) {
    console.log('Mock MySQL rollback');
    if (callback) callback();
    return Promise.resolve();
  }
}

export class Pool extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.connections = [];
  }

  getConnection(callback) {
    console.log('Mock MySQL pool getConnection');
    const connection = new Connection(this.config);
    connection.connected = true;
    if (callback) callback(null, connection);
    return Promise.resolve(connection);
  }

  query(sql, values, callback) {
    console.log('Mock MySQL pool query:', sql, values);
    const result = {
      rows: [],
      affectedRows: 0,
      insertId: 0,
      fields: [],
    };
    
    if (typeof values === 'function') {
      callback = values;
      values = [];
    }
    
    if (callback) callback(null, result);
    return Promise.resolve(result);
  }

  end(callback) {
    console.log('Mock MySQL pool end');
    if (callback) callback();
    return Promise.resolve();
  }
}

export function createConnection(config) {
  console.log('Mock MySQL createConnection:', config);
  return new Connection(config);
}

export function createPool(config) {
  console.log('Mock MySQL createPool:', config);
  return new Pool(config);
}

export default {
  createConnection,
  createPool,
  Connection,
  Pool,
};
