# Phase 1 — AI/LLM Fundamentals — Notes

---

## 1. Tokens

**Yeh hai kya?**
LLM text ko seedha "words" ki tarah nahi padhta. Wo text ko chhote-chhote pieces mein todta hai — inhe **tokens** kehte hain. Ek token pura word ho sakta hai, ya word ka ek hissa bhi.

**Example:**
```
"I love coding" → ["I", " love", " cod", "ing"]  (roughly 4 tokens)
```

**Kyun zaroori hai?**
- LLM providers tumse **tokens ke hisaab se paisa** lete hain (input + output dono count hote hain)
- Model ki memory limit (context window) bhi tokens mein measure hoti hai

**Tumhare MERN experience se compare:**
Jaise JavaScript `.split()` se string todte ho, waise hi LLM ka tokenizer text todta hai — bas rules zyada smart hain.

---

## 2. Context Window

**Yeh hai kya?**
Har LLM ki ek **memory limit** hoti hai — ek baar mein maximum kitne tokens wo "dekh" sakta hai (system prompt + chat history + current message + response, sab milaake).

**Example:**
Agar context window 8,000 tokens hai, aur conversation already 7,900 tokens ki ho chuki hai, aur tum 500 tokens ka naya sawaal poochte ho → **error aayega** ya purani history drop ho sakti hai.

**Kaunsi problem solve karta hai?**
Batata hai ki LLM ek baar mein kitna "yaad" rakh sakta hai. Isi limitation ki wajah se **RAG (Phase 3)** ki zaroorat padti hai — jab data context window se bada ho, sirf relevant parts bhejte hain, sab kuch nahi.

**Tumhare Express experience se compare:**
Jaise `express.json({ limit: '10mb' })` — request body ki max size hoti hai, waise hi context window conversation ki max size hai.

**Interview tip:** "agar chatbot lambi conversation mein context bhool jaaye to kya karoge?" → answer: RAG use karo, ya sliding window se purani history summarize karo.

---

## 3. LLM API Basics (Groq/Anthropic/OpenAI)

**Yeh hai kya?**
LLM providers (Groq, OpenAI, Anthropic) apna model ek **REST API** ke through expose karte hain. Tum ek HTTP request bhejte ho (prompt ke saath), wo AI-generated response wapas dete hain.

**Real code se samjho:**
```typescript
const response = await groq.chat.completions.create({
  model: "openai/gpt-oss-120b",
  messages: [{ role: "user", content: "Explain APIs" }],
});
```
- `messages` array conversation ka format hai — `role` batata hai kaun bol raha hai (`user`/`assistant`/`system`)
- Response ek nested object mein aata hai: `response.choices[0].message.content`

**Note:** Models providers regularly deprecate/update karte rehte hain (humne khud dekha — `llama-3.3-70b-versatile` deprecate ho gaya beech mein). Isliye model naam `.env` file mein rakhna best practice hai, hardcode nahi karna.

---

## 4. Prompt Engineering

**Yeh hai kya?**
Prompt ko is tarah likhna ki LLM se best/predictable/useful jawab mile — bilkul jaise Express mein input validate/structure karte ho.

### a) Zero-shot
Bina example diye seedha sawaal poochna.
```
"Classify the sentiment: 'This product is amazing!'"
```
→ Explanation ke saath jawab deta hai.

### b) Few-shot
Kuch examples dikhake pattern sikhana — taaki LLM usi format mein jawab de.
```
Text: "This product is amazing!" -> Positive
Text: "Worst purchase ever." -> Negative
Text: "It's okay, does the job." -> Neutral
Text: "Delivery was super fast" -> ?
```
→ Crisp jawab deta hai: `Positive`

**Kab use karo:** jab tumhe **specific format/style** consistent chahiye (classification, extraction).

### c) Chain-of-Thought (CoT)
LLM ko step-by-step sochne ko kehna — especially reasoning/math ke liye.
```
"Solve step by step: A train travels at 60 km/h for 2.5 hours. 
How much distance does it cover? Show your reasoning."
```
→ Pehle formula, phir calculation, phir final answer deta hai.

**Kab use karo:** jab tumhe **reasoning/logic/calculation** chahiye.

**Yaad rakhne ka trick:**
| Technique | Kab use karo |
|---|---|
| Zero-shot | Simple/generic task |
| Few-shot | Format/style control chahiye |
| CoT | Reasoning/math/multi-step logic chahiye |

---

## 5. Structured JSON Output

**Yeh hai kya?**
Real apps mein LLM ka output **code mein use** karna hota hai (DB mein save, frontend pe render) — plain paragraph kaam nahi karta, humein **predictable JSON** chahiye.

**Do tareeke:**

1. **Prompt mein bolna:**
```
"Respond ONLY in valid JSON: { "sentiment": "...", "confidence": "..." }"
```
Yeh reliable nahi hai — kabhi LLM extra text bhi de sakta hai.

2. **Provider ka native JSON mode (better, reliable):**
```typescript
response_format: { type: "json_object" }
```
Isse LLM **guaranteed** valid JSON hi return karega.

**Real example (jo humne implement kiya):**
```typescript
export async function askGroqJSON(userMessage) {
  const response = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL,
    messages: [{ role: "user", content: userMessage }],
    response_format: { type: "json_object" },
  });
  const rawText = response.choices[0].message.content;
  return JSON.parse(rawText);  // ab yeh real JS object hai
}
```

**Kaunsi problem solve karta hai?**
LLM ke random-paragraph output ko **reliable, parseable data structure** mein convert karta hai — taaki frontend/DB mein directly use ho sake, bina fragile string-parsing ke.

**Real-world use case:** Coaching app mein LLM se quiz questions generate karwana:
```json
{ "question": "What is 2+2?", "options": ["2","3","4","5"], "correctAnswer": "4" }
```

---

## 6. Rate Limits & Prompt Caching

**Rate Limits kya hain?**
Provider tumhare API usage pe limit lagata hai — RPM (requests per minute), TPM (tokens per minute). Cross karne pe `429 Too Many Requests` error aata hai.

**Tumhare Express experience se compare:**
Bilkul `express-rate-limit` middleware jaisa — bas yahan Groq khud tum pe limit lagata hai.

**Fix:** production mein **retry logic** likhte hain — 429 aaye to thoda wait karke dobara try karo.

**Prompt Caching kya hai?**
Agar prompt ka ek hissa baar-baar same hai (jaise fixed system instruction), provider usse cache kar leta hai — dobara process nahi karta, cost/speed dono improve hoti hai.

**Example:** 500-token system prompt + 20-token user question. Bina caching, har baar 520 tokens charge. Caching se, sirf pehli baar 500 tokens charge, baad mein sirf naya 20-token part process hota hai.

**Interview relevance:** "Production mein LLM cost kaise control karoge?" → prompt caching + rate-limit-aware retry logic + request batching.

---

## Quick Self-Test
1. Context window aur rate limit mein kya farak hai?
2. Few-shot kab use karoge, zero-shot ke bajaye?
3. `response_format: json_object` kya guarantee karta hai?

*(Answers: 1) Context window = capacity per conversation; rate limit = speed restriction over time. 2) Jab format/style control chahiye. 3) Response hamesha valid JSON hoga, plain text nahi.)*