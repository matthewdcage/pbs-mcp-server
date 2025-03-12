# Pharmaceutical Benefits Scheme (PBS) MCP AI Enabled API Server ![MCP Server](https://badge.mcpx.dev?type=dev 'MCP Dev')

A standalone Model Context Protocol (MCP) server for accessing the Australian Pharmaceutical Benefits Scheme (PBS) API.

## About the Author

This PBS MCP server was developed by [Matthew Cage], Founder of https://ai-advantage.au, specialist in Automation, AI Engineering and AI integration and healthcare data systems.

Collaborate with me:
https://www.linkedin.com/in/digitalmarketingstrategyexpert/

## Overview

This project provides a standalone MCP server that allows AI models to access the Australian Pharmaceutical Benefits Scheme (PBS) API, which contains information about medicines, pricing, and availability in Australia.

The project is built for the Public API, but can easily be adapted to the private API if you have been granted developer access.

The PBS API provides programmatic access to PBS data, including medicine listings, pricing, and availability. This MCP server makes it easy to integrate PBS data into AI workflows.

The MCP is available via HTTP and CLI.

*Please be aware of the rate limits for the PBS and adjust your request frequency. I recommend a periodic call to store the information you require from the API and update it on a weekly basis.*

## MCP Server Features ![MCP Server](https://badge.mcpx.dev?type=server&features=tools)

This MCP server implements the following Model Context Protocol features:

- **Tools**: Provides tools for querying the PBS API endpoints, allowing AI models to access pharmaceutical data
- **Transport Layers**: Supports both stdio and HTTP/SSE transport layers
- **Error Handling**: Comprehensive error handling for API rate limits and authentication issues
- **LLM Integration**: Receives tool calls and prompts directly from LLM components, enabling seamless AI interaction with PBS data

### How It Works

