const { OpenAI } = require("langchain/llms/openai");
const { getDocumentsForProject } = require('./vectorStore');

async function generateQuestions(projectId, numberOfQuestions) {
    try {
        console.log('Generating questions for project:', projectId);
        
        // Get documents for this project
        const documents = await getDocumentsForProject(projectId);
        
        if (!documents || documents.length === 0) {
            throw new Error('No documents found for this project');
        }

        console.log('Found documents:', documents.length);

        // Combine all document content
        const combinedContent = documents.map(doc => doc.pageContent).join('\n\n');
        console.log('Combined content length:', combinedContent.length);

        const model = new OpenAI({
            temperature: 0.7,
            openAIApiKey: process.env.OPENAI_API_KEY,
        });

        const questions = [];

        for (let i = 0; i < numberOfQuestions; i++) {
            const prompt = `
            Based on the following content, generate a multiple-choice question:
            
            ${combinedContent}

            Generate a question in the following JSON format:
            {
                "question": "Write a clear, specific question based on the content",
                "options": ["correct answer", "wrong but plausible answer", "another wrong answer", "another wrong answer"],
                "correctAnswer": 0,
                "explanation": "Brief explanation of why the correct answer is right"
            }

            Ensure the question is challenging but fair, and all answers are plausible but only one is correct.
            Return ONLY the JSON object, no other text.`;

            console.log('Generating question', i + 1);
            const response = await model.call(prompt);

            try {
                const parsedResponse = JSON.parse(response);
                questions.push(parsedResponse);
                console.log('Successfully generated question:', i + 1);
            } catch (error) {
                console.error("Failed to parse question:", response);
                console.error("Error:", error);
            }
        }

        if (questions.length === 0) {
            throw new Error('Failed to generate any valid questions');
        }

        console.log('Successfully generated all questions');
        return questions;
    } catch (error) {
        console.error("Error generating questions:", error);
        throw error;
    }
}

module.exports = {
    generateQuestions
};