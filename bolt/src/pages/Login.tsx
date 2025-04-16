import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Anchor } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to sign in');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-ocean-100 p-3 rounded-full">
              <Anchor className="h-12 w-12 text-ocean-700" />
            </div>
          </div>
          <h2 className="text-3xl font-display font-bold text-ocean-900">Welcome Back</h2>
          <p className="text-sand-600 mt-2">Sign in to your account</p>
        </div>
        
        {error && (
          <div className="bg-coral-50 text-coral-700 p-4 rounded-lg mb-6 text-sm font-medium">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-sand-900 mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-sand-200 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sand-900 mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-sand-200 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-ocean-600 to-ocean-700 text-white py-3 rounded-lg font-medium hover:from-ocean-700 hover:to-ocean-800 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-ocean-500"
          >
            Sign In
          </button>
        </form>
        <p className="mt-6 text-center text-sand-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-ocean-600 hover:text-ocean-700 font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}