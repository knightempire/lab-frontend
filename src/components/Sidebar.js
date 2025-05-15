'use client';

import Link from 'next/link';
import { Home, Box, FilePlus, Users, ClipboardCheck} from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Sidebar({ isOpen }) {
  const pathname = usePathname(); // Get the current pathname
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

  return (
    <aside 
      className={`bg-white shadow-lg transition-all duration-300 ease-in-out ${
        isOpen ? 'w-52' : 'w-0 md:w-16'} h-full overflow-hidden`}>
      <div className="flex flex-col h-full p-4">
        <div className="flex items-center mb-8 mt-2">
          {isOpen ? (
            <div>
              <img src="/images/logo.png" alt="Amuda" className="w-full h-auto max-w-xs" />
            </div>
          ) : (
            <div className="w-full flex justify-center">
                <img src="/images/icon.png" alt="Amuda" className="w-10 h-10 rounded-full flex justify-center items-center" />
              </div>
          )}
        </div>
        
        <nav className="flex-grow">
          <ul>
            {navItems.map((item, index) => (
              <li key={index} className="mb-2">
                <Link 
                  href={item.href}
                  className={`flex items-center p-2 rounded-lg 
                    ${pathname === item.href ? 'bg-sky-100 text-gray-900' : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'} 
                    transition-colors`}
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
