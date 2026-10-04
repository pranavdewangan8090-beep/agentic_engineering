import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { InvestigationStateType } from "./state.js";
import type { createLangChainTools } from "../tools/mcp-tools.js";

type Tools = ReturnType<typeof createLangChainTools>;
const model = new ChatOpenAI({ model: process.env.OPENAI_MODEL ?? "gpt-5.1", temperature: 0 });

export function makeNodes(tools: Tools) {
  const readFile = tools.find(t => t.name === "read_file")!;
  const searchCode = tools.find(t => t.name === "search_code")!;
  const runTests = tools.find(t => t.name === "run_tests")!;
  const gitDiff = tools.find(t => t.name === "git_diff")!;

  return {
    async understand(state: InvestigationStateType) {
      const response = await model.invoke([
        new SystemMessage("Turn the user's debugging request into a concrete investigation plan. Do not guess the root cause."),
        new HumanMessage(state.userRequest)
      ]);
      return { findings: [`PLAN: ${response.content}`] };
    },

    async codeInvestigation() {
      const routes = await searchCode.invoke({ query: "postOrders" });
      const service = await searchCode.invoke({ query: "processOrder" });
      const total = await searchCode.invoke({ query: "calculateTotal" });
      return { findings: ["CODE SEARCH", String(routes), String(service), String(total)] };
    },

    async testInvestigation() {
      const result = await runTests.invoke({ testFile: "tests/orders.test.js" });
      return { testResults: [String(result)] };
    },

    async historyInvestigation() {
      const diff = await gitDiff.invoke({});
      return { findings: [`GIT DIFF: ${String(diff)}`] };
    },

    async diagnose(state: InvestigationStateType) {
      const response = await model.invoke([
        new SystemMessage(`You are the diagnosis node. Based only on the evidence below, return JSON with rootCause, confidence (0-1), and patch. If evidence is insufficient, say so.\nEVIDENCE:\n${state.findings.join("\n")}\nTESTS:\n${state.testResults.join("\n")}`),
        new HumanMessage("Diagnose the bug.")
      ]);
      const raw = String(response.content);
      let parsed: any = { rootCause: raw, confidence: 0.5, patch: "No patch generated." };
      try {
        const clean = raw.replace(/^```json\s*|\s*```$/g, "");
        parsed = JSON.parse(clean);
      } catch {}
      return { rootCause: parsed.rootCause, confidence: Number(parsed.confidence ?? 0.5), proposedPatch: parsed.patch, iterations: state.iterations + 1 };
    },

    async review(state: InvestigationStateType) {
      // In a real UI this node would call interrupt() and resume after approval.
      // For this learning version we model approval as an explicit state gate.
      console.log("\n=== HUMAN REVIEW ===\n", state.proposedPatch);
      console.log("Set APPROVE_PATCH=true to allow the patch stage.");
      return { approved: process.env.APPROVE_PATCH === "true" };
    },

    async finalize(state: InvestigationStateType) {
      const file = await readFile.invoke({ path: "src/utils/calculateTotal.ts" });
      return { findings: [`FINAL FILE CHECK:\n${String(file)}`] };
    }
  };
}
