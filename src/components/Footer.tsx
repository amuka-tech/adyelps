"use client";
import React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();

  if (pathname && (pathname.startsWith('/superadmin') || pathname.startsWith('/dashboard'))) {
    return null;
  }

  return (
    <footer className="bg-maroon-dark text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-maroon font-bold text-xl">
                A
              </div>
              <span className="font-bold text-xl text-white">Adyel</span>
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Uniting the OBs & OGs of Adyel, preserving our shared heritage, and giving back to our alma mater.
            </p>
            <div className="flex space-x-4">
              {/* Social Media placeholders */}
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-pink hover:text-maroon transition-colors">
                <span className="sr-only">Facebook</span>
                f
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-pink hover:text-maroon transition-colors">
                <span className="sr-only">Twitter</span>
                X
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-pink hover:text-maroon transition-colors">
                <span className="sr-only">WhatsApp</span>
                W
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-6 text-pink">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/dashboard/directory" className="text-gray-300 hover:text-white transition-colors">Membership Directory</Link></li>
              <li><Link href="/news-events" className="text-gray-300 hover:text-white transition-colors">News & Events</Link></li>
              <li><Link href="/spotlight" className="text-gray-300 hover:text-white transition-colors">Alumni Spotlight</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-6 text-pink">Get Involved</h3>
            <ul className="space-y-3">
              <li><Link href="/give-back" className="text-gray-300 hover:text-white transition-colors">Make a Donation</Link></li>
              <li><Link href="/give-back" className="text-gray-300 hover:text-white transition-colors">Current Projects</Link></li>
              <li><Link href="/shop" className="text-gray-300 hover:text-white transition-colors">Alumni Shop</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-6 text-pink">Newsletter</h3>
            <p className="text-gray-300 text-sm mb-4">Subscribe to our newsletter for the latest updates and events.</p>
            <form className="flex">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-pink w-full"
              />
              <button 
                type="submit"
                className="bg-pink text-maroon font-medium px-4 py-2 rounded-r-lg hover:bg-white transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm text-center md:text-left mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Adyel OBs & OGs Alumni Network. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-gray-400">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
