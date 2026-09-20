import "dotenv/config";
import { runAgent } from "./agent/simpleAgent.js";
import { getGitLog, getGitDiff } from "./tools/gitTools.js";

const tools = [
  {
    type: "function",
    function: {
      name: "getGitLog",
      description: "Get recent commit messages/titles (no code).",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "getGitDiff",
      description: "Get the actual code that changed in the most recent commit.",
      parameters: { type: "object", properties: {} },
    },
  },
];

const toolFunctions = {
  getGitLog: getGitLog,
  getGitDiff: getGitDiff,
};

const result = await runAgent(
  "Look at my recent commits, then check what code changed most recently. Summarize what I've been working on.",
  tools,
  toolFunctions
);

console.log("\n📝 Final Answer:", result);