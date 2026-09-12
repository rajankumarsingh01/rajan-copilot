import "dotenv/config";
import { askGroqWithTools } from "./llm/groqClient.js";
import { getGitDiff, getGitLog } from "./tools/gitTools.js";

const tools = [
  {
    type: "function",
    function: {
      name: "getGitLog",
      description: "Use this to list commit MESSAGES and commit history (titles only, no code). Good for questions like 'what were my recent commits' or 'show commit history'.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "getGitDiff",
      description: "Use this to see the ACTUAL CODE that changed (line-by-line additions/deletions) in the most recent commit. Good for questions like 'what code changed' or 'show me the diff'.",
      parameters: { type: "object", properties: {} },
    },
  },
];

const toolFunctions = {
  getGitLog: getGitLog,
  getGitDiff: getGitDiff,
};

// Test 1: commit history wala sawaal
const result1 = await askGroqWithTools(
  "What were my last few commits?",
  tools,
  toolFunctions
);
console.log("🔹 Result 1:", result1);

// Test 2: code changes wala sawaal
const result2 = await askGroqWithTools(
  "What code changed in my most recent commit?",
  tools,
  toolFunctions
);
console.log("🔹 Result 2:", result2);