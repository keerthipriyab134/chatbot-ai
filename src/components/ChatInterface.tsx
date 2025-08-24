import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ArrowLeft, Copy, MoreVertical } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatInterfaceProps {
  chatId: string;
  chatTitle: string;
  user: { id: string; email: string };
  onBack: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatId, chatTitle, user, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendToN8N = async (message: string) => {
    try {
      const n8nWebhookUrl = 'https://keerthipriyab12372.app.n8n.cloud/webhook/chatbot-webhook';
      
      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
          message: message,
          userId: user.id,
          chatId: chatId,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response has content before parsing JSON
      const contentLength = response.headers.get('content-length');
      if (response.status === 204 || contentLength === '0') {
        return 'I received your message but got an empty response. Please try again.';
      }

      // Check if response has JSON content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        return textResponse || 'I received your message but got an unexpected response format.';
      }

      // Safely parse JSON with fallback
      let result;
      try {
        const responseText = await response.text();
        if (!responseText.trim()) {
          return 'I received your message but got an empty response. Please try again.';
        }
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        return 'I received your message but couldn\'t understand the response format. Please try again.';
      }
      
      // Handle different possible response formats
      console.log('n8n response:', result);
      
      // Check for the format you described: [{"data": {"insert_messages_one": {"content": "..."}}}]
      if (Array.isArray(result) && result.length > 0 && result[0]?.data?.insert_messages_one?.content) {
        return result[0].data.insert_messages_one.content.trim();
      }
      
      // Check for simple response format: {"response": "..."}
      if (result?.response) {
        return result.response.trim();
      }
      
      // Check for direct content format: {"content": "..."}
      if (result?.content) {
        return result.content.trim();
      }
      
      // Check if result is a string
      if (typeof result === 'string') {
        return result.trim();
      }
      
      // Log the actual response format for debugging
      console.error('Unexpected response format:', result);
      return `Debug: Received response but couldn't parse it. Response: ${JSON.stringify(result)}`;
    } catch (error) {
      console.error('Error sending to n8n:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return 'Unable to connect to the AI service. Please check your internet connection and try again.';
      }
      return `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const botResponse = await sendToN8N(userMessage.content);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">{chatTitle}</h1>
              <p className="text-sm text-gray-500">AI Assistant</p>
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} group`}
          >
            <div className={`flex items-start space-x-3 max-w-2xl ${message.isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.isBot ? 'bg-blue-600' : 'bg-gray-600'
              }`}>
                {message.isBot ? (
                  <Bot className="w-5 h-5 text-white" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex-1">
                <div className={`rounded-2xl px-4 py-3 relative ${
                  message.isBot 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'bg-blue-600 text-white ml-12'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  {message.isBot && (
                    <button
                      onClick={() => copyMessage(message.content)}
                      className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-all"
                    >
                      <Copy className="w-3 h-3 text-gray-500" />
                    </button>
                  )}
                </div>
                <p className={`text-xs mt-1 px-1 ${
                  message.isBot ? 'text-gray-500' : 'text-gray-500 text-right'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3 max-w-2xl">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-6">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-4">
          <div className="flex-1">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;