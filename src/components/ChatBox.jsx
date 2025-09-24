/**
 * ChatBox Component
 * 
 * This component handles the chat interface including:
 * - Message display (user and agent messages)
 * - Input handling and message sending
 * - Loading states and error handling
 * - Responsive design and animations
 */

import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToWeatherAgent } from '../api.js';

const ChatBox = () => {
  // State management
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Refs for DOM manipulation
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate input
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    
    // Add user message to chat
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    // Clear input and reset states
    setInputMessage('');
    setError(null);
    setIsLoading(true);

    try {
      // Send message to weather agent API
      const agentResponse = await sendMessageToWeatherAgent(userMessage);
      
      // Add agent response to chat
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'agent',
        content: agentResponse,
        timestamp: new Date()
      }]);

    } catch (error) {
      // Handle API errors
      setError(error.message);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'error',
        content: error.message,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
      // Focus back on input for better UX
      inputRef.current?.focus();
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-4 text-center">
        <h2 className="text-lg font-semibold">🌤️ Weather Chat Agent</h2>
        <p className="text-sm opacity-90">Ask me anything about the weather!</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-container min-h-0">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <div className="text-4xl mb-2">☀️</div>
            <p className="text-lg font-medium">Welcome to Weather Chat!</p>
            <p className="text-sm">Ask me about weather conditions, forecasts, or climate information.</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex animate-slide-up ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`chat-bubble p-3 shadow-md ${
                message.type === 'user'
                  ? 'user-bubble'
                  : message.type === 'error'
                  ? 'error-bubble'
                  : 'agent-bubble'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              <div className="text-xs opacity-75 mt-1">
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="chat-bubble p-3 shadow-md typing-indicator">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-sm">Agent is typing...</span>
              </div>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t bg-gray-50 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Ask about weather conditions, forecasts, or climate..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              '📤'
            )}
          </button>
        </form>
        
        {/* Character count */}
        <div className="text-xs text-gray-500 mt-1 text-right">
          {inputMessage.length}/500
        </div>
      </div>
    </div>
  );
};

export default ChatBox;

