'use client';

export default function PrimaryButton({ text, type = 'submit' }) {
    return (
      <button
        type={type}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md text-sm font-medium transition"
      >
        {text}
      </button>
    );
  }
  