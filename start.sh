#!/bin/bash

# PBS MCP Standalone Server Start Script

# Ensure the script exits on any error
set -e

# Default mode is stdio
MODE=${1:-stdio}
PORT=${2:-3000}

# Build the TypeScript code
echo "Building PBS MCP server..."
npm run build

# Start the server based on the mode
case "$MODE" in
  stdio)
    echo "Starting PBS MCP server in stdio mode..."
    node build/index.js
    ;;
  http)
    echo "Starting PBS MCP server in HTTP mode on port $PORT..."
    PORT=$PORT node build/http.js
    ;;
  cli)
    echo "Starting PBS MCP CLI..."
    shift # Remove the first argument (mode)
    node build/cli.js "$@"
    ;;
  *)
    echo "Unknown mode: $MODE"
    echo "Usage: $0 [stdio|http|cli] [port]"
    echo "  stdio: Start the server in stdio mode (default)"
    echo "  http: Start the server in HTTP mode with SSE support"
    echo "  cli: Start the command-line interface"
    exit 1
    ;;
esac

# Exit with the status of the last command
exit $? 