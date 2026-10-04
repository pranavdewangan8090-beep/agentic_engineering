import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import path from "node:path";

export type ConnectedMcpServer = { name: string; client: Client; tools: any[] };

export async function connectMcpServer(name: string, script: string): Promise<ConnectedMcpServer> {
  const client = new Client({ name: "codeinvestigator", version: "1.0.0" });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["--import", "tsx", path.resolve(script)],
    env: { ...process.env, TARGET_REPO: path.resolve("./target-repo") }
  });
  await client.connect(transport);
  const { tools } = await client.listTools();
  return { name, client, tools };
}
