import "dotenv/config";
import { runAgent } from "./agent/simpleAgent.js";
import { getGitLog, getGitDiff } from "./tools/gitTools.js";

const tools = [
  {
    type: "function",
    function: {
      name: "getGitLog",
      description: "Get recent commit messages/titles (no code). Specify how many commits to show.",
      parameters: {
        type: "object",
        properties: {
          commitCount: {
            type: "number",
            description: "How many recent commits to fetch (default 5)",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getGitDiff",
      description: "Get the actual code changes. Specify how many commits back to compare.",
      parameters: {
        type: "object",
        properties: {
          commitsBack: {
            type: "number",
            description: "How many commits back to diff against HEAD (default 1)",
          },
        },
      },
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