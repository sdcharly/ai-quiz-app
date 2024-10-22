const { PineconeClient } = require('@pinecone-database/pinecone');

const pinecone = new PineconeClient();

async function initializePinecone() {
  await pinecone.init({
    apiKey: process.env.PINECONE_API_KEY,
    cloud: process.env.PINECONE_CLOUD,
    region: process.env.PINECONE_REGION
  });
  return pinecone;
}

async function ensureIndexExists(dimension = 1536) { // OpenAI embeddings are 1536 dimensions
  const indexName = process.env.PINECONE_INDEX_NAME;
  const existingIndexes = await pinecone.listIndexes();
  
  if (!existingIndexes.includes(indexName)) {
    await pinecone.createIndex({
      createRequest: {
        name: indexName,
        dimension: dimension,
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: process.env.PINECONE_CLOUD,
            region: process.env.PINECONE_REGION
          }
        }
      },
    });
    console.log(`Created new serverless Pinecone index: ${indexName}`);
  } else {
    console.log(`Pinecone index ${indexName} already exists`);
  }
  return indexName;
}

async function upsertVectors(vectors, namespace) {
  const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);
  await index.upsert({
    upsertRequest: {
      vectors,
      namespace
    }
  });
}

async function queryVectors(queryVector, namespace, topK = 5) {
  const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);
  const queryResponse = await index.query({
    queryRequest: {
      vector: queryVector,
      topK,
      includeValues: true,
      includeMetadata: true,
      namespace
    },
  });
  return queryResponse.matches;
}

module.exports = {
  initializePinecone,
  ensureIndexExists,
  upsertVectors,
  queryVectors,
};