'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import TextField from '../../../components/auth/TextField';
import PrimaryButton from '../../../components/auth/PrimaryButton';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) return;

  console.log('Token found in localStorage:', token);

  const verifyToken = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const endpoint = `${baseUrl}/api/verify-token`;

    try {
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.warn('Invalid token. Removing...');
        localStorage.removeItem('token');
        localStorage.removeItem('selectedProducts');
        return;
      }

      const data = await res.json();
      console.log('Token verification response:', data);

      const { user } = data;

      if (!user?.isActive) {
        setError('Your account is deactivated. Please contact the administrator.');
        return;
      }

      if (user?.isAdmin) {
        router.push('/admin/dashboard');
      } else {
        router.push('/user/dashboard');
      }
    } catch (err) {
      console.error('Token verification failed:', err);
      localStorage.removeItem('token');
    }
  };

  verifyToken();
}, [router]);


  const validateEmail = (email) =>
     /^[^\s@]+@(?:[a-zA-Z0-9-]+\.)*amrita\.edu$/.test(email);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Only University email addresses are allowed.');
      return;
    }

    if (!password.trim()) {
      setError('Password cannot be empty.');
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const endpoint = `${baseUrl}/api/login`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log('Login response:', data);

      if (!res.ok) {
        setError(data.message || 'Login failed. Please try again.');
        return;
      }

      const { token, user } = data;

      if (!user.isActive) {
        setError('Your account is deactivated. Please contact the administrator.');
        return;
      }

      localStorage.setItem('token', token);

      if (user.isAdmin) {
        router.push('/admin/dashboard');
      } else {
        router.push('/user/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h2 className="text-3xl font-semibold text-center text-gray-800">Sign in to your account</h2>

        <form onSubmit={handleLogin} className="space-y-6">
          <TextField
            label="Your email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your University email"
            className="w-full"
          />
          <div className="relative">
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-800"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4 text-indigo-500 rounded" />
              <span className="text-gray-700">Remember me</span>
            </label>
            <Link href="/auth/forgetpassword" className="text-indigo-500 hover:underline">
              Forgot password?
            </Link>
          </div>

          <PrimaryButton text="Sign in" className="w-full py-3 mt-4" />
        </form>

        <p className="text-center text-sm text-gray-600">
          Don&apos;t have an account yet?{' '}
          <Link href="/auth/register" className="text-indigo-500 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
