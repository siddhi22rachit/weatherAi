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
    <div className="flex flex-col h-full max-w-2xl mx-auto bg-white">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
        {messages.length === 0 && (
          <div className="text-center text-gray-600 mt-16">
            <p className="text-lg">Ask me about the weather in any city</p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className="animate-fade-in">
            {message.type === 'user' ? (
              <div className="flex justify-end mb-4">
                <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-lg max-w-md">
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <div className={`text-gray-800 leading-relaxed ${
                  message.type === 'error' ? 'text-red-600' : ''
                }`}>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="animate-fade-in">
            <div className="text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-6 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Ask about weather..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed text-sm"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              '→'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