The MCP Client ![MCP Client](https://badge.mcpx.dev?type=client&features=prompts,tools 'MCP Client'):

1. **Receives Tool Calls**: When an LLM (like Claude) needs pharmaceutical data, it sends a tool call to this server
2. **Processes Prompts**: Interprets natural language prompts about medication information
3. **Executes API Queries**: Translates the requests into appropriate PBS API calls
4. **Returns Structured Data**: Sends back formatted pharmaceutical data that the LLM can use in its responses

This enables AI assistants to access up-to-date PBS information without needing to have this data in their training.

## Installation

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd pbs-mcp-standalone
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

## Usage

### Starting the Server ![MCP Server](https://badge.mcpx.dev?type=server&features=tools)

The PBS MCP server can be run in different modes:

#### Stdio Mode (Default)

This mode is compatible with the MCP protocol and communicates via standard input/output streams:

```bash
npm start
```

Or use the provided start script:

```bash
./start.sh
```

#### HTTP Mode with SSE Support

This mode starts an HTTP server with Server-Sent Events (SSE) support:

```bash
npm run start:http
```

Or use the provided start script:

```bash
./start.sh http 3000
```

Where `3000` is the port number to listen on.

#### Command-Line Interface

The PBS MCP server can also be used as a command-line tool:

```bash
npm run cli -- <command>
```

Or use the provided start script:

```bash
./start.sh cli <command>
```

For example:

```bash
./start.sh cli info
```

### Using as a Command-Line Tool

To use this MCP server as a command-line tool:

1. Build the project:
   ```bash
   npm run build
   ```

2. Run the CLI with the desired command:
   ```bash
   npm run cli -- <command>
   ```
   
   Or use the start script:
   ```bash
   ./start.sh cli <command>
   ```

### Integrating with MCP Clients ![MCP Client](https://badge.mcpx.dev?type=client)

This server can be integrated with any MCP-compatible client, such as:

- Local AI Editors and AI/LLM Servers
- Other AI assistants that support the Model Context Protocol
- Custom applications using the MCP client libraries

#### Client Configuration Example

Here's an example of how to configure this server with an MCP client:

```json
{
  "mcpServers": {
    "pbs-api": {
      "command": "node",
      "args": ["path/to/pbs-mcp-standalone/build/index.js"],
      "env": {
        "PBS_API_SUBSCRIPTION_KEY": "your-subscription-key-here"
      }
    }
  }
}
```

#### Accessing the Server from a Client

To access this MCP server from a client:

1. **For Claude Desktop or other MCP-compatible AI assistants**:
   - Configure the assistant to use this server as an MCP tool provider
   - The assistant will automatically discover and use the tools provided by this server
   - The LLM can send natural language prompts about medications that will be processed by the server

2. **For custom applications**:
   - Use the HTTP API endpoints described below
   - Connect to the SSE endpoint for real-time tool events
   - Or spawn the server process and communicate via stdin/stdout

#### Example LLM Prompts

The server can interpret various prompts from LLMs, such as:

```
"Find information about metformin in the PBS"
"What is the PBS code for insulin?"
"List all prescribers who can prescribe antibiotics"
"Get the latest pricing for asthma medications"
```

These natural language prompts are translated into appropriate PBS API calls.

### API Tool Parameters

The PBS API tool can be used with the following parameters:

```json
{
  "endpoint": "prescribers",
  "method": "GET",
  "params": {
    "get_latest_schedule_only": "true",
    "limit": "20"
  }
}
```

#### Parameters

- `endpoint` (string, required): The specific PBS API endpoint to access (e.g., "prescribers", "item-overview")
- `method` (string, optional): HTTP method to use (GET is recommended for most PBS API operations). Default: "GET"
- `params` (object, optional): Query parameters to include in the request
- `subscriptionKey` (string, optional): Custom subscription key. If not provided, the default public key will be used
- `timeout` (number, optional): Request timeout in milliseconds. Default: 30000

## HTTP API ![MCP Server](https://badge.mcpx.dev?type=server&features=tools)

When running in HTTP mode, the following endpoints are available:

### Health Check

```
GET /health
```

Returns the status of the server.

### List Tools

```
GET /tools
```

Returns a list of available tools.

### SSE Endpoint

```
GET /sse
```

Establishes an SSE connection and sends tool events.

### Tool Invocation (SSE)

```
POST /sse/:toolName
```

Invokes a tool and sends the result via SSE.

### Tool Invocation (REST)

```
POST /api/:toolName
```

Invokes a tool and returns the result as JSON.

## Command-Line Interface ![MCP Dev](https://badge.mcpx.dev?type=dev)

The PBS MCP server can be used as a command-line tool with the following commands:

### List Endpoints

```bash
./start.sh cli list-endpoints
```

Lists all available PBS API endpoints.

### Get API Information

```bash
./start.sh cli info
```

Returns information about the PBS API.

### Query Prescribers

```bash
./start.sh cli prescribers [options]
```

Options:
- `-l, --limit <number>`: Number of results per page (default: 10)
- `-p, --page <number>`: Page number (default: 1)
- `-c, --pbs-code <code>`: Filter by PBS code
- `-s, --schedule-code <code>`: Filter by schedule code
- `-t, --prescriber-type <type>`: Filter by prescriber type
- `-f, --fields <fields>`: Specific fields to return
- `--latest`: Get only the latest schedule

### Query Item Overview

```bash
./start.sh cli item-overview [options]
```

Options:
- `-l, --limit <number>`: Number of results per page (default: 10)
- `-p, --page <number>`: Page number (default: 1)
- `-s, --schedule-code <code>`: Filter by schedule code
- `-f, --fields <fields>`: Specific fields to return
- `--latest`: Get only the latest schedule

### Query Any Endpoint

```bash
./start.sh cli query <endpoint> [options]
```

Options:
- `-m, --method <method>`: HTTP method (default: GET)
- `-p, --params <json>`: Query parameters as JSON string
- `-k, --subscription-key <key>`: Custom subscription key
- `-t, --timeout <milliseconds>`: Request timeout in milliseconds

### Start HTTP Server

```bash
./start.sh cli serve [options]
```

Options:
- `-p, --port <number>`: Port to listen on (default: 3000)

## Available Endpoints

The PBS API provides several endpoints for accessing different types of data:

- `/` - Root endpoint, provides API information and changelog
- `/prescribers` - Information about prescribers
- `/item-overview` - Detailed information about PBS items
- `/items` - Basic information about PBS items
- `/schedules` - Information about PBS schedules
- `/atc-codes` - Anatomical Therapeutic Chemical (ATC) classification codes
- `/organisations` - Information about organisations
- `/restrictions` - Information about restrictions
- `/parameters` - Information about parameters
- `/criteria` - Information about criteria
- `/copayments` - Information about copayments
- `/fees` - Information about fees
- `/markup-bands` - Information about markup bands
- `/programs` - Information about programs
- `/summary-of-changes` - Summary of changes

For a complete list of endpoints, see the [PBS API documentation](https://data-api-portal.health.gov.au/api-details#api=pbs-prod-api-public-v3-v3).

## Example Usage

### Get API Information

```json
{
  "endpoint": ""
}
```

### Get Prescribers

```json
{
  "endpoint": "prescribers",
  "params": {
    "get_latest_schedule_only": "true",
    "limit": "10"
  }
}
```

### Get Item Overview with Latest Schedule

```json
{
  "endpoint": "item-overview",
  "params": {
    "get_latest_schedule_only": "true",
    "limit": "5"
  }
}
```

### Get Prescribers with Specific PBS Code

```json
{
  "endpoint": "prescribers",
  "params": {
    "pbs_code": "10001J",
    "get_latest_schedule_only": "true"
  }
}
```

## Authentication

The tool uses a subscription key for accessing the PBS API. You can obtain your own key by registering on the PBS Developer Portal.

For development purposes, see the `.env.example` file for configuration details.

### Obtaining a PBS API Subscription Key

To obtain your own PBS API subscription key, follow these steps:

1. **Visit the PBS Data API Portal**: 
   - Go to [https://data-api-portal.health.gov.au/](https://data-api-portal.health.gov.au/)

2. **Create an Account**:
   - Click on "Sign Up" to create a new account
   - Fill in your details and verify your email address

3. **Subscribe to the PBS API**:
   - Once logged in, navigate to the "Products" section
   - Select the "PBS Public API v3" product
   - Click "Subscribe" to request access to the API

4. **Retrieve Your Subscription Key**:
   - After your subscription is approved, go to your profile
   - Navigate to "Subscriptions" or "API Keys" section
   - Copy your primary or secondary key

5. **Configure Your Environment**:
   - Create a `.env` file based on the `.env.example` template
   - Replace `your-subscription-key-here` with your actual subscription key:
     ```
     PBS_API_SUBSCRIPTION_KEY=your-actual-subscription-key
     ```

**Note**: The PBS Public API is rate-limited to one request per 20 seconds. This limit is shared among all users of the public API. For higher rate limits or access to embargo data (future schedules), you may need to apply for special access through the PBS Developer Program.

## Limitations

- The PBS Public API is rate-limited to one request per 20 seconds (shared among all users)
- Only the current schedule and those published in the past 12 months are available via the Public API
- Some endpoints require specific parameters to be provided
- The API structure and endpoints may change over time

## Additional Resources

- [PBS Website](https://www.pbs.gov.au/)
- [PBS Data Website](https://data.pbs.gov.au/)
- [PBS API Documentation](https://data-api-portal.health.gov.au/api-details#api=pbs-prod-api-public-v3-v3)
- [Model Context Protocol Documentation](https://github.com/modelcontextprotocol/mcp)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

![MCP Server](https://badge.mcpx.dev?type=server&features=tools) ![MCP Client](https://badge.mcpx.dev?type=client) ![MCP Dev](https://badge.mcpx.dev?type=dev) ![MCP Enabled](https://badge.mcpx.dev?status=on) ❤️ 
