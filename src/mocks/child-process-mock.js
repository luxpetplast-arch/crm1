// Child Process Mock for Browser Environment
export function exec(command, options, callback) {
  console.log('Mock child_process.exec:', command);
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  
  if (callback) {
    callback(null, { stdout: '', stderr: '' });
  }
  
  return {
    on: (event, handler) => {
      if (event === 'close') handler(0);
      if (event === 'error') handler(null);
    },
    kill: () => console.log('Mock kill'),
  };
}

export function execSync(command, options) {
  console.log('Mock child_process.execSync:', command);
  return '';
}

export function spawn(command, args, options) {
  console.log('Mock child_process.spawn:', command, args);
  return {
    on: (event, handler) => {
      if (event === 'close') handler(0);
      if (event === 'exit') handler(0);
      if (event === 'error') handler(null);
    },
    stdout: {
      on: (event, handler) => {
        if (event === 'data') handler(Buffer.from(''));
      },
    },
    stderr: {
      on: (event, handler) => {
        if (event === 'data') handler(Buffer.from(''));
      },
    },
    stdin: {
      write: () => {},
      end: () => {},
    },
    kill: () => console.log('Mock kill'),
  };
}

export function fork(modulePath, args, options) {
  console.log('Mock child_process.fork:', modulePath, args);
  return {
    on: (event, handler) => {
      if (event === 'close') handler(0);
      if (event === 'exit') handler(0);
      if (event === 'error') handler(null);
      if (event === 'message') handler({});
    },
    send: (message) => console.log('Mock send:', message),
    kill: () => console.log('Mock kill'),
  };
}

export function execFile(file, args, options, callback) {
  console.log('Mock child_process.execFile:', file, args);
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  
  if (callback) {
    callback(null, { stdout: '', stderr: '' });
  }
  
  return {
    on: (event, handler) => {
      if (event === 'close') handler(0);
      if (event === 'error') handler(null);
    },
    kill: () => console.log('Mock kill'),
  };
}

export default {
  exec,
  execSync,
  spawn,
  fork,
  execFile,
};
