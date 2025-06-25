'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import TextField from '../../../components/auth/TextField';
import PrimaryButton from '../../../components/auth/PrimaryButton';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react'; // Add at the top with other imports


export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showModal, setShowModal] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false); // NEW
  const router = useRouter();

  const validateEmail = (email) =>
    /^[^\s@]+@(?:[a-zA-Z0-9-]+\.)*amrita\.edu$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || submitted) return; // Prevent multiple clicks

    setError('');
    setLoading(true);
    setSubmitted(true); // Set immediately to block all further submits

    if (!email.trim()) {
      setError('Email is required.');
      setLoading(false);
      setSubmitted(false); // Allow retry on error
      return;
    }

    if (!validateEmail(email)) {
      setError('Only University email addresses are allowed.');
      setLoading(false);
      setSubmitted(false); // Allow retry on error
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const endpoint = `${baseUrl}/api/forgotpassword`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Something went wrong.');
        setLoading(false);
        setSubmitted(false); // Allow retry on error
        return;
      }

      setShowModal(true);
      setLoading(false); // Keep submitted true, so no more submits allowed
    } catch (err) {
      setError('Unable to connect to the server. Please try again later.');
      setLoading(false);
      setSubmitted(false); // Allow retry on error
    }
  };

  const handleModalClose = () => {
    setShowModal(false); 
    router.push('/auth/login'); 
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
            placeholder="Enter your University email"
            className="w-full"
            disabled={loading || submitted} // Disable after submit
          />
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          {successMsg && <p className="text-green-600 text-sm text-center">{successMsg}</p>}
          <PrimaryButton
            text={
              loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Sending...
                </span>
              ) : "Send Reset Link"
            }
            className="w-full py-3 mt-4"
            disabled={loading || submitted} // Disable after submit
          />
        </form>

        <p className="text-center text-sm text-gray-600">
          Remember your password?{' '}
          <Link href="/auth/login" className="text-indigo-500 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      {showModal && (
        <motion.div
          className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            {/* Dynamic Tick Animation */}
            <div className="mb-4 flex justify-center">
              <svg width="60" height="60" viewBox="0 0 52 52" className="text-green-600">
                <motion.path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 27l10 10 20-20"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                />
                <circle
                  cx="26"
                  cy="26"
                  r="25"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="opacity-30"
                />
              </svg>
            </div>

            <h3 className="text-xl font-semibold">Email Sent</h3>
            <p className="text-sm mt-2">An email has been sent to {email}. Please verify your account.</p>
            <p className="text-sm mt-1 text-gray-600">Check your spam folder if you don&rsquo;t see it.</p>

            <div className="mt-4">
              <button
                onClick={handleModalClose}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md text-sm font-medium transition"
              >
                OK
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
