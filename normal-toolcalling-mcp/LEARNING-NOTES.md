# Learning notes

This project intentionally avoids LangChain and LangGraph.

The important loop is:

```text
LLM
 ↓
model decides whether a tool is needed
 ↓
application executes the tool through MCP
 ↓
tool result is appended to messages
 ↓
LLM again
```

This is a perfectly valid agent architecture.

The complexity appears when you add explicit workflow requirements such as parallel branches, deterministic gates, retries, durable checkpoints and human approval. Those can still be implemented here, but you will increasingly write your own state machine/orchestration code. That is exactly the comparison to make against the LangGraph version.

Try implementing the following here manually before reading the LangGraph project:

- run code/tests/history investigations concurrently;
- maintain a typed investigation state;
- branch on confidence;
- retry test execution;
- pause for approval;
- resume after approval;
- persist state to a JSON/SQLite store.
