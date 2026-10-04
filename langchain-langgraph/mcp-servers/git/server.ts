import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";
import { execFile } from "node:child_process";
import path from "node:path";

const ROOT = path.resolve(process.env.TARGET_REPO ?? "./target-repo");
const server = new McpServer({ name: "git-server", version: "1.0.0" });

server.registerTool("git_diff", {
  description: "Show the current git diff of the target repository.",
  inputSchema: z.object({})
}, async () => {
  const result = await new Promise<string>((resolve) => {
    execFile("git", ["diff", "--", "."], { cwd: ROOT }, (_, stdout, stderr) => resolve(stdout || stderr));
  });
  return { content: [{ type: "text", text: result || "No diff." }] };
});

serveStdio(() => server);
