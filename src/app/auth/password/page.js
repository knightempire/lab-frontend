
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import TextField from '../../../components/auth/TextField';
import PrimaryButton from '../../../components/auth/PrimaryButton';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

function PasswordPageWrapper() {
  return (
<Suspense
  fallback={
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  }
>
  <PasswordPage />
</Suspense>

  );
}

export default function Page() {
  return <PasswordPageWrapper />;
}

function PasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState(null);
  const [type, setType] = useState(null);
  const [userName, setUserName] = useState('User'); 
  const router = useRouter();
  const searchParams = useSearchParams();
    const [showModal, setShowModal] = useState(false); 
const [expiredSession, setExpiredSession] = useState(false);


  useEffect(() => {
    const token = searchParams.get('token');
    const type = searchParams.get('type');

    if (!token || !type) {
      router.push('/auth/login');
      return;
    }

    setToken(token);
    setType(type);

const verifyToken = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const endpoint =
    type === 'register'
      ? `${baseUrl}/api/verify-token-register`
      : `${baseUrl}/api/verify-token-forgot`;

  console.log('Verifying token:', token);
  console.log('Token type:', type);
  console.log('Endpoint:', endpoint);

  try {
    const res = await fetch(endpoint, {
      method: 'GET', // Method is GET
      headers: {
        'Content-Type': 'application/json', // Optional, but you can include it
        'Authorization': `Bearer ${token}`, // Send token in Authorization header
      },
    });


    if (!res.ok) {
      const errorData = await res.json(); // Wait for error response data
      console.error(`Error verifying token at ${endpoint}`);
      console.error('Error response:', errorData); // Log the actual error response

      setError(errorData.message || 'Something went wrong.');
      setExpiredSession(true);
      setTimeout(() => router.push('/auth/login'), 3000);
      return;
    }

    // If response is OK, process the data
    const data = await res.json();
    console.log('Token verification response:', data);
  
    if (data?.user.name) {
      setUserName(data.user.name);
    }
  } catch (err) {
    console.error('Error during token verification:', err);
    console.error('Error while setting password:', err);
    setError('Failed to connect to server.');
    setExpiredSession(true);
    setTimeout(() => router.push('/auth/login'), 3000);
  }
};



    verifyToken();
  }, [searchParams, router]);

  const isPasswordValid = (pwd) => {
    const pattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return pattern.test(pwd);
  };

    const handleModalClose = () => {
    console.log('Modal closed');
    setShowModal(false); 
    router.push('/auth/login'); 
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

  console.log('Submitting with token:', token);
  console.log('Type:', type);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const endpoint =
    type === 'register'
      ? `${baseUrl}/api/password`
      : `${baseUrl}/api/resetpassword`;

      console.log('Endpoint submit:', endpoint);
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();
    console.log('Password update response:', data);

    if (res.ok) {
      console.log('Password set successfully:', data);
          setShowModal(true);
    }

          console.error(`Error verifying token at ${endpoint}`);
            console.error('Failed to set password:', data);
          setError(data.message || 'Something went wrong.');
          setExpiredSession(true); 
          setTimeout(() => router.push('/auth/login'), 3000);
      return;
  } catch (err) {
        console.error('Error during token verification:', err);
         console.error('Error while setting password:', err);
        setError('Failed to connect to server.');
        setExpiredSession(true);
        setTimeout(() => router.push('/auth/login'), 3000); 
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h2 className="text-3xl font-semibold text-center text-gray-800">Set Your Password</h2>
        <p className="text-sm text-center text-gray-600">Hi {userName}, set your password here.</p>

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

      <h3 className="text-xl font-semibold">Password Updated</h3>
      <p className="text-sm mt-2">Dear {userName} your password is updated successfully continue to login </p>


      <div className="mt-4">
        <button
          onClick={handleModalClose}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md text-sm font-medium transition"
        >
          continue
        </button>
      </div>
    </motion.div>
  </motion.div>
)}
{expiredSession && (
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
      <div className="mb-4">
        <svg className="w-12 h-12 mx-auto text-red-600" fill="none" stroke="currentColor" strokeWidth="2"
             viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </div>

      <h3 className="text-xl font-semibold text-red-700">Session Expired</h3>
      <p className="text-sm mt-2">Hello user , This session has expired. Please generate a new link.</p>
      <p className="text-xs text-gray-500 mt-1">Redirecting to login...</p>

      <div className="mt-4">
        <button
          onClick={() => router.push('/auth/login')}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md text-sm font-medium transition"
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
