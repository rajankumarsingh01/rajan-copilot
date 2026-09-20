import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function runAgent(userTask, tools, toolFunctions, maxSteps = 5) {
  // Conversation history — LLM ko poori history yaad rakhni padti hai
  const messages = [{ role: "user", content: userTask }];

  for (let step = 1; step <= maxSteps; step++) {
    console.log(`\n🔄 Step ${step}...`);

    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL,
      messages: messages,
      tools: tools,
      tool_choice: "auto",
    });

    const message = response.choices[0].message;
    messages.push(message); // LLM ka response history mein add karo

    // Agar LLM ne koi tool call nahi kiya — matlab uska final answer aa gaya
    if (!message.tool_calls) {
      console.log("✅ Agent finished!");
      return message.content;
    }

    // Agar tool call hua — usse chalao
    const toolCall = message.tool_calls[0];
    const toolName = toolCall.function.name;
    console.log(`🔧 Calling tool: ${toolName}`);

    let toolResult;
    try {
      toolResult = toolFunctions[toolName]();
    } catch (error) {
      toolResult = `Error: ${error.message}`;
    }

    // Tool ka result history mein add karo, taaki LLM agle step mein dekh sake
    messages.push({
      role: "tool",
      tool_call_id: toolCall.id,
      content: String(toolResult),
    });
  }

  return "⚠️ Max steps reached, agent could not finish the task.";
}