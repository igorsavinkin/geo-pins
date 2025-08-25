
import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';

const AuthPage: React.FC = () => {
  const [showLogin, setShowLogin] = useState(true);

  if (showLogin) {
    return <LoginForm onSwitchToSignUp={() => setShowLogin(false)} />;
  } else {
    return <SignUpForm onSwitchToLogin={() => setShowLogin(true)} />;
  }
};

export default AuthPage;