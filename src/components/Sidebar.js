'use client';

import Link from 'next/link';
import { Home, Box, FilePlus, Users, ClipboardCheck, User } from 'lucide-react';

export default function Sidebar({ isOpen }) {
  const navItems = [
    { name: 'Home', icon: <Home size={20} />, href: '/dashboard' },
    { name: 'Product', icon: <Box size={20} />, href: '/dashboard/product' },
    { name: 'Request', icon: <FilePlus size={20} />, href: '/dashboard/request' },
    { name: 'Users', icon: <Users size={20} />, href: '/dashboard/users' },
    { name: 'Issued', icon: <ClipboardCheck size={20} />, href: '/dashboard/issued' },
  ];

  return (
    <aside 
      className={`bg-white shadow-lg transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-0 md:w-16'} h-full overflow-hidden`}>
      <div className="flex flex-col h-full p-4">
        <div className="flex items-center mb-8 mt-2">
          {isOpen ? (
            <h2 className="text-xl font-bold text-blue-800">Dashboard</h2>
          ) : (
            <div className="w-full flex justify-center">
              <User size={24} className="text-gray-700" />
            </div>
          )}
        </div>
        
        <nav className="flex-grow">
          <ul>
            {navItems.map((item, index) => (
              <li key={index} className="mb-2">
                <Link 
                  href={item.href}
                  className="flex items-center p-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <span className="mr-3">{item.icon}</span>
                  {isOpen && <span>{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
