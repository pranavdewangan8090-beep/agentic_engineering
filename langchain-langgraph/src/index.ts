import "dotenv/config";
import { connectMcpServers } from "./mcp/client.js";
import { buildGraph } from "./graph/graph.js";

const servers = await connectMcpServers();
console.log("Connected MCP servers:", servers.map(s => s.name));

const graph = buildGraph(servers);
const request = process.argv.slice(2).join(" ") ||
  "POST /orders returns 500 intermittently. Investigate the codebase, run relevant tests, identify the root cause, and prepare a patch proposal. Do not modify the repository.";

const result = await graph.invoke({
  userRequest: request,
  findings: [],
  testResults: [],
  rootCause: "",
  confidence: 0,
  proposedPatch: "",
  approved: false,
  iterations: 0
}, { configurable: { thread_id: "demo-investigation" } });

console.log("\nFINAL STATE:\n", JSON.stringify(result, null, 2));
