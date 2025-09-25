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

    // Handle streaming response
    const responseText = await response.text();
    
    // Debug: Log the raw response to understand the format
    console.log('Raw API Response:', responseText);
    
    // The API returns streaming data, so we need to parse the response
    const lines = responseText.trim().split('\n');
    let lastValidData = null;
    let allMessages = [];

    // Process each line to find valid JSON responses
    for (const line of lines) {
      if (line.trim()) {
        try {
          // Try to parse each line as JSON
          const parsed = JSON.parse(line);
          console.log('Parsed line:', parsed);
          
          // Check for different possible response formats
          if (parsed && parsed.messages) {
            lastValidData = parsed;
            // Collect all messages from this response
            allMessages = [...allMessages, ...parsed.messages];
          } else if (parsed && parsed.content) {
            // Handle single message format
            allMessages.push(parsed);
          } else if (parsed && parsed.data && parsed.data.messages) {
            // Handle nested data format
            lastValidData = parsed.data;
            allMessages = [...allMessages, ...parsed.data.messages];
          }
        } catch (e) {
          // Skip invalid JSON lines (common in streaming responses)
          console.log('Failed to parse line:', line, 'Error:', e.message);
          continue;
        }
      }
    }

    console.log('All collected messages:', allMessages);
    console.log('Last valid data:', lastValidData);

    // Extract the agent's reply from collected messages
    if (allMessages.length > 0) {
      // Find the last assistant/agent message
      const agentMessages = allMessages.filter(msg => 
        msg.role === 'assistant' || 
        msg.role === 'agent' || 
        msg.type === 'agent' ||
        (!msg.role && !msg.type) // fallback for messages without explicit role
      );
      
      if (agentMessages.length > 0) {
        const lastMessage = agentMessages[agentMessages.length - 1];
        return lastMessage.content || lastMessage.text || "I'm sorry, I couldn't process your request.";
      } else {
        // If no specific agent messages, use the last message
        const lastMessage = allMessages[allMessages.length - 1];
        return lastMessage.content || lastMessage.text || "I'm sorry, I couldn't process your request.";
      }
    } else if (lastValidData && lastValidData.messages && lastValidData.messages.length > 0) {
      // Fallback to original logic
      const lastMessage = lastValidData.messages[lastValidData.messages.length - 1];
      return lastMessage.content || lastMessage.text || "I'm sorry, I couldn't process your request.";
    } else {
      // If we still can't find a valid response, return the raw response for debugging
      console.error('No valid messages found. Raw response:', responseText);
      throw new Error(`No valid response received from the API. Raw response: ${responseText.substring(0, 200)}...`);
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
