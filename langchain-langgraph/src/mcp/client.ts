import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import path from "node:path";

export async function connectMcpServers() {
  const definitions = [
    ["codebase-server", "./mcp-servers/codebase/server.ts"],
    ["testing-server", "./mcp-servers/testing/server.ts"],
    ["git-server", "./mcp-servers/git/server.ts"]
  ] as const;

  return Promise.all(definitions.map(async ([name, script]) => {
    const client = new Client({ name: "codeinvestigator-langgraph", version: "1.0.0" });
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: ["--import", "tsx", path.resolve(script)],
      env: { ...process.env, TARGET_REPO: path.resolve("./target-repo") }
    });
    await client.connect(transport);
    const { tools } = await client.listTools();
    return { name, client, tools };
  }));
}
