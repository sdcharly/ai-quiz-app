const { OpenAI } = require("langchain/llms/openai");
const { RetrievalQAChain } = require("langchain/chains");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { Chroma } = require("langchain/vectorstores/chroma");  // Changed from ChromaStore to Chroma
const fs = require('fs');

async function generateQuestions(projectId, numberOfQuestions) {
    try {
        const embeddings = new OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY
        });

        // Load the vector store
        const vectorStore = await Chroma.fromExistingCollection(
            embeddings,
            { 
                collectionName: `project-${projectId}`,
                url: `http://localhost:8000`  // Added URL
            }
        );

        const model = new OpenAI({
            temperature: 0.9,
            openAIApiKey: process.env.OPENAI_API_KEY,
            modelName: "gpt-4",
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

module.exports = {
    generateQuestions
};