'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import './globals.css'; // Make sure to import global styles here

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // Check if current route is an auth route
  const isAuthRoute = pathname.startsWith('/auth');

  return (
    <html lang="en">
      <body className={isAuthRoute ? '' : 'flex h-screen bg-gray-50'}>
        {isAuthRoute ? (

          children
        ) : (

          <>
            <Sidebar isOpen={sidebarOpen} />
            <div className="flex flex-col flex-1 overflow-hidden">
              <Navbar toggleSidebar={toggleSidebar} />
              <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
          </>
        )}
      </body>
    </html>
  );
}
