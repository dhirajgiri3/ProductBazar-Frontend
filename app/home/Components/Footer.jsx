"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Twitter, GitHub, Linkedin, Mail, Heart } from 'lucide-react';

const footerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      delay: 0.5,
      duration: 0.6
    }
  }
};

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <motion.footer 
      className="mt-20 border-t border-gray-200 pt-10 pb-8"
      variants={footerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold mb-4 text-gray-900">Product Bazar</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-violet-600 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-violet-600 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-600 hover:text-violet-600 transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4 text-gray-900">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-violet-600 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-600 hover:text-violet-600 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="text-gray-600 hover:text-violet-600 transition-colors">
                  Guidelines
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4 text-gray-900">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-violet-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-violet-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-600 hover:text-violet-600 transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4 text-gray-900">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-violet-600 transition-colors">
                <Twitter className="w-5 h-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-gray-500 hover:text-violet-600 transition-colors">
                <GitHub className="w-5 h-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a href="#" className="text-gray-500 hover:text-violet-600 transition-colors">
                <Linkedin className="w-5 h-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a href="#" className="text-gray-500 hover:text-violet-600 transition-colors">
                <Mail className="w-5 h-5" />
                <span className="sr-only">Email</span>
              </a>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Subscribe to our newsletter
              </p>
              <div className="mt-2 flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-3 py-2 text-sm border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 w-full"
                />
                <button className="bg-violet-600 text-white px-4 py-2 rounded-r-md text-sm hover:bg-violet-700 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-center text-gray-500 text-sm">
            © {currentYear} Product Bazar. All rights reserved.
          </p>
          <p className="text-center text-gray-500 text-sm mt-2 md:mt-0 flex items-center">
            Made with <Heart className="mx-1 w-4 h-4 text-red-500" /> for makers & creators
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;