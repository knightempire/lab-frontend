'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import './globals.css'; // Make sure to import global styles here

export default function RootLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <html lang="en">
      <body className="flex h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar toggleSidebar={toggleSidebar} />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
