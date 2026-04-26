// FormData Node Mock for Browser Environment
export function fileFromPath(path, filename, options) {
  console.log('Mock fileFromPath:', path, filename);
  return Promise.resolve(new File([], 'mock-file'));
}

export default {
  fileFromPath,
};
