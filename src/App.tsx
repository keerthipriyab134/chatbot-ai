import React, { useEffect, useState } from 'react';
import { nhost } from './lib/nhost';
import SignIn from './components/SignIn';
import Dashboard from './components/Dashboard';
import EmailVerificationSuccess from './components/EmailVerificationSuccess';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showVerificationSuccess, setShowVerificationSuccess] = useState(false);

  useEffect(() => {
    const handleAuth = async () => {
      // Check if this is an email verification callback
      const urlParams = new URLSearchParams(window.location.search);
      const refreshToken = urlParams.get('refreshToken');
      const type = urlParams.get('type');

      if (refreshToken && type === 'verifyEmail') {
        try {
          // Handle email verification
          await nhost.auth.setSession({ refreshToken });
          
          // Show success page instead of redirecting
          setShowVerificationSuccess(true);
          setIsLoading(false);
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        } catch (error) {
          console.error('Email verification failed:', error);
        }
      }

      // Clear any stale sessions on normal app load
      await nhost.auth.signOut();
      setIsAuthenticated(false);
      setIsLoading(false);
    };

    handleAuth();

    // Listen for auth state changes
    const unsubscribe = nhost.auth.onAuthStateChanged((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showVerificationSuccess) {
    return <EmailVerificationSuccess />;
  }

  return isAuthenticated ? <Dashboard /> : <SignIn />;
}

export default App;