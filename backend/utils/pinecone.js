const { PineconeClient } = require('@pinecone-database/pinecone');

const pinecone = new PineconeClient();

async function initializePinecone() {
  await pinecone.init({
    apiKey: process.env.PINECONE_API_KEY,
    cloud: process.env.PINECONE_CLOUD,
    region: process.env.PINECONE_REGION
  });
}

async function createIndex(indexName, dimension) {
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
}

async function upsertVectors(indexName, vectors) {
  const index = pinecone.Index(indexName);
  await index.upsert({ upsertRequest: { vectors } });
}

async function queryVectors(indexName, queryVector, topK) {
  const index = pinecone.Index(indexName);
  const queryResponse = await index.query({
    queryRequest: {
      vector: queryVector,
      topK: topK,
      includeValues: true,
      includeMetadata: true,
    },
  });
  return queryResponse.matches;
}

module.exports = {
  initializePinecone,
  createIndex,
  upsertVectors,
  queryVectors,
};
