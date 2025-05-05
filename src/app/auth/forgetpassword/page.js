'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import TextField from '../../../components/auth/TextField';
import PrimaryButton from '../../../components/auth/PrimaryButton';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Send reset link to:', email);
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h2 className="text-3xl font-semibold text-center text-gray-800">Forgot Password</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <TextField
            label="Your email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full"
          />
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
