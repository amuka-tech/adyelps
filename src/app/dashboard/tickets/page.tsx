"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [meRes, ticketsRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/profile/tickets').catch(() => ({ ok: false, json: () => [] }))
        ]);

        if (meRes.ok) setUser((await meRes.json()).user);
        if (ticketsRes.ok) setTickets((await ticketsRes.json()).tickets || []);
      } catch (error) {
        console.error("Failed to fetch tickets", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="text-gray-500 font-medium">Loading tickets...</div>;
  if (!user) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">My Event Tickets</h2>
      
      {tickets.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No tickets found</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">You haven't purchased any tickets for upcoming events yet.</p>
          <Link href="/dashboard/events" className="bg-maroon text-white font-bold px-8 py-3 rounded-xl hover:bg-maroon-dark transition-colors inline-block">
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tickets.map(t => {
            const eventDate = new Date(t.event_date);
            return (
              <div key={t.id} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col sm:flex-row relative">
                {/* Cutout styling effect for ticket */}
                <div className="absolute top-1/2 -translate-y-1/2 -left-3 w-6 h-6 bg-[#f4f7f6] rounded-full border-r border-gray-100 z-10 hidden sm:block"></div>
                <div className="absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-6 bg-[#f4f7f6] rounded-full border-l border-gray-100 z-10 hidden sm:block"></div>
                
                <div className="p-6 bg-maroon text-white flex flex-col items-center justify-center min-w-[200px] border-b sm:border-b-0 sm:border-r border-white/20 border-dashed relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-10 -mt-10 blur-md"></div>
                  {t.is_checked_in ? (
                    <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm border border-white/30 text-center relative z-10">
                      <svg className="w-12 h-12 mx-auto text-green-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <span className="font-bold tracking-wider uppercase text-sm">Checked In</span>
                    </div>
                  ) : (
                    <div className="bg-white p-3 rounded-2xl shadow-inner relative z-10">
                      <QRCodeSVG value={t.qr_token} size={130} />
                    </div>
                  )}
                  <p className="text-xs text-white/70 mt-4 font-mono font-bold tracking-widest relative z-10">#{t.qr_token.split('-')[0].toUpperCase()}</p>
                </div>
                
                <div className="p-8 flex-1 bg-white relative">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 leading-tight mb-2">{t.title}</h3>
                      <span className="inline-block bg-pink text-maroon text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {t.tier_name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center text-sm">
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center mr-3 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      </div>
                      <span className="text-gray-700 font-medium">{eventDate.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center mr-3 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                      </div>
                      <span className="text-gray-700 font-medium">{t.location}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center mr-3 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                      </div>
                      <span className="text-gray-700 font-medium">{user.firstName} {user.lastName}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
