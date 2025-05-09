// src/app/not-found.js

import React from 'react';

const Custom404 = () => {

  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      <h1 className="text-6xl font-extrabold text-red-500">404</h1>
      <p className="text-2xl text-gray-600 mt-4">Oops! The page you're looking for doesn't exist.</p>
      <p className="mt-4">
        <a href="/" className="text-blue-500 hover:underline">Go back to homepage</a>
      </p>
    </div>
  );
};

export default Custom404;
