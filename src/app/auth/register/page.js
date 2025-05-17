'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import TextField from '../../../components/auth/TextField';
import PrimaryButton from '../../../components/auth/PrimaryButton';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false); // State to control modal visibility

  const validateEmail = (email) =>
    /^[^\s@]+@(?:[a-zA-Z0-9-]+\.)*(amrita\.edu)$/.test(email);

  const validatePhone = (phone) =>
    /^\d{10}$/.test(phone);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Only University email addresses are allowed.');
      return;
    }

    if (!validatePhone(phone)) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    // Determine user type based on email domain
    let determinedUserType = email.includes('.students.amrita.edu') ? 'Student' : 'Faculty';

    // Log data to the console
    console.log('Registering user with the following details:');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Phone:', phone);
    console.log('User Type:', determinedUserType);


    setShowModal(true);
  };

  // Function to handle modal "OK" click
  const handleModalClose = () => {
    console.log('Modal closed');
    setShowModal(false); // Close the modal
    // router.push('/auth/login'); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h2 className="text-3xl font-semibold text-center mb-6">Create your account</h2>

        <form onSubmit={handleRegister} className="space-y-4">
          <TextField
            label="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your university email"
          />
          <TextField
            label="Phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10-digit number"
          />

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <PrimaryButton text="Sign up" className="w-full py-3 mt-2" />
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-indigo-500 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      {/* Modal for Email Verification */}


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
      <p className="text-sm mt-1 text-gray-600">Check your spam folder if you don't see it.</p>
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
