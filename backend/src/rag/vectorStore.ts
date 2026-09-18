import { ChromaClient } from "chromadb";
import { getEmbedding } from "./embeddings.js";

const client = new ChromaClient({ path: "http://localhost:8000" });

// Collection banate/access karte hain — collection matlab MongoDB ke "collection" jaisa hi concept
export async function getCollection() {
  const collection = await client.getOrCreateCollection({
    name: "rajan_notes",
    embeddingFunction: null,
  });
  return collection;
}

// Document add karna (text + uska embedding store karna)
export async function addDocument(id, text) {
  const collection = await getCollection();
  const embedding = await getEmbedding(text);

  await collection.add({
    ids: [id],
    embeddings: [embedding],
    documents: [text],
  });

  console.log(`✅ Added document: ${id}`);
}

// Query karna — sabse relevant documents dhoondhna
export async function queryDocuments(questionText, topN = 3) {
  const collection = await getCollection();
  const questionEmbedding = await getEmbedding(questionText);

  const results = await collection.query({
    queryEmbeddings: [questionEmbedding],
    nResults: topN,
  });

  return results.documents[0];
}