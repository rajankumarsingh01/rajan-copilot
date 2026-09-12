import "dotenv/config";
import { getEmbedding } from "./rag/embeddings.js";

const emb1 = await getEmbedding("Node.js is a JavaScript runtime");
const emb2 = await getEmbedding("Node.js allows running JS outside the browser");
const emb3 = await getEmbedding("I love eating pizza");

console.log("Embedding 1 (first 5 numbers):", emb1.slice(0, 5));
console.log("Embedding 2 (first 5 numbers):", emb2.slice(0, 5));
console.log("Embedding 3 (first 5 numbers):", emb3.slice(0, 5));
console.log("Total dimensions:", emb1.length);