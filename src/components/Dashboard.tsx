import React from 'react';
import { Bot, LogOut, MessageCircle, Settings, User, Plus } from 'lucide-react';
import { createChat } from '../lib/graphql';
import ChatInterface from './ChatInterface';

interface DashboardProps {
  user: { id: string; email: string } | null;
  onSignOut: () => void;
  verificationMessage?: string | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onSignOut, verificationMessage }) => {
  const [isCreatingChat, setIsCreatingChat] = React.useState(false);
  const [chatError, setChatError] = React.useState<string | null>(null);
  const [currentChat, setCurrentChat] = React.useState<{ id: string; title: string } | null>(null);

  const handleCreateChat = async () => {
    if (!user) return;
    
    setIsCreatingChat(true);
    setChatError(null);
    
    try {
      const chatTitle = `Chat ${new Date().toLocaleString()}`;
      const newChat = await createChat(chatTitle, user.id);
      
      console.log('Chat created successfully:', newChat);
      setCurrentChat({ id: newChat.id, title: newChat.title });
      
    } catch (error) {
      console.error('Failed to create chat:', error);
      setChatError('Failed to create chat. Please try again.');
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleBackToDashboard = () => {
    setCurrentChat(null);
  };

  // Show chat interface if a chat is selected
  if (currentChat && user) {
    return (
      <ChatInterface
        chatId={currentChat.id}
        chatTitle={currentChat.title}
        user={user}
        onBack={handleBackToDashboard}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-xl">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Chat Bot</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-sm text-gray-700 font-medium">{user?.email}</span>
              </div>
              
              <button
                onClick={onSignOut}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Verification Success Message */}
        {verificationMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600">{verificationMessage}</p>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h2>
          <p className="text-gray-600">Ready to start chatting with your AI assistant?</p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            {chatError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{chatError}</p>
              </div>
            )}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Create New Chat</h3>
                <p className="text-sm text-gray-500">Start a new conversation</p>
              </div>
            </div>
            <button 
              onClick={handleCreateChat}
              disabled={isCreatingChat}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isCreatingChat ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  New Chat
                </>
              )}
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
                <p className="text-sm text-gray-500">Customize your experience</p>
              </div>
            </div>
            <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
              Configure
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
                <p className="text-sm text-gray-500">Manage your account</p>
              </div>
            </div>
            <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
              View Profile
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;