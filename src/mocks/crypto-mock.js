// Crypto Mock for Browser Environment
export function createHash(algorithm) {
  console.log('Mock crypto.createHash:', algorithm);
  return {
    update: (data) => {
      console.log('Mock hash.update:', data);
      return {
        digest: (encoding) => {
          console.log('Mock hash.digest:', encoding);
          return 'mock-hash';
        }
      };
    }
  };
}

export function createHmac(algorithm, key) {
  console.log('Mock crypto.createHmac:', algorithm, key);
  return {
    update: (data) => {
      console.log('Mock hmac.update:', data);
      return {
        digest: (encoding) => {
          console.log('Mock hmac.digest:', encoding);
          return 'mock-hmac';
        }
      };
    }
  };
}

export default {
  createHash,
  createHmac,
};
