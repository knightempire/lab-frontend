'use client';

import { useEffect } from 'react';

export default function SuccessAlert({
  message = "Done successfully :)",
  description = "",
  onClose,
  duration = 3000, // Auto-dismiss after 3 seconds
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className="fixed bottom-4 right-4 z-50"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex flex-col gap-2 w-72 text-sm">
        <div className="success-alert flex items-center justify-between bg-[#232531] text-white px-4 py-3 rounded-xl shadow-lg transition-all">
          <div className="flex items-start gap-3">
            <div className="text-[#2b9875] bg-white/5 backdrop-blur-xl p-1.5 rounded-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <div className="flex flex-col">
              <p className="font-semibold leading-tight">{message}</p>
              {description && (
                <p className="text-gray-400 text-xs mt-0.5 leading-snug">
                  {description}
                </p>
              )}
            </div>
          </div>
          <button
            className="text-gray-400 hover:text-white p-1 transition"
            onClick={onClose}
            aria-label="Close alert"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
