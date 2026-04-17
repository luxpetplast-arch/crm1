// Path Mock for Browser Environment
export function resolve(...args) {
  console.log('Mock path.resolve:', args);
  return args.join('/');
}

export function join(...args) {
  console.log('Mock path.join:', args);
  return args.join('/');
}

export function basename(path) {
  console.log('Mock path.basename:', path);
  return path.split('/').pop();
}

export default {
  resolve,
  join,
  basename,
};
