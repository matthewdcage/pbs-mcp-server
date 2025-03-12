import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import {
  pbsApiToolName,
  pbsApiToolDescription,
  PbsApiToolSchema,
  runPbsApiTool
} from "./tools/pbsApi.js";
import { z } from "zod";
import { startMCPServer } from "./utils/serverUtils.js";

// Define the PBS API tools
export const pbsApiTools = [
  {
    name: pbsApiToolName,
    description: pbsApiToolDescription,
    inputSchema: {
      type: "object",
      properties: {
        endpoint: {
          type: "string",
          description: 'The specific PBS API endpoint to access (e.g., "prescribers", "item-overview")'
        },
        method: {
          type: "string",
          enum: ["GET", "POST"],
          default: "GET",
          description: 'HTTP method to use (GET is recommended for most PBS API operations)'
        },
        params: {
          type: "object",
          additionalProperties: {
            type: "string"
          },
          description: 'Query parameters to include in the request (e.g., {"get_latest_schedule_only": "true"})'
        },
        subscriptionKey: {
          type: "string",
          description: 'Custom subscription key (if not provided, the default public key will be used)'
        },
        timeout: {
          type: "number",
          default: 30000,
          description: 'Request timeout in milliseconds'
        }
      },
      required: ["endpoint"]
    }
  }
];

// Define the PBS API tool handlers
export const pbsApiToolHandlers = {
  [pbsApiToolName]: async (params: unknown) => {
    // Type cast params to the expected type
    const typedParams = params as z.infer<typeof PbsApiToolSchema>;
    return await runPbsApiTool(typedParams);
  }
};

// Create and start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    // Create a more sophisticated server with direct SDK usage for better control
    const server = new Server(
      {
        name: "pbs-api-tools",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Set up tools list handler
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      console.error(`[PBS API Server DEBUG] Returning tools: ${JSON.stringify(pbsApiTools)}`);
      return {
        tools: pbsApiTools,
      };
    });

    // Set up tool call handler with enhanced error handling
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { params } = request;
        const toolName = params.name;
        const toolArgs = params.arguments || {};
        
        if (toolName !== pbsApiToolName) {
          throw new Error(`Unknown tool: ${toolName}`);
        }
        
        console.error(`[PBS API Server] Calling tool: ${toolName}`);
        console.error(`[PBS API Server] Arguments: ${JSON.stringify(toolArgs)}`);
        
        const result = await pbsApiToolHandlers[toolName](toolArgs);
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[PBS API Server] Error calling tool: ${errorMessage}`);
        throw error;
      }
    });

    // Start the server
    startMCPServer(server);
    console.error("[PBS API Server] Server started successfully");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[PBS API Server] Error starting server: ${errorMessage}`);
    process.exit(1);
  }
} 