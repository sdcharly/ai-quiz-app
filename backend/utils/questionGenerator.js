const { PineconeClient } = require("@pinecone-database/pinecone");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME;

async function initPinecone() {
  const pinecone = new PineconeClient();
  await pinecone.init({
    apiKey: PINECONE_API_KEY,
    environment: PINECONE_ENVIRONMENT,
  });
  return pinecone;
}

async function generateQuestions(projectId, numberOfQuestions) {
  const { OpenAI } = await import("langchain/llms/openai");
  const { RetrievalQAChain } = await import("langchain/chains");
  const { PineconeStore } = await import("langchain/vectorstores/pinecone");
  const { OpenAIEmbeddings } = await import("langchain/embeddings/openai");

  const embeddings = new OpenAIEmbeddings({ openAIApiKey: OPENAI_API_KEY });
  
  const pinecone = await initPinecone();
  const index = pinecone.Index(PINECONE_INDEX_NAME);

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: index,
    namespace: projectId,
  });

  const model = new OpenAI({ temperature: 0.9, openAIApiKey: OPENAI_API_KEY });
  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

  const questions = [];

  for (let i = 0; i < numberOfQuestions; i++) {
    const response = await chain.call({
      query: `Generate a multiple-choice question based on the documents in project ${projectId}. 
              Provide the question, four options, and the correct answer index (0-3). 
              Format the response as a JSON object with keys: question, options (an array), and correctAnswer.`,
    });

    try {
      const parsedResponse = JSON.parse(response.text);
      questions.push(parsedResponse);
    } catch (error) {
      console.error("Failed to parse question:", response.text);
      console.error("Error:", error);
    }
  }

  return questions;
}

module.exports = { generateQuestions };
