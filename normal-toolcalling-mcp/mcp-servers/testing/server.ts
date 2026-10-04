import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";
import { execFile } from "node:child_process";
import path from "node:path";

const ROOT = path.resolve(process.env.TARGET_REPO ?? "./target-repo");
const server = new McpServer({ name: "testing-server", version: "1.0.0" });

server.registerTool("run_tests", {
  description: "Run the target repository's tests and return stdout/stderr/exit code.",
  inputSchema: z.object({ testFile: z.string().optional() })
}, async ({ testFile }) => {
  const args = ["--test"];
  if (testFile) args.push(testFile);
  const result = await new Promise<{ code: number | string; stdout: string; stderr: string }>((resolve) => {
    execFile("node", args, { cwd: ROOT }, (error, stdout, stderr) => {
      resolve({ code: error ? (error.code ?? 1) : 0, stdout, stderr });
    });
  });
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});

serveStdio(() => server);
