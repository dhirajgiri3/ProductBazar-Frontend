'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ProductProvider } from '../../Contexts/Product/ProductContext';

export default function UserProfileLayout({ children }) {
  useEffect(() => {
    // Animate profile container on mount
    gsap.fromTo(
      '.profile-container',
      { 
        opacity: 0, 
        y: 20,
        scale: 0.99
      },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        duration: 0.8,
        ease: 'power3.out'
      }
    );
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="profile-container mx-auto">
        <ProductProvider>
          {children}
        </ProductProvider>
      </div>
    </div>
  );
}