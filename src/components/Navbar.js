'use client';

import Notifications from './Notifications';
import { useRouter } from 'next/navigation';
import { Menu, User, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navbar({ toggleSidebar }) {
  const router = useRouter();
  const pathname = usePathname();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isAdmin = pathname.startsWith('/admin');
  const userName = isAdmin ? "Admin" : "User";

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('selectedProducts');
    router.push('/auth/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuOpen]);

  return (
    <nav className="bg-white shadow-sm h-16 flex items-center justify-between px-4 relative z-30">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>
      </div>
      
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Show notifications only for admin */}
        {isAdmin && <Notifications isAdmin={isAdmin} />}
        
        <div className="relative" ref={dropdownRef}>
          <button 
            className="flex items-center space-x-1 md:space-x-2 p-2 rounded-md text-gray-700 hover:bg-gray-100"
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          >
            <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center">
              <User size={14} />
            </div>
            <span className="hidden sm:inline-block text-sm md:text-base">{userName}</span>
            <ChevronDown size={14} />
          </button>
          
          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}