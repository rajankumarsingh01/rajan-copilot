import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getGitLog, getGitDiff } from "../tools/gitTools.js";

const server = new McpServer({
  name: "rajan-copilot",
  version: "1.0.0",
});

server.tool(
  "getGitLog",
  "Get recent commit messages/titles from this repository",
  {
    commitCount: z.number().default(5).describe("How many recent commits to fetch"),
  },
  async ({ commitCount }) => {
    const result = getGitLog(commitCount);
    return {
      content: [{ type: "text", text: result }],
    };
  }
);

server.tool(
  "getGitDiff",
  "Get the actual code changes from a recent commit",
  {
    commitsBack: z.number().default(1).describe("How many commits back to diff against"),
  },
  async ({ commitsBack }) => {
    const result = getGitDiff(commitsBack);
    return {
      content: [{ type: "text", text: result }],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);