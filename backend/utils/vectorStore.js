const fs = require('fs');
const path = require('path');

// Store for our documents
let documentStore = {};

async function processDocuments(documentPaths, projectId) {
    try {
        console.log('Processing documents for project:', projectId);
        console.log('Document paths:', documentPaths);

        // Read and store documents
        const documents = [];
        for (const docPath of documentPaths) {
            console.log('Reading document:', docPath);
            const content = fs.readFileSync(docPath, 'utf8');
            documents.push({
                pageContent: content,
                metadata: { source: docPath }
            });
        }

        // Store documents in memory
        documentStore[projectId] = documents;
        console.log('Documents stored for project:', projectId);
        console.log('Number of documents stored:', documents.length);

        return true;
    } catch (error) {
        console.error("Error processing documents:", error);
        throw error;
    }
}

async function getDocumentsForProject(projectId) {
    console.log('Retrieving documents for project:', projectId);
    console.log('Available projects:', Object.keys(documentStore));
    const documents = documentStore[projectId] || [];
    console.log('Found documents:', documents.length);
    return documents;
}

module.exports = {
    processDocuments,
    getDocumentsForProject
};