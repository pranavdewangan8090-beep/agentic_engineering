import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { connectMcpServers } from "../mcp/client.js";

type Servers = Awaited<ReturnType<typeof connectMcpServers>>;

export function createLangChainTools(servers: Servers) {
  const find = (serverName: string, toolName: string) => {
    const server = servers.find(s => s.name === serverName);
    if (!server) throw new Error(`Missing MCP server ${serverName}`);
    return server.client;
  };

  return [
    tool(async ({ path }) => JSON.stringify(await find("codebase-server", "read_file").callTool({ name: "read_file", arguments: { path } })), {
      name: "read_file",
      description: "Read a source file from the target repository.",
      schema: z.object({ path: z.string() })
    }),
    tool(async ({ query }) => JSON.stringify(await find("codebase-server", "search_code").callTool({ name: "search_code", arguments: { query } })), {
      name: "search_code",
      description: "Search source files for a text string.",
      schema: z.object({ query: z.string() })
    }),
    tool(async ({ testFile }) => JSON.stringify(await find("testing-server", "run_tests").callTool({ name: "run_tests", arguments: { testFile } })), {
      name: "run_tests",
      description: "Run tests and return the result.",
      schema: z.object({ testFile: z.string().optional() })
    }),
    tool(async () => JSON.stringify(await find("git-server", "git_diff").callTool({ name: "git_diff", arguments: {} })), {
      name: "git_diff",
      description: "Read the current git diff.",
      schema: z.object({})
    })
  ];
}
