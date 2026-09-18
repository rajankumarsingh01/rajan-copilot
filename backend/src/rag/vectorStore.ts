import { ChromaClient } from "chromadb";
import { getEmbedding } from "./embeddings.js";

const client = new ChromaClient({ host: "localhost", port: 8000, ssl: false });

let cachedCollection = null;

export async function getCollection() {
  if (cachedCollection) return cachedCollection;

  cachedCollection = await client.getOrCreateCollection({
    name: "rajan_notes",
    embeddingFunction: null,
    metadata: { "hnsw:space": "cosine" },
  });

  return cachedCollection;
}

export async function addDocument(id, text) {
  const collection = await getCollection();
  const embedding = await getEmbedding(text);

  await collection.add({
    ids: [id],
    embeddings: [embedding],
    documents: [text],
  });

  console.log(`Added document: ${id}`);
}

export async function queryDocuments(questionText, topN = 3) {
  const collection = await getCollection();
  const questionEmbedding = await getEmbedding(questionText);

  const results = await collection.query({
    queryEmbeddings: [questionEmbedding],
    nResults: topN,
  });

  return results.documents[0];
}