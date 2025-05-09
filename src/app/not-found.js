'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowLeft, Home } from 'lucide-react';

const Custom404 = () => {
  const router = useRouter();
  
  // Handle navigation
  const navigateHome = () => router.push('/');
  const navigateBack = () => router.back();
  
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-100 to-slate-200 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
        <div className="absolute top-20 right-20 w-60 h-60 bg-blue-50 rounded-full opacity-40 blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-indigo-50 rounded-full opacity-40 blur-xl"></div>
       
        <div className="relative mb-1 mt-4">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-700">404</h1>
        </div>

        <h2 className="text-3xl font-semibold text-gray-800 mt-6">Page Not Found</h2>
        <p className="text-gray-600 mt-4 max-w-md mx-auto text-lg">
          We couldn&apos;t find the page you&apos;re looking for. It might have been moved, deleted, or never existed.
        </p>
        
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={navigateBack}
            className="px-8 py-3 flex items-center justify-center gap-2 border border-gray-200 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Go back to previous page"
          >
            <ArrowLeft size={20} />
            <span>Go Back</span>
          </button>
          
          <button
            onClick={navigateHome}
            className="px-8 py-3 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Return to homepage"
          >
            <Home size={20} />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
      
      <div className="py-6 text-center border-t border-gray-200">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Amuda. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Custom404;