import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Bot, ArrowRight } from 'lucide-react';
import { nhost } from '../lib/nhost';

interface EmailVerificationProps {
  onGoToSignIn: () => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({ onGoToSignIn }) => {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const refreshToken = urlParams.get('refreshToken');
        const type = urlParams.get('type');

        if (type === 'verifyEmail' && refreshToken) {
          // Verify the email using the refresh token
          const verificationResult = await nhost.auth.setSession({ refreshToken });
          
          if (verificationResult.session) {
            // Email verified successfully, sign out immediately
            await nhost.auth.signOut();
            setVerificationStatus('success');
          } else {
            setVerificationStatus('error');
            setErrorMessage('Email verification failed. The link may be expired or invalid.');
          }
        } else {
          setVerificationStatus('error');
          setErrorMessage('Invalid verification link.');
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setVerificationStatus('error');
        setErrorMessage('An error occurred during email verification. Please try again.');
      }
    };

    verifyEmail();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6 shadow-lg">
            <Bot className="w-8 h-8 text-white" />
          </div>

          {verificationStatus === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Email</h1>
              <p className="text-gray-600">Please wait while we verify your email address...</p>
            </>
          )}

          {verificationStatus === 'success' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
              <p className="text-gray-600 mb-6">
                Your email has been successfully verified. You can now sign in to your Chat Bot account.
              </p>
              <button
                onClick={onGoToSignIn}
                className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Go to Sign In
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </>
          )}

          {verificationStatus === 'error' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
              <p className="text-red-600 mb-6">{errorMessage}</p>
              <button
                onClick={onGoToSignIn}
                className="w-full flex items-center justify-center py-3 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Go to Sign In
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;