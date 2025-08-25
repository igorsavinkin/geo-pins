

import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useNotifier } from '../../hooks/useNotifier';
import Input from '../UI/Input';
import Button from '../UI/Button';

interface LoginFormProps {
  onSwitchToSignUp: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignUp }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAppContext();
  const { addNotification } = useNotifier();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
        addNotification("Please enter username and password.", "error");
        return;
    }
    setIsLoggingIn(true);
    const success = await login(username, password);
    if (!success) {
      setIsLoggingIn(false);
    }
    // On success, component will unmount, no need to set state
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md space-y-6">
      <h2 className="text-3xl font-bold text-center text-sky-400">Welcome Back</h2>
      <div>
        <Input
          id="login-username"
          type="text"
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          className="bg-slate-700 border-slate-600 text-white focus:ring-sky-500 focus:border-sky-500"
          labelClassName="text-sky-300"
          autoComplete="username"
          disabled={isLoggingIn}
        />
      </div>
      <div>
        <Input
          id="login-password"
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="bg-slate-700 border-slate-600 text-white focus:ring-sky-500 focus:border-sky-500"
          labelClassName="text-sky-300"
          autoComplete="current-password"
          disabled={isLoggingIn}
        />
      </div>
      <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-500 text-lg" disabled={isLoggingIn}>
        {isLoggingIn ? 'Signing In...' : 'Sign In'}
      </Button>
      <p className="text-center text-sm text-gray-400">
        Don't have an account?{' '}
        <button 
          type="button" 
          onClick={onSwitchToSignUp} 
          className="font-medium text-sky-400 hover:text-sky-300 focus:outline-none"
          aria-label="Switch to sign up form"
        >
          Sign Up
        </button>
      </p>
    </form>
  );
};

export default LoginForm;