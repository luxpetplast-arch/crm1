// PostgreSQL Mock for Browser Environment
export class Client {
  constructor() {}
  async connect() {
    console.log('Mock PostgreSQL client connected');
  }
  async end() {
    console.log('Mock PostgreSQL client disconnected');
  }
  async query(text, params) {
    console.log('Mock PostgreSQL query:', text, params);
    return {
      rows: [],
      rowCount: 0,
      fields: [],
    };
  }
}

export class Pool {
  constructor(config) {
    this.config = config;
  }
  async connect() {
    return new Client();
  }
  async end() {
    console.log('Mock PostgreSQL pool ended');
  }
  async query(text, params) {
    console.log('Mock PostgreSQL pool query:', text, params);
    return {
      rows: [],
      rowCount: 0,
      fields: [],
    };
  }
}

export default {
  Client,
  Pool,
};
