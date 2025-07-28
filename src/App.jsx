import React, { useState, useEffect } from 'react';
import { authService } from './services';
import { Auth } from './components';
import JobAppsMain from './JobAppsMain';

const JobApplicationTracker = () => {
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const user = await authService.checkUser();
    if (user) {
      setUser(user);
    }
  };

  // Auth handlers
  const handleSignIn = async (email, password) => {
    setAuthError('');
    setLoading(true);

    const { user, error } = await authService.signIn(email, password);

    if (error) {
      setAuthError(error);
    } else {
      setUser(user);
    }

    setLoading(false);
  };

  const handleSignUp = async (email, password, confirmPassword) => {
    setAuthError('');

    // Validate form
    const validationError = authService.validateSignUp(email, password, confirmPassword);
    if (validationError) {
      setAuthError(validationError);
      return;
    }

    setLoading(true);

    const { user, error } = await authService.signUp(email, password);

    if (error) {
      setAuthError(error);
    } else {
      setUser(user);
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    const { error } = await authService.signOut();
    if (!error) {
      setUser(null);
    }
  };

  // Render Auth or Main App based on user state
  if (!user) {
    return (
      <Auth
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        loading={loading}
        authError={authError}
      />
    );
  }

  return <JobAppsMain user={user} onLogout={handleLogout} />;
};

export default JobApplicationTracker;