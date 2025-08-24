import React, { useEffect, useState } from 'react';
import { nhost } from './lib/nhost';
import SignIn from './components/SignIn';
import Dashboard from './components/Dashboard';
import EmailVerificationSuccess from './components/EmailVerificationSuccess';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showVerificationSuccess, setShowVerificationSuccess] = useState(false);
  const [error, setError] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [user, setUser] = useState(null);

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

      // Check existing session
      const session = nhost.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        setUser(session.user);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    handleAuth();

    // Listen for auth state changes
    const unsubscribe = nhost.auth.onAuthStateChanged((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
        setUser(session.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    setError('');
    try {
      const { error } = await nhost.auth.signIn({ email, password });
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    setError('');
    try {
      const { error } = await nhost.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setVerificationMessage('Please check your email to verify your account.');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  const handleSignOut = async () => {
    await nhost.auth.signOut();
    // Clear URL parameters when signing out
    window.history.replaceState({}, document.title, window.location.pathname);
  };

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

  return isAuthenticated ? (
    <Dashboard user={user} onSignOut={handleSignOut} />
  ) : (
    <SignIn 
      onSignIn={handleSignIn}
      onSignUp={handleSignUp}
      error={error}
      verificationMessage={verificationMessage}
    />
  );
}

export default App;