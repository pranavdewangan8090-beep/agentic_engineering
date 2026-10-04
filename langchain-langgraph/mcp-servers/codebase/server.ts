import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(process.env.TARGET_REPO ?? "./target-repo");

function safePath(relativePath: string) {
  const resolved = path.resolve(ROOT, relativePath);
  if (!resolved.startsWith(ROOT + path.sep) && resolved !== ROOT) {
    throw new Error("Path escapes target repository");
  }
  return resolved;
}

const server = new McpServer({ name: "codebase-server", version: "1.0.0" });

server.registerTool("read_file", {
  description: "Read a file from the target repository.",
  inputSchema: z.object({ path: z.string() })
}, async ({ path: filePath }) => ({
  content: [{ type: "text", text: await fs.readFile(safePath(filePath), "utf8") }]
}));

server.registerTool("search_code", {
  description: "Search source files for a text string.",
  inputSchema: z.object({ query: z.string() })
}, async ({ query }) => {
  const results: string[] = [];
  async function walk(dir: string) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      if (entry.isDirectory()) await walk(full);
      else if (/\.(ts|js|json)$/.test(entry.name)) {
        const text = await fs.readFile(full, "utf8");
        if (text.includes(query)) results.push(path.relative(ROOT, full));
      }
    }
  }
  await walk(ROOT);
  return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
});

serveStdio(() => server);
