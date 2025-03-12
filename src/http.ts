#!/usr/bin/env node

/**
 * PBS MCP HTTP Server with SSE Support
 * 
 * This file implements an HTTP server with Server-Sent Events (SSE) support
 * for the PBS MCP server, allowing clients to connect via HTTP and receive
 * tool responses via SSE.
 */

import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { pbsApiTools, pbsApiToolHandlers } from './pbsApiServer.js';
import { z } from 'zod';
import { PbsApiToolSchema } from './tools/pbsApi.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables
config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Serve static files
app.use(express.static(rootDir));

// Serve the client HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'client.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'PBS MCP server is running' });
});

// List available tools endpoint
app.get('/tools', (req, res) => {
  res.json({ tools: pbsApiTools });
});

// SSE endpoint for tool invocation
app.get('/sse', (req, res) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Send a comment to keep the connection alive
  res.write(':\n\n');
  
  // Send the list of available tools
  const toolsEvent = {
    event: 'tools',
    data: JSON.stringify({ tools: pbsApiTools })
  };
  
  res.write(`event: ${toolsEvent.event}\n`);
  res.write(`data: ${toolsEvent.data}\n\n`);
  
  // Handle client disconnect
  req.on('close', () => {
    console.error('SSE client disconnected');
  });
});

// SSE endpoint for specific tool invocation
app.post('/sse/:toolName', async (req, res) => {
  const { toolName } = req.params;
  const toolArgs = req.body;
  
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Send a comment to keep the connection alive
  res.write(':\n\n');
  
  try {
    // Check if the tool exists
    if (toolName !== 'pbs_api' || !pbsApiToolHandlers[toolName]) {
      const errorEvent = {
        event: 'error',
        data: JSON.stringify({ error: `Unknown tool: ${toolName}` })
      };
      
      res.write(`event: ${errorEvent.event}\n`);
      res.write(`data: ${errorEvent.data}\n\n`);
      res.end();
      return;
    }
    
    // Send start event
    const startEvent = {
      event: 'start',
      data: JSON.stringify({ toolName, args: toolArgs })
    };
    
    res.write(`event: ${startEvent.event}\n`);
    res.write(`data: ${startEvent.data}\n\n`);
    
    // Invoke the tool
    console.error(`[PBS MCP HTTP] Invoking tool: ${toolName}`);
    console.error(`[PBS MCP HTTP] Arguments: ${JSON.stringify(toolArgs)}`);
    
    const result = await pbsApiToolHandlers[toolName](toolArgs);
    
    // Send result event
    const resultEvent = {
      event: 'result',
      data: JSON.stringify(result)
    };
    
    res.write(`event: ${resultEvent.event}\n`);
    res.write(`data: ${resultEvent.data}\n\n`);
    
    // Send end event
    const endEvent = {
      event: 'end',
      data: JSON.stringify({ toolName, status: 'success' })
    };
    
    res.write(`event: ${endEvent.event}\n`);
    res.write(`data: ${endEvent.data}\n\n`);
  } catch (error) {
    // Send error event
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorEvent = {
      event: 'error',
      data: JSON.stringify({ error: errorMessage })
    };
    
    res.write(`event: ${errorEvent.event}\n`);
    res.write(`data: ${errorEvent.data}\n\n`);
    
    console.error(`[PBS MCP HTTP] Error invoking tool: ${errorMessage}`);
  } finally {
    // End the response
    res.end();
  }
});

// REST API endpoint for tool invocation
app.post('/api/:toolName', async (req, res) => {
  const { toolName } = req.params;
  const toolArgs = req.body;
  
  try {
    // Check if the tool exists
    if (toolName !== 'pbs_api' || !pbsApiToolHandlers[toolName]) {
      res.status(404).json({ error: `Unknown tool: ${toolName}` });
      return;
    }
    
    // Invoke the tool
    console.error(`[PBS MCP HTTP] Invoking tool: ${toolName}`);
    console.error(`[PBS MCP HTTP] Arguments: ${JSON.stringify(toolArgs)}`);
    
    const result = await pbsApiToolHandlers[toolName](toolArgs);
    
    // Send the result
    res.json(result);
  } catch (error) {
    // Send error response
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: errorMessage });
    
    console.error(`[PBS MCP HTTP] Error invoking tool: ${errorMessage}`);
  }
});

// Start the server
app.listen(PORT, () => {
  console.error(`[PBS MCP HTTP] Server running on http://localhost:${PORT}`);
  console.error(`[PBS MCP HTTP] Available endpoints:`);
  console.error(`[PBS MCP HTTP]   - GET /: Web client for testing`);
  console.error(`[PBS MCP HTTP]   - GET /health: Health check endpoint`);
  console.error(`[PBS MCP HTTP]   - GET /tools: List available tools`);
  console.error(`[PBS MCP HTTP]   - GET /sse: SSE endpoint for tool events`);
  console.error(`[PBS MCP HTTP]   - POST /sse/:toolName: SSE endpoint for specific tool invocation`);
  console.error(`[PBS MCP HTTP]   - POST /api/:toolName: REST API endpoint for tool invocation`);
}); 