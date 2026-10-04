import "dotenv/config";
import { connectMcpServer } from "./mcp/client.js";
import { runToolCallingAgent } from "./agent/tool-loop.js";

const servers = await Promise.all([
  connectMcpServer("codebase-server", "./mcp-servers/codebase/server.ts"),
  connectMcpServer("testing-server", "./mcp-servers/testing/server.ts"),
  connectMcpServer("git-server", "./mcp-servers/git/server.ts")
]);

console.log("Connected MCP tools:");
for (const server of servers) console.log(server.name, server.tools.map(t => t.name));

const request = process.argv.slice(2).join(" ") ||
  "POST /orders returns 500 intermittently. Investigate the codebase, run relevant tests, identify the root cause, and prepare a patch proposal. Do not modify the repository.";

console.log("\nUSER:", request);
const answer = await runToolCallingAgent(request, servers);
console.log("\nFINAL ANSWER:\n", answer);
