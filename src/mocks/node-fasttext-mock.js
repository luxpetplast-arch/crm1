// Node FastText Mock for Browser Environment
export default {
  loadModel: async (modelPath) => {
    console.log('Mock FastText loadModel:', modelPath);
    return {
      getWordVector: (word) => {
        console.log('Mock getWordVector:', word);
        return [0.1, 0.2, 0.3];
      },
      getSentenceVector: (sentence) => {
        console.log('Mock getSentenceVector:', sentence);
        return [0.4, 0.5, 0.6];
      },
      getNearestNeighbors: (word, k) => {
        console.log('Mock getNearestNeighbors:', word, k);
        return [];
      },
    };
  },
};
