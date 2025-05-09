'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import './globals.css';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // Check if current route is an auth route
  const isAuthRoute = pathname.startsWith('/auth') || pathname.endsWith('/404');
  
  return (
    <html lang="en" className="h-full">
      <body className={isAuthRoute ? '' : 'flex h-full bg-gray-50 overflow-hidden'}>
        {isAuthRoute ? (
          children
        ) : (
          <>
            <Sidebar isOpen={sidebarOpen} />
            <div className="flex flex-col flex-1">
              <Navbar toggleSidebar={toggleSidebar} />
              <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
          </>
        )}
      </body>
    </html>
  );
}