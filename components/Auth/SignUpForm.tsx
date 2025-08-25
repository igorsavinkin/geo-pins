

import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useNotifier } from '../../hooks/useNotifier';
import Input from '../UI/Input';
import Button from '../UI/Button';

interface SignUpFormProps {
  onSwitchToLogin: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const { registerUser } = useAppContext();
  const { addNotification } = useNotifier();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password || !confirmPassword) {
      addNotification('All fields are required.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      addNotification('Passwords do not match.', 'error');
      return;
    }
    if (password.length < 6) {
      addNotification('Password must be at least 6 characters long.', 'error');
      return;
    }
    
    setIsSigningUp(true);
    const success = await registerUser(username.trim(), password);
    if (!success) {
      // If registration fails (e.g., username taken), allow user to try again
      setIsSigningUp(false);
    }
    // On success, user is logged in and component will unmount
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md space-y-6">
      <h2 className="text-3xl font-bold text-center text-sky-400">Create Account</h2>
      <div>
        <Input
          id="signup-username"
          type="text"
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Choose a username"
          className="bg-slate-700 border-slate-600 text-white focus:ring-sky-500 focus:border-sky-500"
          labelClassName="text-sky-300"
          required
          autoComplete="username"
          disabled={isSigningUp}
        />
      </div>
      <div>
        <Input
          id="signup-password"
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password (min. 6 chars)"
          className="bg-slate-700 border-slate-600 text-white focus:ring-sky-500 focus:border-sky-500"
          labelClassName="text-sky-300"
          required
          minLength={6}
          autoComplete="new-password"
          disabled={isSigningUp}
        />
      </div>
      <div>
        <Input
          id="signup-confirm-password"
          type="password"
          label="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          className="bg-slate-700 border-slate-600 text-white focus:ring-sky-500 focus:border-sky-500"
          labelClassName="text-sky-300"
          required
          minLength={6}
          autoComplete="new-password"
          disabled={isSigningUp}
        />
      </div>
      <Button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-lg" disabled={isSigningUp}>
        {isSigningUp ? 'Creating Account...' : 'Sign Up'}
      </Button>
      <p className="text-center text-sm text-gray-400">
        Already have an account?{' '}
        <button 
          type="button" 
          onClick={onSwitchToLogin} 
          className="font-medium text-sky-400 hover:text-sky-300 focus:outline-none"
          aria-label="Switch to login form"
        >
          Sign In
        </button>
      </p>
    </form>
  );
};

export default SignUpForm;