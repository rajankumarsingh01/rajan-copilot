import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Normal text response ke liye
export async function askGroq(userMessage) {
  const response = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL,
    messages: [{ role: "user", content: userMessage }],
  });

  return response.choices[0].message.content;
}

// Guaranteed JSON response ke liye
export async function askGroqJSON(userMessage) {
  const response = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL,
    messages: [{ role: "user", content: userMessage }],
    response_format: { type: "json_object" },
  });

  const rawText = response.choices[0].message.content;
  return JSON.parse(rawText);
}

// Function calling / tool use ke liye
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
    const toolName = toolCall.function.name;
    console.log(`🔧 LLM chose to call: ${toolName}`);

    try {
      const toolResult = toolFunctions[toolName]();
      return `Tool "${toolName}" ka result:\n${toolResult}`;
    } catch (error) {
      console.log(`⚠️ Tool "${toolName}" failed:`, error.message);
      return `Sorry, I couldn't fetch that information right now (${toolName} failed).`;
    }
  }

  return message.content;
}