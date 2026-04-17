import React from "react";
import { AIAssistant } from "../components/ai/AIAssistant";

const AIAssistantPage: React.FC = () => {
  // Get API key from environment variables
  const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || "";

  if (!openaiApiKey) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">
            OpenAI API Key Required
          </h2>
          <p className="text-yellow-700">
            Please set your VITE_OPENAI_API_KEY environment variable to use the AI Assistant.
          </p>
          <p className="text-sm text-yellow-600 mt-2">
            Add it to your .env file: VITE_OPENAI_API_KEY=your_api_key_here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
        <p className="text-gray-600 mt-2">
          Get intelligent insights and assistance for your CRM, sales, and inventory management.
        </p>
      </div>
      
      <AIAssistant openaiApiKey={openaiApiKey} />
    </div>
  );
};

export default AIAssistantPage;
