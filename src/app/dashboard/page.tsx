"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { createClient } from '@/utils/supabase/client';
import ProfileProgress from '@/components/dashboard/ProfileProgress';

export default function OverviewPage() {
  const [user, setUser] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [showIdModal, setShowIdModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (userData) {
        setUser(userData);
      }

      const { data: ticketsData } = await supabase
        .from('event_registrations')
        .select('*, events(*)')
        .eq('user_id', session.user.id);
        
      if (ticketsData) {
        setTickets(ticketsData);
      }
    }
    fetchData();
  }, []);

  if (!user) return null;

  return (
    <div className="animate-in fade-in duration-500">
      <ProfileProgress user={user} />
      {/* MODALS */}
      {showIdModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-maroon p-6 text-center relative">
              <button onClick={() => setShowIdModal(false)} className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 rounded-full p-1 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              <div className="w-20 h-20 bg-white rounded-full mx-auto mb-3 shadow-inner flex items-center justify-center text-maroon font-black text-3xl">
                {user.first_name ? user.first_name[0] : 'A'}
              </div>
              <h3 className="text-white font-bold text-xl">{user.first_name} {user.last_name}</h3>
              <p className="text-white/80 text-xs font-medium tracking-widest uppercase mt-1">Class of {user.class_year || 'N/A'}</p>
            </div>
            <div className="p-8 flex flex-col items-center bg-gray-50">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4">
                <QRCodeSVG value={`adyel-alumni:${user.email}`} size={160} fgColor="#111827" />
              </div>
              <div className="w-full space-y-2 text-center">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Member ID</p>
                <p className="font-mono text-gray-900 font-bold bg-gray-200 py-1.5 px-4 rounded-lg inline-block">ADYL-{user.id ? user.id.toString().substring(0, 8).toUpperCase() : '00000000'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUpgradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl p-8 relative animate-in slide-in-from-bottom-8 duration-300">
            <button onClick={() => setShowUpgradeModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 bg-gray-100 rounded-full p-1 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <div className="w-12 h-12 bg-pink/30 text-maroon rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Upgrade Membership Tier</h3>
            <p className="text-gray-500 text-sm mb-6">Premium membership tiers are currently being developed. Soon you will be able to upgrade to Silver, Gold, or Platinum to unlock exclusive network perks, priority ticketing, and premium directory access.</p>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center gap-3">
               <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               <span className="text-sm font-medium text-gray-600">We will notify you when tiers become available.</span>
            </div>
            <button onClick={() => setShowUpgradeModal(false)} className="w-full mt-6 bg-maroon text-white font-bold py-3 rounded-xl shadow-md hover:bg-maroon-dark transition-colors">Got it</button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-6 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Welcome back, {user.first_name}!</h1>
          <p className="text-gray-500 text-sm">Here is what's happening in your alumni network today.</p>
        </div>
        <Link href="/dashboard/events" className="bg-maroon text-white font-medium text-sm px-6 py-2.5 rounded-full shadow-md shadow-maroon/20 hover:bg-maroon-dark transition-all flex items-center gap-2">
          Browse Events
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-maroon text-white p-6 rounded-3xl shadow-lg shadow-maroon/20 relative overflow-hidden md:col-span-2 flex flex-col justify-between">
          <div className="absolute -right-6 -top-6 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
          <div>
            <span className="bg-white/20 px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider mb-4 inline-block">Active Membership</span>
            <h2 className="text-3xl font-bold mb-2">Ordinary Member</h2>
            <p className="text-white/80 text-sm max-w-sm mb-6">Your membership is currently active and in good standing. Thank you for supporting Adyel!</p>
          </div>
          <div className="flex gap-3 relative z-10">
            <button onClick={() => setShowIdModal(true)} className="bg-white text-maroon font-bold text-sm px-5 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition-colors">View ID Card</button>
            <button onClick={() => setShowUpgradeModal(true)} className="bg-white/10 border border-white/20 text-white font-bold text-sm px-5 py-2 rounded-xl hover:bg-white/20 transition-colors">Upgrade Tier</button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <p className="text-gray-500 text-sm font-medium mb-2">My Tickets</p>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{tickets.length}</h2>
          <Link href="/dashboard/tickets" className="flex items-center text-xs font-medium text-maroon hover:text-maroon-dark transition-colors">
            View Tickets &rarr;
          </Link>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Links</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link href="/dashboard/directory" className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md border border-gray-100 flex flex-col items-center text-center group transition-all">
          <div className="w-12 h-12 bg-gray-50 text-gray-700 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          </div>
          <span className="font-semibold text-gray-700 text-sm">Directory</span>
        </Link>
        <Link href="/dashboard/archive" className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md border border-gray-100 flex flex-col items-center text-center group transition-all">
          <div className="w-12 h-12 bg-pink/50 text-maroon rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
          <span className="font-semibold text-gray-700 text-sm">Archive</span>
        </Link>
        <Link href="/dashboard/give-back" className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md border border-gray-100 flex flex-col items-center text-center group transition-all">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <span className="font-semibold text-gray-700 text-sm">Donate</span>
        </Link>
        <Link href="/dashboard/settings" className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md border border-gray-100 flex flex-col items-center text-center group transition-all">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </div>
          <span className="font-semibold text-gray-700 text-sm">Settings</span>
        </Link>
      </div>
    </div>
  );
}
