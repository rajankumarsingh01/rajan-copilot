# Phase 2 — Function Calling & Tool Use — Notes

---

## 1. Function Calling kya hai?

**Problem samjho:**
LLM sirf apne **training data ke fixed snapshot** ko jaanta hai — usse real-time/live/private data nahi pata (jaise aaj ki date, tumhare repo ka current code, ya database ka data). Function calling isi problem ka solution hai.

**Idea:**
Hum LLM ko bolte hain "yeh tools tumhare paas available hain". LLM khud decide karta hai **kaunsa tool, kab, aur kya arguments ke saath** call karna hai. LLM khud tool run nahi karta — wo bas bolta hai "mujhe yeh function chalana hai", aur **hamara code actually chalata hai**, result wapas LLM ko dete hain.

**Flow:**
```
User: "Aaj Bengaluru ka weather kaisa hai?"
LLM sochta hai: "Mere paas real-time data nahi hai, lekin getWeather(city) tool hai"
LLM output: { tool: "getWeather", arguments: { city: "Bengaluru" } }
Hamara code: actual weather API call karta hai, result LLM ko deta hai
LLM: result ko natural language mein explain karta hai
```

**Tumhare Express experience se compare:**
Jaise API route handler decide karta hai kaunsa controller function chalana hai based on request body — bas yahan "decide karne wala" LLM hai, "controller functions" tumhare tools hain.

**Yeh Agentic AI ki neev hai** — Phase 4 ka autonomous agent isi function calling pe based hai, bas loop mein chalta hai (multiple tools baar-baar call karta hai jab tak task complete na ho).

---

## 2. Tool Schema Design

**Yeh hai kya?**
LLM ko tool ke baare mein batane ka tareeka — JSON schema format mein.

**Real code:**
```typescript
const tools = [
  {
    type: "function",
    function: {
      name: "getGitLog",
      description: "Use this to list commit MESSAGES and commit history (titles only, no code). Good for questions like 'what were my recent commits'.",
      parameters: { type: "object", properties: {} },
    },
  },
];
```

**Sabse important cheez: `description`**
LLM **isi text ko padhke decide karta hai** ki tool kab use karna hai. Jitni clear description, utna better decision LLM lega.

**Real experience jo humne face kiya:**
Shuru mein `getGitLog` aur `getGitDiff` ke descriptions similar the — LLM dono baar galat se `getGitLog` hi choose kar raha tha (jabki dusre sawaal ke liye `getGitDiff` sahi tha). Fix karne ke liye descriptions ko **explicit examples ke saath rewrite** kiya:

```typescript
description: "Use this to see the ACTUAL CODE that changed (line-by-line additions/deletions) in the most recent commit. Good for questions like 'what code changed'."
```

Isse LLM ne sahi tool choose karna shuru kar diya.

**Lesson:** Tool description likhna bhi ek **prompt engineering ka form hai** — jitna specific/contrasting, utna accurate selection.

---

## 3. Tool ko Actually Execute Karna

**Real code:**
```typescript
export async function askGroqWithTools(userMessage, tools, toolFunctions) {
  const response = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL,
    messages: [{ role: "user", content: userMessage }],
    tools: tools,
    tool_choice: "auto",
  });

  const message = response.choices[0].message;

  if (message.tool_calls) {
    const toolCall = message.tool_calls[0];
    const toolName = toolCall.function.name;   // e.g. "getGitLog"

    const toolResult = toolFunctions[toolName]();  // dynamic function call
    return `Tool "${toolName}" ka result:\n${toolResult}`;
  }

  return message.content;  // agar tool ki zaroorat hi nahi thi
}
```

**Line-by-line samjho:**
- `tool_choice: "auto"` — LLM khud decide karega tool use karna hai ya nahi
- `message.tool_calls` — agar LLM ne tool use karne ka socha, yahan uska naam/arguments milte hain
- `toolFunctions[toolName]()` — **dynamic function call**. `toolName` ek string variable hai (jaise `"getGitLog"`), aur `object[stringVariable]` se hum us naam ka real function nikaal ke turant `()` se run kar dete hain

**Simple JS concept jo yahan use hua:**
```javascript
const obj = { a: 1, b: 2 };
const key = "b";
console.log(obj[key]); // 2 — jo bhi variable ke andar value hai, wahi lookup hota hai
```

---

## 4. Multi-tool Chaining

**Yeh hai kya?**
LLM ke paas **ek se zyada tools** hote hain, aur wo context dekh ke sahi tool (ya tools) khud choose karta hai — hardcoded if/else nahi likhna padta.

**Example:**
```typescript
const toolFunctions = {
  getGitLog: getGitLog,
  getGitDiff: getGitDiff,
};

// Sawaal 1: "What were my last commits?" → LLM chooses getGitLog
// Sawaal 2: "What code changed?" → LLM chooses getGitDiff
```

**Kaunsi problem solve karta hai?**
Bina multi-tool chaining ke, humein khud logic likhna padta ki kaunsa function kab chalana hai. LLM yeh decision khud leta hai based on natural language understanding — jisse system flexible aur scalable banta hai.

---

## 5. Error Handling & Fallback Logic

**Yeh hai kya?**
Agar tool fail ho jaye (jaise git command error de, file na mile), LLM/program **crash nahi hona chahiye** — graceful fallback dena chahiye.

**Real code:**
```typescript
try {
  const toolResult = toolFunctions[toolName]();
  return `Tool "${toolName}" ka result:\n${toolResult}`;
} catch (error) {
  console.log(`Tool "${toolName}" failed:`, error.message);
  return `Sorry, I couldn't fetch that information right now (${toolName} failed).`;
}
```

**Samjho:** `try` ke andar jo code crash kare, uska control seedha `catch` mein chala jaata hai — poora program crash nahi hota, ek friendly message return hota hai.

**Production mein important kyun hai:**
Real systems mein tools fail ho sakte hain (network issue, invalid data, permissions). Agar error handling na ho, poora AI agent crash ho jayega ek chhoti si problem se.

**Safety pattern (important concept):**
Destructive actions (delete, cancel, payment) LLM ko **directly nahi karne dete** — pehle confirmation step rakhte hain. Jaise: `getOrderDetails()` se pehle info do, phir user confirm kare tabhi `cancelOrder()` chalao.

---

## Quick Self-Test
1. Agar tool description unclear ho, kya problem hoti hai?
2. `toolFunctions[toolName]()` mein `toolName` kya represent karta hai?
3. `try` block mein error aaye to control kahan jaata hai?

*(Answers: 1) LLM galat tool choose kar sakta hai. 2) Ek string jisme LLM ne jo tool choose kiya uska naam hai. 3) `catch` block mein.)*