import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

/**
 * Creates and configures a new MCP server
 * @param name Server name
 * @param version Server version
 * @param tools Array of tool definitions
 * @param toolHandlers Object mapping tool names to handler functions
 * @returns Configured MCP server
 */
export function createMCPServer(
  name: string,
  version: string,
  tools: any[],
  toolHandlers: Record<string, (args: any) => Promise<any>>
) {
  // Create server instance
  const server = new Server(
    {
      name,
      version,
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Set up tools list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools,
    };
  });

  // Set up tool call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { params } = request;
    const toolName = params.name;
    const toolArgs = params.arguments || {};
    
    if (!toolHandlers[toolName]) {
      throw new Error(`Unknown tool: ${toolName}`);
    }
    
    return await toolHandlers[toolName](toolArgs);
  });

  return server;
}

/**
 * Starts an MCP server with stdio transport
 * @param server The MCP server to start
 * @param cleanupFn Optional cleanup function to call on exit
 */
export async function startMCPServer(
  server: Server,
  cleanupFn?: () => Promise<void>
) {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`MCP Server running on stdio`);
  
  if (cleanupFn) {
    // Clean up resources on exit
    process.on('exit', async () => {
      await cleanupFn();
    });
    
    // Handle signals
    process.on('SIGINT', async () => {
      await cleanupFn();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      await cleanupFn();
      process.exit(0);
    });
  }
} 