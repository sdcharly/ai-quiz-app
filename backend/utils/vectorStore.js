const { ChromaClient } = require('chromadb');
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { Chroma } = require("langchain/vectorstores/chroma");  // Changed from ChromaStore to Chroma
const fs = require('fs');
const path = require('path');

// Create a directory for the Chroma database
const chromaDirectory = path.join(__dirname, '..', 'chroma-db');
if (!fs.existsSync(chromaDirectory)) {
    fs.mkdirSync(chromaDirectory, { recursive: true });
}

const client = new ChromaClient({
    path: chromaDirectory
});

async function processDocuments(documentPaths, projectId) {
    try {
        const embeddings = new OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY
        });

        // Read the documents
        const documents = [];
        for (const docPath of documentPaths) {
            const content = fs.readFileSync(docPath, 'utf8');
            documents.push({
                pageContent: content,
                metadata: { source: docPath }
            });
        }

        // Store documents in Chroma
        const vectorStore = await Chroma.fromDocuments(
            documents,
            embeddings,
            { 
                collectionName: `project-${projectId}`,
                url: `http://localhost:8000`,  // Added URL
                collectionMetadata: {
                    "hnsw:space": "cosine"
                }
            }
        );

        return true;
    } catch (error) {
        console.error("Error processing documents:", error);
        throw error;
    }
}

async function queryVectorStore(projectId, query) {
    try {
        const embeddings = new OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY
        });

        const vectorStore = await Chroma.fromExistingCollection(
            embeddings,
            { 
                collectionName: `project-${projectId}`,
                url: `http://localhost:8000`  // Added URL
            }
        );

        const results = await vectorStore.similaritySearch(query, 5);
        return results;
    } catch (error) {
        console.error("Error querying vector store:", error);
        throw error;
    }
}

module.exports = {
    processDocuments,
    queryVectorStore
};