'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';

const validPaths = [
  '/',
  '/admin/dashboard',
  '/admin/product',
  '/admin/request',
  '/admin/users',
  '/admin/issued',
  '/user/dashboard',
  '/user/product',
  '/user/request'
];

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On mobile, sidebar should be closed by default
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);
  
  const isAuthRoute = pathname.startsWith('/auth') || pathname.endsWith('/404');
  const isValidRoute = validPaths.includes(pathname);

  if (isAuthRoute || !isValidRoute) return children;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto sm:p-4 md:p-6 lg:p-2">{children}</main>
        <Footer />
      </div>
    </div>
  );
}