import React from 'react';
import { Bot, LogOut, MessageCircle, Settings, User, Plus, Clock } from 'lucide-react';
import { createChat, getUserChats } from '../lib/graphql';
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
  const [userChats, setUserChats] = React.useState<any[]>([]);
  const [isLoadingChats, setIsLoadingChats] = React.useState(true);

  // Load user chats on component mount
  React.useEffect(() => {
    const loadUserChats = async () => {
      if (!user) return;
      
      try {
        const chats = await getUserChats(user.id);
        setUserChats(chats);
      } catch (error) {
        console.error('Failed to load chats:', error);
      } finally {
        setIsLoadingChats(false);
      }
    };

    loadUserChats();
  }, [user]);

  const handleCreateChat = async () => {
    if (!user) return;
    
    setIsCreatingChat(true);
    setChatError(null);
    
    try {
      const chatTitle = `Chat ${new Date().toLocaleString()}`;
      const newChat = await createChat(chatTitle, user.id);
      
      console.log('Chat created successfully:', newChat);
      setCurrentChat({ id: newChat.id, title: newChat.title });
      
      // Add the new chat to the list
      setUserChats(prev => [newChat, ...prev]);
      
    } catch (error) {
      console.error('Failed to create chat:', error);
      setChatError('Failed to create chat. Please try again.');
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleBackToDashboard = () => {
    setCurrentChat(null);
    // Reload chats when coming back from a chat
    if (user) {
      getUserChats(user.id).then(setUserChats).catch(console.error);
    }
  };

  const handleOpenChat = (chat: any) => {
    setCurrentChat({ id: chat.id, title: chat.title });
  };

  // Show chat interface if a chat is selected
  if (currentChat && user) {
    return (
      <ChatInterface
        chatId={currentChat.id}
        chatTitle={currentChat.title}
        user={user}
        onBack={handleBackToDashboard}
        onTitleUpdate={(newTitle) => {
          // Update the chat title in the local state
          setUserChats(prev => prev.map(chat => 
            chat.id === currentChat.id ? { ...chat, title: newTitle } : chat
          ));
          setCurrentChat(prev => prev ? { ...prev, title: newTitle } : null);
        }}
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

        {/* Recent Chats Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Recent Chats
          </h3>
          
          {isLoadingChats ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ) : userChats.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userChats.slice(0, 6).map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleOpenChat(chat)}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:border-blue-200"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {chat.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(chat.updated_at).toLocaleDateString()} at{' '}
                        {new Date(chat.updated_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No chats yet</h4>
              <p className="text-gray-500 mb-4">Start your first conversation with the AI assistant</p>
              <button
                onClick={handleCreateChat}
                disabled={isCreatingChat}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
              >
                {isCreatingChat ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Start Chatting
                  </>
                )}
              </button>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default Dashboard;