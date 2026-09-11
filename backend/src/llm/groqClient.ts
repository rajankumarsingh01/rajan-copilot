import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function askGroq(userMessage) {
  const response = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL,
    messages: [
      { role: "user", content: userMessage },
    ],
  });

  return response.choices[0].message.content;
}