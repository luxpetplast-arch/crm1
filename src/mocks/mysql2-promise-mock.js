// MySQL2 Promise Mock for Browser Environment
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

  async connect() {
    console.log('Mock MySQL promise connection:', this.config);
    this.connected = true;
    return this;
  }

  async end() {
    console.log('Mock MySQL promise connection ended');
    this.connected = false;
  }

  async destroy() {
    this.connected = false;
  }

  async query(sql, values) {
    console.log('Mock MySQL promise query:', sql, values);
    return {
      rows: [],
      affectedRows: 0,
      insertId: 0,
      fields: [],
    };
  }

  async execute(sql, values) {
    console.log('Mock MySQL promise execute:', sql, values);
    return {
      rows: [],
      affectedRows: 0,
      insertId: 0,
      fields: [],
    };
  }

  async beginTransaction() {
    console.log('Mock MySQL promise beginTransaction');
  }

  async commit() {
    console.log('Mock MySQL promise commit');
  }

  async rollback() {
    console.log('Mock MySQL promise rollback');
  }
}

export class Pool extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.connections = [];
  }

  async getConnection() {
    console.log('Mock MySQL promise pool getConnection');
    const connection = new Connection(this.config);
    connection.connected = true;
    return connection;
  }

  async query(sql, values) {
    console.log('Mock MySQL promise pool query:', sql, values);
    return {
      rows: [],
      affectedRows: 0,
      insertId: 0,
      fields: [],
    };
  }

  async end() {
    console.log('Mock MySQL promise pool end');
  }
}

export async function createConnection(config) {
  console.log('Mock MySQL promise createConnection:', config);
  return new Connection(config);
}

export async function createPool(config) {
  console.log('Mock MySQL promise createPool:', config);
  return new Pool(config);
}

export default {
  createConnection,
  createPool,
  Connection,
  Pool,
};
