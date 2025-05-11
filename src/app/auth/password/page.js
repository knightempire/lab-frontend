'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import TextField from '../../../components/auth/TextField';
import PrimaryButton from '../../../components/auth/PrimaryButton';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordPage({ userName = 'User' }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const isPasswordValid = (pwd) => {
    const pattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return pattern.test(pwd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid(password)) {
      setError(
        'Password must be at least 8 characters long and include letters, numbers, and a special character.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h2 className="text-3xl font-semibold text-center text-gray-800">Set Your Password</h2>
        <p className="text-sm text-center text-gray-600">Hi, {userName}, set your password here.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <TextField
              label="Enter Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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

          <div className="relative">
            <TextField
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pr-10"
            />
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <PrimaryButton text="Set Password" className="w-full py-3 mt-4" />
        </form>

        <p className="text-center text-sm text-gray-600">
          Already updated it?{' '}
          <Link href="/auth/login" className="text-indigo-500 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
