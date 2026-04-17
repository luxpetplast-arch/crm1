// FastEmbed Mock for Browser Environment
export const FastEmbed = {
  init: async (options) => {
    console.log('Mock FastEmbed init:', options);
    return {
      embed: async (text) => {
        console.log('Mock FastEmbed embed:', text);
        return [0.1, 0.2, 0.3];
      },
      embedBatch: async (texts) => {
        console.log('Mock FastEmbed embedBatch:', texts);
        return texts.map(() => [0.1, 0.2, 0.3]);
      },
    };
  },
};

export default FastEmbed;
