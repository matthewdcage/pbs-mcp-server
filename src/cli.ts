#!/usr/bin/env node

/**
 * PBS MCP Command-Line Interface
 * 
 * This file implements a command-line interface for the PBS MCP server,
 * allowing users to invoke PBS API tools directly from the command line.
 */

import { Command } from 'commander';
import { config } from 'dotenv';
import { runPbsApiTool, PbsApiToolSchema } from './tools/pbsApi.js';
import { z } from 'zod';

// Load environment variables
config();

// Create command-line program
const program = new Command();

// Set program metadata
program
  .name('pbs-mcp')
  .description('PBS MCP Command-Line Interface')
  .version('1.0.0');

// Add command for listing available endpoints
program
  .command('list-endpoints')
  .description('List all available PBS API endpoints')
  .action(async () => {
    try {
      // Call the PBS API with an empty endpoint to get API information
      const result = await runPbsApiTool({
        endpoint: '',
        method: 'GET',
        timeout: 30000
      });
      
      console.log('Available PBS API Endpoints:');
      console.log('');
      console.log('/');
      console.log('/amt-items');
      console.log('/atc-codes');
      console.log('/container-organisation-relationships');
      console.log('/containers');
      console.log('/copayments');
      console.log('/criteria');
      console.log('/criteria-parameter-relationships');
      console.log('/dispensing-rules');
      console.log('/extemporaneous-ingredients');
      console.log('/extemporaneous-preparations');
      console.log('/extemporaneous-prep-sfp-relationships');
      console.log('/extemporaneous-tariffs');
      console.log('/fees');
      console.log('/indications');
      console.log('/item-atc-relationships');
      console.log('/item-dispensing-rule-relationships');
      console.log('/item-organisation-relationships');
      console.log('/item-overview');
      console.log('/item-prescribing-text-relationships');
      console.log('/item-pricing-events');
      console.log('/item-restriction-relationships');
      console.log('/items');
      console.log('/markup-bands');
      console.log('/organisations');
      console.log('/parameters');
      console.log('/prescribers');
      console.log('/prescribing-texts');
      console.log('/program-dispensing-rules');
      console.log('/programs');
      console.log('/restriction-prescribing-text-relationships');
      console.log('/restrictions');
      console.log('/schedules');
      console.log('/standard-formula-preparations');
      console.log('/summary-of-changes');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error: ${errorMessage}`);
      process.exit(1);
    }
  });

// Add command for getting API information
program
  .command('info')
  .description('Get PBS API information')
  .action(async () => {
    try {
      // Call the PBS API with an empty endpoint to get API information
      const result = await runPbsApiTool({
        endpoint: '',
        method: 'GET',
        timeout: 30000
      });
      
      // Print the result
      console.log(result.content[0].text);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error: ${errorMessage}`);
      process.exit(1);
    }
  });

// Add command for querying prescribers
program
  .command('prescribers')
  .description('Query PBS prescribers')
  .option('-l, --limit <number>', 'Number of results per page', '10')
  .option('-p, --page <number>', 'Page number', '1')
  .option('-c, --pbs-code <code>', 'Filter by PBS code')
  .option('-s, --schedule-code <code>', 'Filter by schedule code')
  .option('-t, --prescriber-type <type>', 'Filter by prescriber type')
  .option('-f, --fields <fields>', 'Specific fields to return')
  .option('--latest', 'Get only the latest schedule', false)
  .action(async (options: any) => {
    try {
      // Prepare query parameters
      const params: Record<string, string> = {};
      
      if (options.limit) params.limit = options.limit;
      if (options.page) params.page = options.page;
      if (options.pbsCode) params.pbs_code = options.pbsCode;
      if (options.scheduleCode) params.schedule_code = options.scheduleCode;
      if (options.prescriberType) params.prescriber_type = options.prescriberType;
      if (options.fields) params.fields = options.fields;
      if (options.latest) params.get_latest_schedule_only = 'true';
      
      // Call the PBS API
      const result = await runPbsApiTool({
        endpoint: 'prescribers',
        method: 'GET',
        params,
        timeout: 30000
      });
      
      // Print the result
      console.log(result.content[0].text);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error: ${errorMessage}`);
      process.exit(1);
    }
  });

// Add command for querying item overview
program
  .command('item-overview')
  .description('Query PBS item overview')
  .option('-l, --limit <number>', 'Number of results per page', '10')
  .option('-p, --page <number>', 'Page number', '1')
  .option('-s, --schedule-code <code>', 'Filter by schedule code')
  .option('-f, --fields <fields>', 'Specific fields to return')
  .option('--latest', 'Get only the latest schedule', false)
  .action(async (options: any) => {
    try {
      // Prepare query parameters
      const params: Record<string, string> = {};
      
      if (options.limit) params.limit = options.limit;
      if (options.page) params.page = options.page;
      if (options.scheduleCode) params.schedule_code = options.scheduleCode;
      if (options.fields) params.fields = options.fields;
      if (options.latest) params.get_latest_schedule_only = 'true';
      
      // Call the PBS API
      const result = await runPbsApiTool({
        endpoint: 'item-overview',
        method: 'GET',
        params,
        timeout: 30000
      });
      
      // Print the result
      console.log(result.content[0].text);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error: ${errorMessage}`);
      process.exit(1);
    }
  });

// Add command for querying any endpoint
program
  .command('query <endpoint>')
  .description('Query any PBS API endpoint')
  .option('-m, --method <method>', 'HTTP method', 'GET')
  .option('-p, --params <json>', 'Query parameters as JSON string')
  .option('-k, --subscription-key <key>', 'Custom subscription key')
  .option('-t, --timeout <milliseconds>', 'Request timeout in milliseconds', '30000')
  .action(async (endpoint: string, options: any) => {
    try {
      // Parse query parameters if provided
      let params: Record<string, string> | undefined;
      if (options.params) {
        try {
          params = JSON.parse(options.params);
        } catch (error) {
          console.error('Error parsing params JSON:', error);
          process.exit(1);
        }
      }
      
      // Prepare tool arguments
      const args: z.infer<typeof PbsApiToolSchema> = {
        endpoint,
        method: options.method as 'GET' | 'POST',
        timeout: parseInt(options.timeout, 10)
      };
      
      if (params) args.params = params;
      if (options.subscriptionKey) args.subscriptionKey = options.subscriptionKey;
      
      // Call the PBS API
      const result = await runPbsApiTool(args);
      
      // Print the result
      console.log(result.content[0].text);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error: ${errorMessage}`);
      process.exit(1);
    }
  });

// Add command for starting the HTTP server
program
  .command('serve')
  .description('Start the PBS MCP HTTP server')
  .option('-p, --port <number>', 'Port to listen on', '3000')
  .action(async (options: any) => {
    try {
      // Set the PORT environment variable
      process.env.PORT = options.port;
      
      // Import and run the HTTP server
      await import('./http.js');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error: ${errorMessage}`);
      process.exit(1);
    }
  });

// Parse command-line arguments
program.parse(process.argv);

// If no command is provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
} 