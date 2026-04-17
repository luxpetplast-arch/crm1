// File System Mock for Browser Environment
import { Buffer } from 'buffer';

// Buffer ni export qilish
export { Buffer };

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

// Export promises as both named export and property for different import styles
export const promises = {
  readFile: readFile,
  writeFile: writeFile,
};

// Also export individual promise functions as named exports
export const readFilePromise = readFile;
export const writeFilePromise = writeFile;

export default {
  readFile,
  writeFile,
  createReadStream,
  createWriteStream,
  promises,
  Buffer,
};
