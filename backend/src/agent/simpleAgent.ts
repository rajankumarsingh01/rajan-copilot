import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function runAgent(userTask, tools, toolFunctions, maxSteps = 5) {
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
    messages.push(message);

    if (!message.tool_calls) {
      console.log("✅ Agent finished!");
      return message.content;
    }

    const toolCall = message.tool_calls[0];
    const toolName = toolCall.function.name;
    const toolArgs = JSON.parse(toolCall.function.arguments || "{}");
    console.log(`🔧 Calling tool: ${toolName} with args:`, toolArgs);

    let toolResult;
    try {
      toolResult = toolFunctions[toolName](...Object.values(toolArgs));
    } catch (error) {
      toolResult = `Error: ${error.message}`;
    }

    messages.push({
      role: "tool",
      tool_call_id: toolCall.id,
      content: String(toolResult),
    });
  }

  return "⚠️ Max steps reached, agent could not finish the task.";
}