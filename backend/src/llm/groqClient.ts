import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Normal text response ke liye
export async function askGroq(userMessage) {
  const response = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL,
    messages: [
      { role: "user", content: userMessage },
    ],
  });

  return response.choices[0].message.content;
}

// Guaranteed JSON response ke liye
export async function askGroqJSON(userMessage) {
  const response = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL,
    messages: [
      { role: "user", content: userMessage },
    ],
    response_format: { type: "json_object" },
  });

  const rawText = response.choices[0].message.content;
  return JSON.parse(rawText);
}