import type { Plugin } from 'vite'

export function fixDynamicImports(): Plugin {
  return {
    name: 'fix-dynamic-imports',
    resolveId(id) {
      // Block problematic Node.js modules
      const blockedModules = [
        'node-fasttext',
        'fastembed',
        '@xenova/transformers',
        'pg',
        'fs',
        'node:fs',
        'fs/promises',
        'path',
        'crypto',
        'events',
        'child_process',
        'stream',
        'mysql2',
        'mysql2/promise',
        'formdata-node/file-from-path'
      ]
      
      if (blockedModules.some(module => id.includes(module))) {
        return '\0virtual:' + id
      }
      return null
    },
    load(id) {
      if (id.startsWith('\0virtual:')) {
        const moduleName = id.replace('\0virtual:', '')
        
        // Return mock modules for blocked imports
        if (moduleName.includes('node-fasttext')) {
          return `export default {
            loadModel: async () => ({
              getWordVector: () => [],
              getSentenceVector: () => [],
              getNearestNeighbors: () => [],
            })
          }`
        }
        
        if (moduleName.includes('fastembed')) {
          return `export const FastEmbed = {
            init: async () => ({
              embed: async () => [],
              embedBatch: async () => [],
            })
          }
          export default FastEmbed`
        }
        
        if (moduleName.includes('@xenova/transformers')) {
          return `export const pipeline = async () => ({
            embeddings: async () => [0.1, 0.2, 0.3],
          })
          export const AutoTokenizer = {
            from_pretrained: async () => ({
              encode: () => [1, 2, 3],
              decode: () => 'mock text',
            })
          }
          export const AutoModel = {
            from_pretrained: async () => ({
              embeddings: async () => [0.1, 0.2, 0.3],
            })
          }
          export default {
            pipeline,
            AutoTokenizer,
            AutoModel,
          }`
        }
        
        if (moduleName.includes('pg')) {
          return `export const Client = class {
            constructor() {}
            async connect() {}
            async end() {}
            async query() { return { rows: [] } }
          }
          export const Pool = class {
            constructor() {}
            async connect() { return new Client() }
            async end() {}
            async query() { return { rows: [] } }
          }
          export default {
            Client,
            Pool,
          }`
        }
        
        if (moduleName.includes('fs')) {
          return `import { Buffer } from 'buffer';
export function readFile(path, options) {
  console.log('Mock fs.readFile:', path);
  return Promise.resolve(Buffer.from(''));
}
export function writeFile(path, data, options) {
  console.log('Mock fs.writeFile:', path);
  return Promise.resolve();
}
export function createReadStream(path, options) {
  console.log('Mock fs.createReadStream:', path);
  return {
    on: (event, handler) => {},
    pipe: (destination) => destination,
  };
}
export function createWriteStream(path, options) {
  console.log('Mock fs.createWriteStream:', path);
  return {
    on: (event, handler) => {},
    write: (chunk, encoding) => true,
    end: (chunk, encoding) => {},
  };
}
export const promises = {
  readFile: readFile,
  writeFile: writeFile,
};
export default {
  readFile,
  writeFile,
  createReadStream,
  createWriteStream,
  promises,
  Buffer,
};`
        }
        
        if (moduleName.includes('path')) {
          return `export default {
            resolve: (...args) => args.join('/'),
            join: (...args) => args.join('/'),
            basename: (path) => path.split('/').pop(),
          }`
        }
        
        if (moduleName.includes('crypto')) {
          return `export default {
            createHash: () => ({
              update: () => ({ digest: () => 'mock-hash' }),
            }),
            createHmac: () => ({
              update: () => ({ digest: () => 'mock-hmac' }),
            }),
          }`
        }
        
        if (moduleName.includes('events')) {
          return `export class EventEmitter {
            constructor() {
              this.events = {};
            }
            on(event, listener) {
              if (!this.events[event]) this.events[event] = [];
              this.events[event].push(listener);
              return this;
            }
            off(event, listener) {
              if (!this.events[event]) return this;
              this.events[event] = this.events[event].filter(l => l !== listener);
              return this;
            }
            emit(event, ...args) {
              if (!this.events[event]) return false;
              this.events[event].forEach(listener => listener(...args));
              return true;
            }
            once(event, listener) {
              const wrapper = (...args) => {
                this.off(event, wrapper);
                listener(...args);
              };
              return this.on(event, wrapper);
            }
            addListener(event, listener) { return this.on(event, listener); }
            removeListener(event, listener) { return this.off(event, listener); }
            removeAllListeners(event) {
              if (event) delete this.events[event];
              else this.events = {};
              return this;
            }
            listenerCount(event) {
              return this.events[event] ? this.events[event].length : 0;
            }
            listeners(event) {
              return this.events[event] ? [...this.events[event]] : [];
            }
            setMaxListeners(n) { return this; }
            getMaxListeners() { return 10; }
          }
          export default EventEmitter;`
        }
        
        if (moduleName.includes('child_process')) {
          return `export function exec(command, options, callback) {
            console.log('Mock child_process.exec:', command);
            if (typeof options === 'function') { callback = options; options = {}; }
            if (callback) callback(null, { stdout: '', stderr: '' });
            return { on: (event, handler) => { if (event === 'close') handler(0); } };
          }
          export function execSync(command, options) {
            console.log('Mock child_process.execSync:', command);
            return '';
          }
          export function spawn(command, args, options) {
            console.log('Mock child_process.spawn:', command, args);
            return {
              on: (event, handler) => { if (event === 'close') handler(0); },
              stdout: { on: (event, handler) => {} },
              stderr: { on: (event, handler) => {} },
            };
          }
          export function fork(modulePath, args, options) {
            console.log('Mock child_process.fork:', modulePath, args);
            return {
              on: (event, handler) => { if (event === 'close') handler(0); },
              send: (message) => {},
            };
          }
          export default { exec, execSync, spawn, fork }`
        }
        
        if (moduleName.includes('mysql2/promise')) {
          return `export class Connection {
            constructor(config) {
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
            async query(sql, values) {
              console.log('Mock MySQL promise query:', sql, values);
              return { rows: [], affectedRows: 0, insertId: 0, fields: [] };
            }
          }
          export class Pool {
            constructor(config) {
              this.config = config;
            }
            async getConnection() {
              console.log('Mock MySQL promise pool getConnection');
              return new Connection(this.config);
            }
            async query(sql, values) {
              console.log('Mock MySQL promise pool query:', sql, values);
              return { rows: [], affectedRows: 0, insertId: 0, fields: [] };
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
          export default { createConnection, createPool, Connection, Pool }`
        }
        
        if (moduleName.includes('formdata-node/file-from-path')) {
          return `export default {
            fileFromPath: async () => new File([], 'mock')
          }`
        }
        
        // Default empty mock
        return 'export default {}'
      }
      return null
    }
  }
}
