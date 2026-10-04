import OpenAI from "openai";
import type { ConnectedMcpServer } from "../mcp/client.js";
import { SYSTEM_PROMPT } from "./prompts.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function toOpenAITools(servers: ConnectedMcpServer[]) {
  return servers.flatMap(server => server.tools.map(tool => ({
    type: "function" as const,
    function: {
      name: `${server.name}__${tool.name}`,
      description: tool.description ?? "",
      parameters: tool.inputSchema ?? { type: "object", properties: {} }
    }
  })));
}

export async function executeTool(call: any, servers: ConnectedMcpServer[]) {
  const [serverName, ...nameParts] = call.function.name.split("__");
  const toolName = nameParts.join("__");
  const server = servers.find(s => s.name === serverName);
  if (!server) throw new Error(`Unknown MCP server: ${serverName}`);
  const args = JSON.parse(call.function.arguments || "{}");
  const result = await server.client.callTool({ name: toolName, arguments: args });
  return JSON.stringify(result);
}

export async function runToolCallingAgent(userRequest: string, servers: ConnectedMcpServer[]) {
  const messages: any[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userRequest }
  ];
  const tools = toOpenAITools(servers);

  for (let step = 1; step <= 30; step++) {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-5.1",
      messages,
      tools,
      tool_choice: "auto"
    });
    const message = response.choices[0].message;
    messages.push(message);

    if (!message.tool_calls?.length) return message.content ?? "No final response.";

    for (const call of message.tool_calls) {
      if (call.type !== "function") continue;
      console.log(`\n[tool] ${call.function.name} ${call.function.arguments}`);
      const result = await executeTool(call, servers);
      messages.push({ role: "tool", tool_call_id: call.id, content: result });
    }
  }
  throw new Error("Agent exceeded 30 steps");
}
