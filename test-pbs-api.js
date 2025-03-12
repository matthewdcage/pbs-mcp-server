#!/usr/bin/env node

/**
 * PBS API Test Script
 * 
 * This script tests the connection to the PBS API by making a simple request
 * to the root endpoint and displaying the response.
 */

import axios from 'axios';

// Default subscription key for unregistered public users
const DEFAULT_SUBSCRIPTION_KEY = "2384af7c667342ceb5a736fe29f1dc6b";

// Base URL for the PBS API
const PBS_API_BASE_URL = "https://data-api.health.gov.au/pbs/api/v3";

async function testPbsApi() {
  try {
    console.log("Testing PBS API connection...");
    
    // Configure request
    const config = {
      method: 'GET',
      url: PBS_API_BASE_URL,
      headers: {
        'Subscription-Key': DEFAULT_SUBSCRIPTION_KEY,
        'Accept': 'application/json'
      },
      timeout: 30000
    };
    
    // Make the request
    const response = await axios(config);
    
    console.log("PBS API connection successful!");
    console.log("Status:", response.status, response.statusText);
    
    // Extract rate limit information from headers
    const rateLimitLimit = response.headers['x-rate-limit-limit'];
    const rateLimitRemaining = response.headers['x-rate-limit-remaining'];
    const rateLimitReset = response.headers['x-rate-limit-reset'];
    
    if (rateLimitLimit || rateLimitRemaining || rateLimitReset) {
      console.log("Rate Limit Information:");
      console.log("  Limit:", rateLimitLimit);
      console.log("  Remaining:", rateLimitRemaining);
      console.log("  Reset:", rateLimitReset);
    }
    
    // Display a sample of the response data
    console.log("\nResponse Data Sample:");
    if (response.data && response.data._meta) {
      console.log("API Publisher:", response.data._meta.info?.publisher?.name);
      console.log("Processing Time:", response.data._meta.processing_time);
    }
    
    console.log("\nTest completed successfully!");
  } catch (error) {
    console.error("PBS API connection failed!");
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Status:", error.response.status, error.response.statusText);
      console.error("Response Data:", error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received from server");
    } else {
      // Something happened in setting up the request
      console.error("Error:", error.message);
    }
    
    process.exit(1);
  }
}

// Run the test
testPbsApi(); 