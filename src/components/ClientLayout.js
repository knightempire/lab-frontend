'use client';

import { useState } from 'react';
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
  '/user/product',
  '/user/request'
];

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const isAuthRoute = pathname.startsWith('/auth') || pathname.endsWith('/404');
  const isValidRoute = validPaths.includes(pathname);

  if (isAuthRoute || !isValidRoute) return children;

  return (
    <div className="flex h-full bg-gray-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex flex-col flex-1">
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
