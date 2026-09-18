import "dotenv/config";
import { readFileSync } from "fs";
import { chunkText } from "./rag/chunking.js";
import { addDocument, queryDocuments } from "./rag/vectorStore.js";

// File padhna
const notesText = readFileSync("sample-notes.md", "utf-8");

// Chunks banana
const chunks = chunkText(notesText, 300, 30);
console.log(`📄 Total chunks created: ${chunks.length}`);

// Har chunk ko ChromaDB mein daalna
for (let i = 0; i < chunks.length; i++) {
  await addDocument(`chunk-${i}`, chunks[i]);
}

// Ab sawaal poochte hain
const results = await queryDocuments("How does function calling work?");
console.log("🔍 Most relevant chunk:", results[0]);