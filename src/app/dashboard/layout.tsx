"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { showToast } from '@/lib/toast';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchUser() {
      try {
        const { createClient } = await import('@/utils/supabase/client');
        const supabase = createClient();
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!session || sessionError) {
          window.location.href = '/login';
          return;
        }

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userError || !userData) {
          window.location.href = '/login';
          return;
        }

        setUser(userData);
      } catch (error) {
        console.error("Failed to load user", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  const [isMoreOpen, setIsMoreOpen] = useState(false);

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#f4f7f6] text-gray-500 font-medium">Loading Lounge...</div>;
  if (!user) return null;

  const NavItem = ({ href, label, icon, badge }: { href: string, label: string, icon: React.ReactNode, badge?: number }) => {
    const isActive = pathname === href;
    return (
      <Link 
        href={href}
        onClick={() => setIsMoreOpen(false)}
        className={`w-full flex items-center justify-between px-4 py-3 mb-1.5 rounded-2xl transition-all duration-300 font-medium text-sm group ${isActive ? 'bg-maroon text-white shadow-md shadow-maroon/20 translate-x-1' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1'}`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-white group-hover:shadow-sm'}`}>
            {icon}
          </div>
          {label}
        </div>
        {badge !== undefined ? <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-white text-maroon' : 'bg-pink text-maroon'}`}>{badge}</span> : null}
      </Link>
    );
  };

  const handleLogout = async () => {
    try {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <div className="h-screen w-full flex bg-[#f4f7f6] text-gray-800 font-sans overflow-hidden relative">
      
      {/* SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 h-[calc(100vh-2rem)] bg-white m-4 rounded-[2rem] shadow-sm overflow-y-auto hide-scrollbar border border-gray-100 flex-shrink-0">
        <div className="p-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-maroon rounded-full flex items-center justify-center text-white font-bold text-xl">
              {user.firstName ? user.firstName[0] : 'A'}
            </div>
            <span className="font-bold text-xl text-gray-900">Members</span>
          </div>
        </div>

        <div className="px-4 flex-1">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-4 mt-2">Lounge</div>
          <NavItem href="/dashboard" label="Overview" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>} />
          <NavItem href="/dashboard/tickets" label="My Tickets" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>} />
          
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-4 mt-6">Community</div>
          <NavItem href="/dashboard/messages" label="Messages" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>} />
          <NavItem href="/dashboard/directory" label="Alumni Directory" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>} />
          <NavItem href="/dashboard/welfare" label="Welfare Ledger" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>} />
          <NavItem href="/dashboard/careers" label="Career Hub" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>} />
          <NavItem href="/dashboard/mentorship" label="Mentorship Hub" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>} />
          <NavItem href="/dashboard/governance" label="Governance" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>} />

          <div className="text-xs font-bold text-maroon uppercase tracking-wider mb-3 px-4 mt-6">School Spirit</div>
          <NavItem href="/dashboard/archive" label="Nostalgia Archive" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>} />
          <NavItem href="/dashboard/marketplace" label="Marketplace" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>} />
          <NavItem href="/dashboard/shop" label="Adyel Shop" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>} />

          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-4 mt-6">Personal</div>
          <NavItem href="/dashboard/settings" label="Settings" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>} />
          
          {(user.role === 'SUPER_ADMIN' || user.assignedRoles?.includes('Super Admin')) && (
            <>
              <div className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3 px-4 mt-6">Administration</div>
              <NavItem href="/superadmin" label="Super Admin Panel" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>} />
            </>
          )}
          {(user.role === 'ADMIN' || user.role === 'TREASURER' || user.assignedRoles?.some((r: string) => r.includes('Admin') || r.includes('Manager') || r.includes('PRO'))) && user.role !== 'SUPER_ADMIN' && !user.assignedRoles?.includes('Super Admin') && (
            <>
              <div className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3 px-4 mt-6">Administration</div>
              <NavItem href="/dashboard/admin" label="Admin Portal" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>} />
            </>
          )}
        </div>

        <div className="p-4 mt-auto">
          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 text-center">
            <h4 className="font-bold text-gray-900 text-sm mb-1">Need Help?</h4>
            <p className="text-xs text-gray-500 mb-4">Contact the PRO for assistance.</p>
            <button onClick={handleLogout} className="w-full inline-block bg-white border border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-200 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors mb-2">Sign Out</button>
            <Link href="/" className="w-full inline-block bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors">Exit to Public Site</Link>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 h-screen overflow-y-auto hide-scrollbar p-4 lg:p-8 pb-20 lg:pb-0 relative">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-6 lg:mb-10 sticky top-0 bg-[#f4f7f6]/80 backdrop-blur-xl z-30 py-4 -mx-4 px-4 lg:-mx-8 lg:px-8 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
          <div className="flex-1 flex justify-start">
            {pathname === '/dashboard' && (
              <h1 className="text-lg sm:text-2xl font-extrabold text-gray-900 tracking-tight hidden md:block">
                Welcome back, {user.firstName}! 👋
              </h1>
            )}
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="hidden lg:block relative w-72">
              <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input type="text" placeholder="Search portal..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white/60 focus:bg-white border border-gray-200 rounded-full py-2.5 pl-11 pr-4 shadow-sm text-sm focus:ring-2 focus:ring-maroon/20 outline-none transition-all hover:border-gray-300" />
            </div>
            <button onClick={() => showToast("You have 0 new notifications.", "info")} className="relative bg-white p-2.5 rounded-full shadow-sm text-gray-500 hover:text-maroon transition-colors border border-gray-100 hover:bg-gray-50 hidden sm:block">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-pink border-2 border-white rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 bg-white pl-1.5 pr-4 py-1.5 rounded-full shadow-sm cursor-pointer border border-gray-100 hover:border-maroon/30 transition-all group">
              <div className="w-8 h-8 rounded-full bg-maroon text-white flex items-center justify-center font-bold text-sm shadow-inner group-hover:scale-105 transition-transform">
                {user.firstName ? user.firstName[0] : 'U'}
              </div>
              <div className="flex flex-col hidden sm:flex">
                <span className="text-sm font-bold text-gray-800 leading-none group-hover:text-maroon transition-colors">{user.firstName} {user.lastName}</span>
                <span className="text-[10px] text-gray-400 font-medium">Class of {user.classYear || 'N/A'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* INJECTED PAGE CONTENT */}
        {children}

      </main>

      {/* MORE DRAWER */}
      {isMoreOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
          {/* dark overlay */}
          <div className="flex-1 bg-black/40" onClick={() => setIsMoreOpen(false)} />
          {/* sheet */}
          <div className="bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>
            <div className="px-4 pb-8">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 mt-4">Lounge</div>
              <NavItem href="/dashboard" label="Overview" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>} />
              <NavItem href="/dashboard/tickets" label="My Tickets" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>} />
              
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 mt-6">Community</div>
              <NavItem href="/dashboard/messages" label="Messages" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>} />
              <NavItem href="/dashboard/directory" label="Alumni Directory" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>} />
              <NavItem href="/dashboard/welfare" label="Welfare Ledger" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>} />
              <NavItem href="/dashboard/careers" label="Career Hub" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>} />
              <NavItem href="/dashboard/mentorship" label="Mentorship Hub" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>} />
              <NavItem href="/dashboard/governance" label="Governance" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>} />

              <div className="text-xs font-bold text-maroon uppercase tracking-wider mb-3 mt-6">School Spirit</div>
              <NavItem href="/dashboard/archive" label="Nostalgia Archive" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>} />
              <NavItem href="/dashboard/marketplace" label="Marketplace" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>} />
              <NavItem href="/dashboard/shop" label="Adyel Shop" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>} />

              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 mt-6">Personal</div>
              <NavItem href="/dashboard/settings" label="Settings" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>} />
              
              {(user.role === 'SUPER_ADMIN' || user.assignedRoles?.includes('Super Admin')) && (
                <>
                  <div className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3 mt-6">Administration</div>
                  <NavItem href="/superadmin" label="Super Admin Panel" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>} />
                </>
              )}
              {(user.role === 'ADMIN' || user.role === 'TREASURER' || user.assignedRoles?.some((r: string) => r.includes('Admin') || r.includes('Manager') || r.includes('PRO'))) && user.role !== 'SUPER_ADMIN' && !user.assignedRoles?.includes('Super Admin') && (
                <>
                  <div className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3 mt-6">Administration</div>
                  <NavItem href="/dashboard/admin" label="Admin Portal" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>} />
                </>
              )}

              <button onClick={handleLogout} className="w-full mt-6 inline-block bg-white border border-gray-200 text-red-600 hover:bg-red-50 py-3 rounded-xl text-sm font-bold shadow-sm transition-colors">Sign Out</button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAV */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex items-center justify-around px-2 py-2">
        <Link href="/dashboard" onClick={() => setIsMoreOpen(false)} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${pathname === '/dashboard' ? 'text-maroon' : 'text-gray-400'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          <span className="text-[10px] font-semibold">Home</span>
        </Link>
        <Link href="/dashboard/messages" onClick={() => setIsMoreOpen(false)} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${pathname.includes('/dashboard/messages') ? 'text-maroon' : 'text-gray-400'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
          <span className="text-[10px] font-semibold">Community</span>
        </Link>
        <Link href="/dashboard/welfare" onClick={() => setIsMoreOpen(false)} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${pathname.includes('/dashboard/welfare') ? 'text-maroon' : 'text-gray-400'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
          <span className="text-[10px] font-semibold">Welfare</span>
        </Link>
        <Link href="/dashboard/careers" onClick={() => setIsMoreOpen(false)} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${pathname.includes('/dashboard/careers') ? 'text-maroon' : 'text-gray-400'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          <span className="text-[10px] font-semibold">Careers</span>
        </Link>
        <button onClick={() => setIsMoreOpen(true)} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${isMoreOpen ? 'text-maroon' : 'text-gray-400'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          <span className="text-[10px] font-semibold">More</span>
        </button>
      </nav>
    </div>
  );
}
