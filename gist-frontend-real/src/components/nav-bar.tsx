'use client';

import React, { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image'; // Import the Image component

const ResponsiveMenuBar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
    const toggleMenu = () => setIsOpen(!isOpen);
    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  
    const menuItems = [
        { name: 'Log In / Sign Up', path: '/login' },
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Contact', path: '/contact' },
      ];
  return (
    <nav className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <Image src="/gist.png" alt="Logo" width={50} height={50} /> {/* Make logo clickable */}
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {menuItems.map((item) => (
               <Link
               key={item.name}
               href={item.path}
               className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
             >
               {item.name}
             </Link>
                ))}
                <div className="relative">
                  <button
                    onClick={toggleDropdown}
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 flex items-center"
                  >
                    Admin <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                      <a href="/test" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Test</a>
                      <a href="/simulate" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Simulate</a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {menuItems.map((item) => (
                 <Link
                 key={item.name}
                 href={item.path}
                 className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700"
               >
                 {item.name}
               </Link>
            ))}
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700 flex items-center justify-between"
              >
                More <ChevronDown className="h-4 w-4" />
              </button>
              {isDropdownOpen && (
                <div className="bg-gray-700 rounded-md py-1 mt-1">
                  <a href="#" className="block px-4 py-2 text-sm hover:bg-gray-600">Dropdown Item 1</a>
                  <a href="#" className="block px-4 py-2 text-sm hover:bg-gray-600">Dropdown Item 2</a>
                  <a href="#" className="block px-4 py-2 text-sm hover:bg-gray-600">Dropdown Item 3</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default ResponsiveMenuBar;