# Learning notes

## The same tools exist in both projects

MCP provides the transport/protocol. The application discovers and calls MCP tools.

## Normal project

The core orchestration is `src/agent/tool-loop.ts`:

```text
LLM -> tool call -> MCP -> tool result -> LLM -> ...
```

The LLM controls almost all sequencing.

## LangChain project

LangChain gives you model/message/tool abstractions. MCP tools are adapted into LangChain tools.

## LangGraph project

The graph owns the workflow:

```text
             understand
             /    |    \
           code  tests  history
             \    |    /
               diagnose
                  |
          confidence check
             /         \
      investigate      review
                          |
                    approval gate
                          |
                       finalize
```

The important idea is not that LangGraph can do something that JavaScript cannot. You could hand-code the same behavior. The value is making the workflow, state transitions, retries, branching, persistence and human-in-the-loop semantics explicit and reusable.

## Next exercises

1. Replace the fake review gate with LangGraph `interrupt()`.
2. Add a real `apply_patch` MCP tool that requires an approval token.
3. Add a `find_dependencies` tool using a TypeScript AST parser.
4. Add a separate `architecture-server` MCP server.
5. Make code/tests/history branches run in parallel and merge structured findings.
6. Add a retry policy for transient test failures.
7. Add a checkpointer backed by SQLite/Postgres.
8. Add LangSmith tracing and compare traces between runs.
