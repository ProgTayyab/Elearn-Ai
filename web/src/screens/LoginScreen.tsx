import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { GradientButton } from '../components/ui/GradientButton';
import api from '../api/client';

export const LoginScreen: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const login = useAuthStore((s) => s.login);
  const from = (location.state as { from?: string })?.from ?? '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (isRegister && !name.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister ? { email, password, name } : { email, password };
      const { data } = await api.post(endpoint, payload);
      await login(data.token, data.refreshToken, data.user);
      queryClient.clear();
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Invalid email or password';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background-dark overflow-hidden flex items-center justify-center p-6">
      {/* Dynamic Backing Mesh Glows */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/30 via-background-dark to-purple-950/30 z-0" />
      <div className="absolute -top-40 -left-40 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -right-40 w-[30rem] h-[30rem] bg-purple-500/10 rounded-full blur-3xl animate-pulse" />

      {/* Auth Card container */}
      <div className="relative w-full max-w-md z-10 rounded-3xl glass-panel shadow-2xl p-8 md:p-10 border border-white/10 glow-card">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-extrabold text-2xl tracking-tight text-white mb-2">NeuralLearn</h1>
          <p className="text-gray-400 text-sm text-center">
            {isRegister ? 'Start your AI learning journey' : 'Welcome back to your dashboard'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl flex items-center justify-center text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="flex flex-col">
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-13 px-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                disabled={loading}
              />
            </div>
          )}

          <div className="flex flex-col">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-13 px-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              disabled={loading}
            />
          </div>

          <div className="relative flex flex-col">
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-13 px-5 pr-12 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
            >
              {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <GradientButton type="submit" loading={loading} className="w-full py-4 mt-2">
            {isRegister ? 'Create Account' : 'Sign In'}
          </GradientButton>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400">
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
          >
            {isRegister ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};
