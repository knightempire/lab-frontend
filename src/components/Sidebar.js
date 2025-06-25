'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Home, Box, FilePlus, Users, ClipboardCheck, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 370);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const adminnavItems = [
    { name: 'Home', icon: <Home size={20} />, href: '/admin/dashboard' },
    { name: 'Product', icon: <Box size={20} />, href: '/admin/product' },
    { name: 'Request', icon: <FilePlus size={20} />, href: '/admin/request' },
    { name: 'Users', icon: <Users size={20} />, href: '/admin/users' },
    { name: 'Issued', icon: <ClipboardCheck size={20} />, href: '/admin/issued' },
  ];
  
  const usernavItems = [
    { name: 'Home', icon: <Home size={20} />, href: '/user/dashboard' },
    { name: 'Product', icon: <Box size={20} />, href: '/user/product' },
    { name: 'Request', icon: <FilePlus size={20} />, href: '/user/request' },
  ];
  
  const navItems = pathname.startsWith('/admin') ? adminnavItems : usernavItems;

  const handleLinkClick = () => {
    // Close sidebar on mobile when a link is clicked
    if (isMobile) {
      onClose?.();
    }
  };

  // Responsive width based on screen size
  const getResponsiveWidth = () => {
    if (isMobile) return 'w-72 sm:w-80'; // Mobile: 288px, Small mobile: 320px
    return isOpen ? 'w-48 lg:w-52 xl:w-56' : 'w-16'; // Desktop: responsive expanded width
  };

  const sidebarStyles = isMobile
    ? `fixed inset-y-0 left-0 z-50 ${getResponsiveWidth()} bg-white shadow-2xl transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`
    : `relative bg-white shadow-lg transition-all duration-300 ease-in-out h-full ${getResponsiveWidth()}`;

  return (
    <>
      {/* Mobile backdrop with blur effect */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-white/20 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}
      
      <aside className={sidebarStyles}>
        <div className="flex flex-col h-full p-3 sm:p-4 lg:p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8 mt-1 sm:mt-2">
            <div className="flex items-center justify-center w-full">
              {(isMobile && isOpen) || (!isMobile && isOpen) ? (
                <Image 
                  src="/images/logo.png" 
                  alt="Amuda" 
                  width={140} 
                  height={46}
                  className="sm:w-40 sm:h-13 lg:w-44 lg:h-14"
                />
              ) : (
                <Image 
                  src="/images/icon.png" 
                  alt="Amuda" 
                  width={32} 
                  height={32}
                  className="sm:w-9 sm:h-9 lg:w-10 lg:h-10"
                />
              )}
            </div>
            
            {/* Close button - only visible on mobile when sidebar is open */}
            {isMobile && isOpen && (
              <button
                onClick={onClose}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
                aria-label="Close sidebar"
              >
                <X size={20} className="sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
          
          <nav className="flex-grow">
            <ul className="space-y-1 sm:space-y-2">
              {navItems.map((item, index) => (
                <li key={index}>
                  <Link 
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`flex items-center p-2.5 sm:p-3 lg:p-2.5 rounded-lg text-sm sm:text-base transition-all duration-200 group
                      ${pathname === item.href 
                        ? 'bg-sky-100 text-sky-900 shadow-sm' 
                        : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900 hover:shadow-sm'
                      } 
                      ${!isOpen && !isMobile ? 'justify-center' : ''}`}
                    title={!isOpen && !isMobile ? item.name : ''}
                  >
                    <span className={`flex-shrink-0 ${!isOpen && !isMobile ? '' : 'mr-3 sm:mr-4 lg:mr-3'}`}>
                      {item.icon}
                    </span>
                    {((isMobile && isOpen) || (!isMobile && isOpen)) && (
                      <span className="font-medium truncate">{item.name}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}