/**
 * Main App Component
 * 
 * This is the root component of the Weather Chat Agent application.
 * It provides the main layout and renders the ChatBox component.
 * Features responsive design and modern styling.
 */

import React from 'react';
import ChatBox from './components/ChatBox.jsx';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Main Container */}
      <div className="container mx-auto px-4 py-6 h-screen flex flex-col">
        
        {/* App Header */}
        <header className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            🌤️ Weather Chat Agent
          </h1>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
            Get instant weather information by chatting with our AI-powered weather agent. 
            Ask about current conditions, forecasts, or any weather-related questions!
          </p>
        </header>

        {/* Chat Interface */}
        <main className="flex-1 max-w-4xl mx-auto w-full flex flex-col min-h-0">
          <div className="flex-1 min-h-0">
            <ChatBox />
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center mt-6 text-xs text-gray-500">
          <p>
            Powered by Weather Agent API • Built with React & Tailwind CSS
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;

