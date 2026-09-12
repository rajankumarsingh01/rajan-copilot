import "dotenv/config";
import { getEmbedding, cosineSimilarity } from "./rag/embeddings.js";

const emb1 = await getEmbedding("Node.js is a JavaScript runtime");
const emb2 = await getEmbedding("Node.js allows running JS outside the browser");
const emb3 = await getEmbedding("I love eating pizza");

console.log("Embedding 1 (first 5 numbers):", emb1.slice(0, 5));
console.log("Embedding 2 (first 5 numbers):", emb2.slice(0, 5));
console.log("Embedding 3 (first 5 numbers):", emb3.slice(0, 5));
console.log("Total dimensions:", emb1.length);









const similarity1vs2 = cosineSimilarity(emb1, emb2);
const similarity1vs3 = cosineSimilarity(emb1, emb3);

console.log("Similarity (Node.js sentences):", similarity1vs2);
console.log("Similarity (Node.js vs Pizza):", similarity1vs3);