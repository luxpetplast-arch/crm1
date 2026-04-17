// fs/promises Mock for Browser Environment
import { Buffer } from 'buffer';

// Buffer ni export qilish
export { Buffer };

// Buffer ni default export qilish
export default {
  readFile,
  writeFile,
  access,
  mkdir,
  readdir,
  stat,
  Buffer,
};

export function readFile(path, options) {
  console.log('Mock fs/promises.readFile:', path);
  return Promise.resolve(Buffer.from(''));
}

export function writeFile(path, data, options) {
  console.log('Mock fs/promises.writeFile:', path);
  return Promise.resolve();
}

export function access(path, mode) {
  console.log('Mock fs/promises.access:', path);
  return Promise.resolve();
}

export function mkdir(path, options) {
  console.log('Mock fs/promises.mkdir:', path);
  return Promise.resolve();
}

export function readdir(path, options) {
  console.log('Mock fs/promises.readdir:', path);
  return Promise.resolve([]);
}

export function stat(path) {
  console.log('Mock fs/promises.stat:', path);
  return Promise.resolve({
    isFile: () => false,
    isDirectory: () => false,
    size: 0,
    mtime: new Date(),
  });
}
