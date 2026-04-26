// Transformers Mock for Browser Environment
export const pipeline = async (task, model, options) => {
  console.log('Mock transformers pipeline:', task, model);
  return {
    embeddings: async (text) => {
      console.log('Mock embeddings:', text);
      return [0.1, 0.2, 0.3];
    },
  };
};

export const AutoTokenizer = {
  from_pretrained: async (modelName, options) => {
    console.log('Mock AutoTokenizer.from_pretrained:', modelName);
    return {
      encode: (text) => {
        console.log('Mock tokenizer.encode:', text);
        return [1, 2, 3];
      },
      decode: (tokens) => {
        console.log('Mock tokenizer.decode:', tokens);
        return 'mock decoded text';
      },
    };
  },
};

export const AutoModel = {
  from_pretrained: async (modelName, options) => {
    console.log('Mock AutoModel.from_pretrained:', modelName);
    return {
      embeddings: async (input) => {
        console.log('Mock model embeddings:', input);
        return [0.1, 0.2, 0.3];
      },
    };
  },
};

export default {
  pipeline,
  AutoTokenizer,
  AutoModel,
};
