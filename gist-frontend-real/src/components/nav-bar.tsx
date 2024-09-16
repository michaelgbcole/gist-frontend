"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { FiMenu, FiX } from 'react-icons/fi';
import { Link } from 'lucide-react';

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="container mx-auto px-4 py-6">
      <div>
        <nav className="flex justify-between items-center p-4">
          <a href='/'>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold text-blue-400"
          >
            Gist
          </motion.div>
          </a>

          <div className="flex justify-center w-full md:w-auto">
            <motion.ul
              className={`fle x flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 ${isMenuOpen ? 'flex' : 'hidden'} md:flex`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <li><a href="/login" className="text-gray-300 hover:text-blue-400">Log In</a></li>
              <li><a href="/dashboard" className="text-gray-300 hover:text-blue-400">Dashboard</a></li>
              <li>
                <Link
                  to="testimonials"
                  className="text-gray-300 hover:text-blue-400 cursor-pointer"
                >
                  Testimonials
                </Link>
              </li>
            </motion.ul>
          </div>

          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-gray-300 hover:text-blue-400">
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}