# CodeInvestigator — LangChain + LangGraph + MCP

Educational codebase for learning an AI code-debugging agent by implementing the **same scenario in two architectures**.

## Scenario

The target repository contains a deliberately subtle `POST /orders` 500 bug. The agent must:

1. inspect the request path;
2. trace dependencies;
3. inspect implementation details;
4. run focused tests;
5. investigate related code/history;
6. identify a root cause and confidence;
7. prepare a patch;
8. stop for human approval before modifying code;
9. run tests after approval;
10. retry/diagnose if the patch does not fix the tests.

The two projects expose the same codebase tools through MCP servers.

## Architecture

### This project

```text
User
  ↓
LLM
  ↓ tool call
MCP client
  ↓ JSON-RPC / stdio
MCP server
  ↓
filesystem / search / tests / git
```

The model/tool abstraction is provided by LangChain and the workflow is explicitly represented as a LangGraph state machine.

## Setup

Requirements: Node.js 20+, npm, and an OpenAI-compatible API key.

```bash
npm install
cp .env.example .env
# fill OPENAI_API_KEY
npm run demo
```

The MCP servers are spawned locally by the application using stdio. MCP's current TypeScript SDK supports stdio as a local process transport and exposes tool discovery/calls through its client API. See the official docs: https://ts.sdk.modelcontextprotocol.io/v2/

## Important

This is a learning project. The `apply_patch` tool is intentionally conservative and only supports the demo patch. Do not point it at a real repository until you understand the safety boundaries.

## Learning path

Read the files in this order:

1. `target-repo/` — understand the bug.
2. `src/mcp/client.ts` — see MCP as a tool transport.
3. `src/tools/` — see the tool surface.
4. `src/agent/` — see the agent architecture.
5. `src/index.ts` — see the runtime.
6. Then compare against the other project.
