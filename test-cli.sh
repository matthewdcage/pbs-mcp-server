#!/bin/bash

# PBS MCP CLI Test Script

# Ensure the script exits on any error
set -e

# Build the project
echo "Building PBS MCP project..."
npm run build

# Test the CLI commands
echo "Testing CLI commands..."

echo "1. Testing 'list-endpoints' command..."
node build/cli.js list-endpoints

echo "2. Testing 'info' command..."
node build/cli.js info

echo "3. Testing 'prescribers' command..."
node build/cli.js prescribers --latest --limit 3

echo "4. Testing 'item-overview' command..."
node build/cli.js item-overview --latest --limit 3

echo "5. Testing 'query' command..."
node build/cli.js query schedules --params '{"get_latest_schedule_only": "true", "limit": "3"}'

echo "All tests completed successfully!" 