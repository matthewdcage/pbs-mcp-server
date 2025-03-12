import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { z } from 'zod';

/**
 * PBS API tool
 *   - Interacts with the Pharmaceutical Benefits Scheme (PBS) API
 *   - Provides access to PBS data including medicine listings, pricing, and availability
 *   - Uses the provided subscription key for authentication
 */

export const pbsApiToolName = "pbs_api";
export const pbsApiToolDescription = 
  "Access the Australian Pharmaceutical Benefits Scheme (PBS) API to retrieve information about medicines, pricing, and availability.";

// Default subscription key for unregistered public users
const DEFAULT_SUBSCRIPTION_KEY = "2384af7c667342ceb5a736fe29f1dc6b";

// Base URL for the PBS API
const PBS_API_BASE_URL = "https://data-api.health.gov.au/pbs/api/v3";

export const PbsApiToolSchema = z.object({
  endpoint: z.string().describe('The specific PBS API endpoint to access (e.g., "prescribers", "item-overview")'),
  method: z.enum(['GET', 'POST']).default('GET')
    .describe('HTTP method to use (GET is recommended for most PBS API operations)'),
  params: z.record(z.string()).optional()
    .describe('Query parameters to include in the request (e.g., {"get_latest_schedule_only": "true"})'),
  subscriptionKey: z.string().optional()
    .describe('Custom subscription key (if not provided, the default public key will be used)'),
  timeout: z.number().default(30000)
    .describe('Request timeout in milliseconds')
});

// Format the response in a readable way
function formatResponse(response: AxiosResponse): { content: { type: string; text: string }[] } {
  // Extract rate limit information from headers
  const rateLimitLimit = response.headers['x-rate-limit-limit'];
  const rateLimitRemaining = response.headers['x-rate-limit-remaining'];
  const rateLimitReset = response.headers['x-rate-limit-reset'];
  
  const formattedResponse: Record<string, any> = {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    data: response.data
  };
  
  // Add rate limit information if available
  if (rateLimitLimit || rateLimitRemaining || rateLimitReset) {
    formattedResponse.rateLimit = {
      limit: rateLimitLimit,
      remaining: rateLimitRemaining,
      reset: rateLimitReset
    };
  }
  
  return {
    content: [
      {
        type: "text",
        text: "```json\n" + JSON.stringify(formattedResponse, null, 2) + "\n```"
      }
    ]
  };
}

// Format error response
function formatErrorResponse(error: any): { content: { type: string; text: string }[] } {
  const errorResponse: Record<string, any> = {
    error: true
  };
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    errorResponse.status = error.response.status;
    errorResponse.statusText = error.response.statusText;
    errorResponse.headers = error.response.headers;
    errorResponse.data = error.response.data;
    
    // Extract rate limit information from headers
    const rateLimitLimit = error.response.headers['x-rate-limit-limit'];
    const rateLimitRemaining = error.response.headers['x-rate-limit-remaining'];
    const rateLimitReset = error.response.headers['x-rate-limit-reset'];
    
    if (rateLimitLimit || rateLimitRemaining || rateLimitReset) {
      errorResponse.rateLimit = {
        limit: rateLimitLimit,
        remaining: rateLimitRemaining,
        reset: rateLimitReset
      };
    }
  } else if (error.request) {
    // The request was made but no response was received
    errorResponse.message = 'No response received from server';
    errorResponse.request = 'Request was sent but no response was received';
  } else {
    // Something happened in setting up the request
    errorResponse.message = error.message;
  }
  
  // Add helpful messages for common error codes
  if (errorResponse.status === 401) {
    errorResponse.helpMessage = "Authentication failed. The PBS API requires proper authentication. Check if you need to register for API access at https://dev.pbs.gov.au/contacts.html";
  } else if (errorResponse.status === 415) {
    errorResponse.helpMessage = "Unsupported Media Type. Make sure to set the Accept header to 'application/json'.";
  } else if (errorResponse.status === 429) {
    errorResponse.helpMessage = "Rate limit exceeded. The PBS API has a limit of 5 requests per time window. Wait for the rate limit to reset before making more requests.";
  } else if (errorResponse.status === 400) {
    errorResponse.helpMessage = "Bad Request. Check if all required parameters are provided correctly.";
  }
  
  return {
    content: [
      {
        type: "text",
        text: "```json\n" + JSON.stringify(errorResponse, null, 2) + "\n```"
      }
    ]
  };
}

// Construct the full URL for the endpoint
function constructUrl(endpoint: string): string {
  // If endpoint is empty, return the base API URL
  if (!endpoint) {
    return PBS_API_BASE_URL;
  }
  
  // Make sure the endpoint starts with a slash if it doesn't already
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  return `${PBS_API_BASE_URL}${formattedEndpoint}`;
}

// PBS API tool implementation
export async function runPbsApiTool(args: z.infer<typeof PbsApiToolSchema>) {
  try {
    const endpoint = args.endpoint || '';
    console.error(`Accessing PBS API endpoint: ${args.method} ${endpoint}`);
    
    // Use the provided subscription key or fall back to the default
    const subscriptionKey = args.subscriptionKey || DEFAULT_SUBSCRIPTION_KEY;
    
    // Construct the full URL
    const url = constructUrl(endpoint);
    
    // Configure request
    const config: AxiosRequestConfig = {
      method: args.method,
      url: url,
      headers: {
        'Subscription-Key': subscriptionKey,
        'Accept': 'application/json'
      },
      params: args.params || {},
      timeout: args.timeout
    };
    
    // Make the request
    const response = await axios(config);
    
    return formatResponse(response);
  } catch (error) {
    console.error('PBS API error:', error);
    return formatErrorResponse(error);
  }
} 