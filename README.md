# PBS MCP Standalone Server

A standalone Model Context Protocol (MCP) server for accessing the Australian Pharmaceutical Benefits Scheme (PBS) API.

## About the Author

This PBS MCP server was developed by [Matthew Cage] Founder of https://ai-advantage.au specialist in Automation, AI Engineering and AI integration and healthcare data systems.

Collaborate with me:
https://www.linkedin.com/in/digitalmarketingstrategyexpert/

## Overview

This project provides a standalone MCP server that allows AI models to access the Australian Pharmecutical benefits Scheme Database (PBS) API, which contains information about medicines, pricing, and availability in Australia.

The project is build for the Public API, but can easily be adapted to the private API if you have been granted developer access.

The PBS API provides programmatic access to PBS data, including medicine listings, pricing, and availability. This MCP server makes it easy to integrate PBS data into AI workflows.

The MCP is available via HTTP and CLI.

*Please be aware of the rate limits for the PBS and adjust your request frequency.  I recommend a periodic call and store the information you require from the API and update it on a weekly database.*

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

### Starting the Server

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

## HTTP API

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

## Command-Line Interface

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

The tool uses the following subscription key for unregistered public users:
```
See the .env.example
```

## Limitations

- The PBS API has a rate limit of 5 requests per time window
- Some endpoints require specific parameters to be provided
- The API may require authentication for certain operations
- The API structure and endpoints may change over time

## Additional Resources

- [PBS Website](https://www.pbs.gov.au/)
- [PBS Data Website](https://data.pbs.gov.au/)
- [PBS API Documentation](https://data-api-portal.health.gov.au/api-details#api=pbs-prod-api-public-v3-v3)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
