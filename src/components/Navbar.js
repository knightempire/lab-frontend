'use client';

import { Menu, Bell, User, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Navbar({ toggleSidebar }) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm h-16 flex items-center justify-between px-4">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <span className="font-medium text-blue-800 ml-4">Dashboard</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-md text-gray-700 hover:bg-gray-100 relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2"></span>
        </button>
        
        <div className="relative">
          <button 
            className="flex items-center space-x-2 p-2 rounded-md text-gray-700 hover:bg-gray-100"
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          >
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User size={16} />
            </div>
            <span className="hidden md:inline-block">User</span>
            <ChevronDown size={16} />
          </button>
          
          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <a href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                Your Profile
              </a>
              <a href="/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                Settings
              </a>
              <a href="/logout" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                Sign out
              </a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}