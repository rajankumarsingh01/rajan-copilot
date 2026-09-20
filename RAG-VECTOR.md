# Phase 3 — RAG & Vector Databases — Notes

---

## 1. Embeddings

**Problem samjho pehle:**
Agar tumhare paas bahut saara text data hai (notes, documents), aur tum chahte ho LLM usme se **relevant cheez dhoondh ke** jawab de — normal keyword search ("Ctrl+F" jaisa) kaam nahi karta, kyunki words match nahi karte lekin **meaning related** ho sakta hai.

**Example:**
Notes mein: *"Tokens are pieces of text that LLMs process"*
Sawaal: *"context window kya limit karta hai"*
→ Keywords match nahi karte, lekin topic related hai.

**Embedding kya hai?**
Kisi bhi text (word/sentence/paragraph) ko **numbers ki ek list (vector)** mein convert karna — is tarah ki **similar-meaning texts ke numbers ek-dusre ke "paas"** hote hain.

```
"I love programming"   → [0.12, -0.45, 0.78, ...] (768 numbers)
"I enjoy coding"        → [0.14, -0.42, 0.81, ...] (paas — similar meaning)
"The weather is nice"   → [0.89, 0.23, -0.11, ...] (door — alag meaning)
```

**Tumhare MongoDB experience se compare:**
Jaise geospatial queries mein "5km ke andar" dhoondte ho (physical distance), embeddings mein hum **"meaning ka distance"** dhoondte hain.

**Real code:**
```typescript
export async function getEmbedding(text) {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
    config: { outputDimensionality: 768 },
  });
  return response.embeddings[0].values;
}
```
`outputDimensionality: 768` — default 3072 numbers hote hain (bahut bada/heavy), humne 768 tak compress kiya storage/speed ke liye.

---

## 2. Cosine Similarity

**Yeh hai kya?**
Do embeddings kitne "paas" hain, yeh measure karne ka standard tareeka — **0 se 1** ke beech ka number deta hai:
- **1 ke paas** → bahut similar meaning
- **0 ke paas** → unrelated

**Real result jo humne dekha:**
```
Similarity (Node.js sentences): 0.787   ← high, same topic
Similarity (Node.js vs Pizza): 0.468    ← kam, unrelated
```

**Real code:**
```typescript
export function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
```
Formula yaad karne ki zaroorat nahi — bas samajhna hai ki yeh "kitna similar hai" ka score deta hai.

---

## 3. Vector Database (ChromaDB)

**Yeh kyun chahiye — jab manual cosine similarity se kaam ho gaya tha?**

3 sentences ke liye manual comparison chalega, lekin socho **500+ chunks** ho — tab:
1. Khud loop/sort/storage likhna padega (extra complex code)
2. Saare embeddings har baar RAM mein rakhne padenge — data badhne pe slow
3. App restart pe embeddings phir se banane padenge (kuch save nahi hota)

**ChromaDB solve karta hai:**
- Embeddings ko **permanently disk pe store** karta hai
- `.query()` se **automatically top-N sabse similar chunks** deta hai — khud loop/sort nahi likhna
- Optimized search algorithms use karta hai (fast, scalable)

**Tumhare MongoDB experience se compare:**
Bina DB ke → JavaScript array + `.filter()` (chhote data ke liye theek, bade ke liye slow/messy)
MongoDB ke saath → `.find()`, efficient aur persistent
ChromaDB bhi wahi role play karta hai, bas "meaning" pe based search karta hai.

**Setup (Docker):**
```powershell
docker run -d --name chromadb -p 8000:8000 chromadb/chroma
```

**Real code:**
```typescript
const client = new ChromaClient({ host: "localhost", port: 8000, ssl: false });

export async function getCollection() {
  const collection = await client.getOrCreateCollection({
    name: "rajan_notes",
    embeddingFunction: null,  // hum khud embeddings de rahe hain (Gemini se)
    metadata: { "hnsw:space": "cosine" },
  });
  return collection;
}

export async function addDocument(id, text) {
  const collection = await getCollection();
  const embedding = await getEmbedding(text);
  await collection.add({ ids: [id], embeddings: [embedding], documents: [text] });
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
```

**Collection** = MongoDB collection jaisa hi concept — ek "bucket" jisme related documents rakhte hain.

---

## 4. Chunking Strategies

**Problem samjho:**
Agar poora 2000-word document ek hi embedding banao:
1. Multiple topics ek "average meaning" mein mix ho jaate hain — koi topic precisely represent nahi hota
2. Query match hone pe **poora document** LLM ko milega, sirf relevant 2 lines nahi — context window waste hota hai

**Solution: Chunking**
Bade document ko chhote, meaningful pieces mein todna, **har chunk ka alag embedding** banana.

```
Bada document (2000 words)
    ↓ chunking
Chunk 1 (500 chars) → apna embedding
Chunk 2 (500 chars) → apna embedding
...
```

**Chunk size ka trade-off:**
| Chunk size | Problem |
|---|---|
| Bahut chhota (50 chars) | Context adhoora reh jaata hai, sentence beech mein katta hai |
| Bahut bada (5000 chars) | Multiple topics mix, search precise nahi rehta |
| Balanced (300-1000 chars) | Best — meaningful context + precise search |

**Overlapping chunks (better strategy):**
Chunks ke beech thoda **overlap** rakhte hain, taaki sentence boundary pe context na toote.

**Real code:**
```typescript
export function chunkText(text, chunkSize = 500, overlap = 50) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = start + chunkSize;
    chunks.push(text.slice(start, end));
    start = end - overlap;  // thoda peeche se next chunk start
  }
  return chunks;
}
```

**Simple example** (`chunkSize=10`, `overlap=2`):
```
Text: "ABCDEFGHIJKLMNOPQRST"
Chunk 1: "ABCDEFGHIJ"  (0-10)
Chunk 2: "IJKLMNOPQR"  (8-18, I,J overlap)
Chunk 3: "QRST"        (16-20)
```

**Interview relevance:** "RAG accuracy kam hai to kya karoge?" → chunk size/overlap tune karna sabse common fix hai.

---

## 5. Poora RAG Pipeline (End-to-End)

```
1. Document → chunkText() → chhote chunks
2. Har chunk → getEmbedding() → vector (numbers)
3. Vector + text → ChromaDB mein store (addDocument)
4. User sawaal → getEmbedding() → query vector
5. ChromaDB.query() → sabse similar chunks (meaning-based, keyword nahi)
6. Relevant chunks → LLM ko context ke roop mein do → accurate jawab
```

**Real test jo humne kiya:**
Notes file mein 5 topics the (tokens, context window, prompting, function calling, embeddings). Sawaal poocha: *"How does function calling work?"* → sahi chunk mila jisme function calling explain tha, bina keyword match ke, sirf meaning se.

**Yeh real production pattern hai** — jaise ChatGPT ka "apne documents se baat karo" feature isi tarah kaam karta hai.

---

## Quick Self-Test
1. Embeddings kya capture karte hain — words ya meaning?
2. ChromaDB manual cosine similarity se better kyun hai bade data ke liye?
3. Chunk overlap kyun rakhte hain?

*(Answers: 1) Meaning. 2) Persistent storage + automatic optimized search, khud loop/sort nahi likhna. 3) Taaki chunk boundary pe sentence/context na toote.)*