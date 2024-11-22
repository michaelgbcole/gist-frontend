"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { FiMenu, FiX } from 'react-icons/fi';
import { Link } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter()
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm z-50 py-4">
    <div className="container mx-auto px-4">
      <nav className="flex items-center justify-between">
        <a href="/" className="flex-shrink-0">
          <img
            src="/logo.png"
            alt="Brand logo"
            className="w-48 h-auto"
          />
        </a>


        <div className="flex items-center space-x-4">
          <button
            className="px-4 py-2 text-sm font-medium bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
            onClick={() => router.push('login')}
          >
            Get Started
          </button>
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>
    </div>
  </header>
  );
}