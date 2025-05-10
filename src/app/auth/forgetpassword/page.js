'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import TextField from '../../../components/auth/TextField';
import PrimaryButton from '../../../components/auth/PrimaryButton';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const router = useRouter();

  const validateEmail = (email) =>
    /^[^\s@]+@amrita\.edu$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Only @amrita.edu email addresses are allowed.');
      return;
    }

    setSuccessMsg('A password reset link has been sent to your email.');
    setTimeout(() => {
      router.push('/auth/login');
    }, 2500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h2 className="text-3xl font-semibold text-center text-gray-800">Forgot Password</h2>
        <p className="text-sm text-gray-600 text-center">
          Enter your registered registered email and we&apos;ll send you a password reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <TextField
            label="Your email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@amrita.edu"
            className="w-full"
          />
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          {successMsg && <p className="text-green-600 text-sm text-center">{successMsg}</p>}
          <PrimaryButton text="Send Reset Link" className="w-full py-3 mt-4" />
        </form>

        <p className="text-center text-sm text-gray-600">
          Remember your password?{' '}
          <Link href="/auth/login" className="text-indigo-500 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
