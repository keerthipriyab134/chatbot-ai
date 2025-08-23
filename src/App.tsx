import React, { useState, useEffect } from 'react';
import { nhost } from './lib/nhost';
import SignIn from './components/SignIn';
import Dashboard from './components/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);

  // Check authentication state on app load
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        // First, clear any potentially stale session data
        await nhost.auth.signOut();
        
        // Check if this is an email verification callback
        const urlParams = new URLSearchParams(window.location.search);
        const refreshToken = urlParams.get('refreshToken');
        const type = urlParams.get('type');
        
        if (type === 'verifyEmail' && refreshToken) {
          try {
            // Handle email verification
            // Verify the email using the refresh token
            const verificationResult = await nhost.auth.setSession({ refreshToken });
            
            if (verificationResult.session) {
              // Email verified successfully, but don't sign in automatically
              // Sign out immediately and show success message
              await nhost.auth.signOut();
              setVerificationMessage('Email verified successfully! You can now sign in with your credentials.');
              setIsAuthenticated(false);
              setUser(null);
            } else {
              setAuthError('Email verification failed. Please try again or contact support.');
            }
            
            // Clear the URL parameters to show clean sign-in page
            window.history.replaceState({}, document.title, window.location.pathname);
            setIsLoading(false);
            return;
          } catch (error) {
            console.error('Email verification error:', error);
            setAuthError('Email verification failed. Please try again or contact support.');
            // Clear the URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
            setIsLoading(false);
            return;
          }
        } else {
          // For normal page loads, ensure we start with a clean state
          setIsAuthenticated(false);
          setUser(null);
          setAuthError(null);
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        // Ensure clean state on error
        setIsAuthenticated(false);
        setUser(null);
        setAuthError(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    setAuthError(null);
    setVerificationMessage(null);
    
    try {
      const signInResult = await nhost.auth.signIn({
        email,
        password,
      });
      
      const { session, error } = signInResult;

      if (error) {
        setAuthError(error.message);
        return;
      }

      if (session) {
        setUser({ 
          id: session.user.id,
          email: session.user.email 
        });
        setIsAuthenticated(true);
      }
    } catch (error) {
      setAuthError('An unexpected error occurred. Please try again.');
      console.error('Authentication error:', error);
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    setAuthError(null);
    setVerificationMessage(null);
    
    try {
      const signUpResult = await nhost.auth.signUp({
        email,
        password,
      });
      
      const { session, error } = signUpResult;

      if (error) {
        setAuthError(error.message);
        return;
      }

      // For nhost, after signup, user might need to verify email
      // If session exists immediately, sign them in
      if (session) {
        setUser({ 
          id: session.user.id,
          email: session.user.email 
        });
        setIsAuthenticated(true);
      } else {
        // If no session (email verification required), show success message
        setAuthError('Account created successfully! Please check your email to verify your account, then sign in.');
      }
    } catch (error) {
      setAuthError('An unexpected error occurred during signup. Please try again.');
      console.error('Signup error:', error);
    }
  };

  const handleSignOut = () => {
    nhost.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
    setAuthError(null);
    setVerificationMessage(null);
    
    // Clear any URL parameters that might cause issues
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {!isAuthenticated ? (
        <SignIn 
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          error={authError}
          verificationMessage={verificationMessage}
        />
      ) : (
        <Dashboard 
          user={user} 
          onSignOut={handleSignOut}
          verificationMessage={verificationMessage}
        />
      )}
    </div>
  );
}

export default App;