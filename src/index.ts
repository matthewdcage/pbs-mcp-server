#!/usr/bin/env node

/**
 * PBS MCP Standalone Server
 * 
 * This is the main entry point for the PBS MCP standalone server.
 * It provides access to the Australian Pharmaceutical Benefits Scheme (PBS) API
 * through the Model Context Protocol (MCP).
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { pbsApiTools, pbsApiToolHandlers } from "./pbsApiServer.js";
import { createMCPServer, startMCPServer } from "./utils/serverUtils.js";

async function main() {
  try {
    console.error("[PBS MCP] Starting PBS MCP server...");
    
    // Create the PBS MCP server
    const server = createMCPServer(
      "pbs-mcp-standalone",
      "1.0.0",
      pbsApiTools,
      pbsApiToolHandlers
    );
    
    // Start the server
    await startMCPServer(server);
    console.error("[PBS MCP] PBS MCP server started successfully");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[PBS MCP] Error starting server: ${errorMessage}`);
    process.exit(1);
  }
}

// Run the main function
main().catch((error) => {
  console.error(`[PBS MCP] Unhandled error: ${error}`);
  process.exit(1);
});
