const { OpenAI } = require("langchain/llms/openai");
const { RetrievalQAChain } = require("langchain/chains");
const { PineconeStore } = require("langchain/vectorstores/pinecone");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { initializePinecone } = require("./pinecone");

async function generateQuestions(projectId, numberOfQuestions) {
  try {
    const embeddings = new OpenAIEmbeddings({ 
      openAIApiKey: process.env.OPENAI_API_KEY 
    });
    
    const pinecone = await initializePinecone();
    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      namespace: projectId.toString(),
    });

    const model = new OpenAI({ 
      temperature: 0.9, 
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-4", // Using GPT-4 for better question generation
    });

    const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());
    const questions = [];

    for (let i = 0; i < numberOfQuestions; i++) {
      const response = await chain.call({
        query: `Generate a multiple-choice question based on the document content. 
                The question should be challenging but fair, with four options where only one is correct.
                Format your response as a valid JSON object with these exact keys:
                {
                  "question": "the question text",
                  "options": ["option1", "option2", "option3", "option4"],
                  "correctAnswer": 0,
                  "explanation": "brief explanation of why the correct answer is right"
                }`,
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
  } catch (error) {
    console.error("Error generating questions:", error);
    throw error;
  }
}

// Function to process and embed documents
async function processDocuments(documents, projectId) {
  try {
    const embeddings = new OpenAIEmbeddings({ 
      openAIApiKey: process.env.OPENAI_API_KEY 
    });

    const pinecone = await initializePinecone();
    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    // Create vector store and upload embeddings
    await PineconeStore.fromDocuments(documents, embeddings, {
      pineconeIndex: index,
      namespace: projectId.toString(),
    });

    return true;
  } catch (error) {
    console.error("Error processing documents:", error);
    throw error;
  }
}

module.exports = { 
  generateQuestions,
  processDocuments 
};