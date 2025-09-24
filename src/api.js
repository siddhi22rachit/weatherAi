/**
 * API Integration Module
 * 
 * This module handles all API calls to the weather agent service.
 * It includes error handling and proper request formatting.
 */

// Get API configuration from environment variables
const API_URL = import.meta.env.VITE_API_URL;
const THREAD_ID = import.meta.env.VITE_THREAD_ID;

/**
 * Send a message to the weather agent API
 * @param {string} message - The user's weather question
 * @returns {Promise<string>} - The agent's response
 * @throws {Error} - If the API request fails
 */
export const sendMessageToWeatherAgent = async (message) => {
  try {
    // Validate environment variables
    if (!API_URL || !THREAD_ID) {
      throw new Error('API configuration is missing. Please check your environment variables.');
    }

    // Prepare the request payload according to API specification
    const requestBody = {
      messages: [
        {
          role: "user",
          content: message
        }
      ],
      runId: "weatherAgent",
      maxRetries: 2,
      maxSteps: 5,
      temperature: 0.5,
      topP: 1,
      runtimeContext: {},
      threadId: THREAD_ID,
      resourceId: "weatherAgent"
    };

    // Set up request headers
    const headers = {
      "x-mastra-dev-playground": "true",
      "Content-Type": "application/json"
    };

    // Make the API request
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody)
    });

    // Check if the response is ok
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }

    // Parse the response
    const data = await response.json();

    // Extract the agent's reply from the response
    if (data && data.messages && data.messages.length > 0) {
      // Get the last message from the agent
      const lastMessage = data.messages[data.messages.length - 1];
      return lastMessage.content || "I'm sorry, I couldn't process your request.";
    } else {
      throw new Error('Invalid response format from the API');
    }

  } catch (error) {
    // Log the error for debugging
    console.error('Weather Agent API Error:', error);
    
    // Return a user-friendly error message
    if (error.message.includes('fetch')) {
      throw new Error('Unable to connect to the weather service. Please check your internet connection.');
    } else if (error.message.includes('API configuration')) {
      throw new Error('Weather service is not properly configured.');
    } else {
      throw new Error(error.message || 'An unexpected error occurred while getting weather information.');
    }
  }
};

