import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";
import { InvestigationState } from "./state.js";
import { makeNodes } from "./nodes.js";
import { createLangChainTools } from "../tools/mcp-tools.js";
import type { connectMcpServers } from "../mcp/client.js";

export function buildGraph(servers: Awaited<ReturnType<typeof connectMcpServers>>) {
  const tools = createLangChainTools(servers);
  const nodes = makeNodes(tools);

  const graph = new StateGraph(InvestigationState)
    .addNode("understand", nodes.understand)
    .addNode("code", nodes.codeInvestigation)
    .addNode("tests", nodes.testInvestigation)
    .addNode("history", nodes.historyInvestigation)
    .addNode("diagnose", nodes.diagnose)
    .addNode("review", nodes.review)
    .addNode("finalize", nodes.finalize)
    .addEdge(START, "understand")
    .addEdge("understand", "code")
    .addEdge("understand", "tests")
    .addEdge("understand", "history")
    .addEdge(["code", "tests", "history"], "diagnose")
    .addConditionalEdges("diagnose", (state) => {
      if (state.confidence < 0.8 && state.iterations < 3) return "code";
      return "review";
    })
    .addConditionalEdges("review", (state) => state.approved ? "finalize" : END)
    .addEdge("finalize", END);

  return graph.compile({ checkpointer: new MemorySaver() });
}
