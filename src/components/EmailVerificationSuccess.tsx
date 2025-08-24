import React from 'react';
import { CheckCircle, ExternalLink } from 'lucide-react';

const EmailVerificationSuccess: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          {/* Success Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Email Successfully Verified!
          </h1>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            Your email has been verified successfully. You can now sign in to your Chat Bot account and start chatting with your AI assistant.
          </p>
          
          {/* Link to App */}
          <a
            href="https://chatbot-ai-keerthipriya.netlify.app/"
            className="inline-flex items-center justify-center w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] font-medium"
          >
            Go to Chat Bot App
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
          
          {/* Additional Info */}
          <p className="text-sm text-gray-500 mt-6">
            You can now close this tab and return to the app to sign in.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationSuccess;