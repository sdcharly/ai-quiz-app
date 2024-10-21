const { OpenAI } = require("langchain/llms/openai");
const { RetrievalQAChain } = require("langchain/chains");
const { PineconeStore } = require("langchain/vectorstores/pinecone");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { PineconeClient } = require("@pinecone-database/pinecone");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_CLOUD = process.env.PINECONE_CLOUD;
const PINECONE_REGION = process.env.PINECONE_REGION;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME;

const embeddings = new OpenAIEmbeddings({ openAIApiKey: OPENAI_API_KEY });

async function initPinecone() {
  const pinecone = new PineconeClient();
  await pinecone.init({
    apiKey: PINECONE_API_KEY,
    cloud: PINECONE_CLOUD,
    region: PINECONE_REGION,
  });
  return pinecone;
}

async function generateQuestions(projectId, numberOfQuestions) {
  const pinecone = await initPinecone();
  const index = pinecone.Index(PINECONE_INDEX_NAME);

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: index,
    namespace: projectId, // Using projectId as namespace
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
