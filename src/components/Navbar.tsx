"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to fetch session", error);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };


  const publicNavItems = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'News', href: '/news' },
    { name: 'Events', href: '/events' },
    { name: 'Give Back', href: '/give-back' },
    { name: 'Shop', href: '/shop' },
    { name: 'Obituaries', href: '/obituaries' },
    { name: 'Contact Us', href: '/contact' },
  ];

  if (pathname && (pathname.startsWith('/superadmin') || pathname.startsWith('/dashboard'))) {
    return null;
  }

  return (
    <header className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center group">
          <div className="w-12 h-12 bg-maroon rounded-full flex items-center justify-center mr-3 shadow-lg group-hover:scale-105 transition-transform">
            <span className="text-white font-black text-xl tracking-tighter">A<span className="text-pink">P</span>S</span>
          </div>
          <div>
            <span className="font-black text-xl text-gray-900 tracking-tight block leading-tight">Adyel Primary<br/><span className="text-maroon text-sm">Alumni Network</span></span>
          </div>
        </Link>
        
        {/* DESKTOP NAV */}
        <nav className="hidden lg:flex items-center space-x-1">
          {publicNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all ${
                  isActive 
                    ? 'bg-maroon text-white shadow-md shadow-maroon/20' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* ACTIONS */}
        <div className="flex items-center space-x-4">
          {!loading && !user ? (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="text-gray-700 font-bold hover:text-maroon transition-colors text-sm px-4">Log in</Link>
              <Link href="/register" className="bg-maroon text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-maroon-dark transition-all shadow-md shadow-maroon/20 hover:shadow-lg hover:-translate-y-0.5">
                Join Network
              </Link>
            </div>
          ) : !loading && user ? (
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 bg-gray-50 pl-2 pr-4 py-1.5 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-maroon text-white flex items-center justify-center font-bold text-sm">
                  {user.firstName ? user.firstName[0] : 'U'}
                </div>
                <span className="text-sm font-bold text-gray-700 hidden sm:block">{user.firstName}</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-maroon" onClick={() => setIsDropdownOpen(false)}>Dashboard</Link>
                  
                  {user.role === 'SUPER_ADMIN' && (
                    <Link href="/superadmin" className="block px-4 py-2 text-sm text-yellow-700 font-bold bg-yellow-50 hover:bg-yellow-100 border-t border-yellow-100" onClick={() => setIsDropdownOpen(false)}>Super Admin Panel</Link>
                  )}
                  <div className="border-t border-gray-100 my-1"></div>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Sign out</button>
                </div>
              )}
            </div>
          ) : null}
          
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 right-0 bg-white border-b border-gray-100 shadow-xl p-4 flex flex-col space-y-2 z-50">
          {publicNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive 
                    ? 'bg-maroon text-white' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.name}
              </Link>
            )
          })}
          {!loading && !user && (
            <div className="pt-4 mt-2 border-t border-gray-100 flex flex-col gap-2">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center bg-gray-50 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-100">Log in</Link>
              <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center bg-maroon text-white font-bold py-3 rounded-xl hover:bg-maroon-dark">Join Network</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
