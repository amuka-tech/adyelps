"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function EventDetailsPage() {
  const params = useParams();
  const eventId = params.id;
  
  const [event, setEvent] = useState<any>(null);
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const supabase = createClient();
        const { data: eventData } = await supabase.from('events').select('*, ticket_tiers(*)').eq('id', eventId).single();
        if (eventData) {
          setEvent(eventData);
          setTiers(eventData.ticket_tiers || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (eventId) fetchEvent();
  }, [eventId]);

  if (loading) return <div className="p-20 text-center text-gray-500">Loading event details...</div>;
  if (!event) return <div className="p-20 text-center text-red-500">Event not found.</div>;

  const eventDate = new Date(event.event_date);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <Link href="/dashboard/events" className="text-gray-500 hover:text-maroon text-sm font-bold flex items-center mb-4 transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Events
        </Link>
      </div>

      {/* Hero */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="h-48 md:h-64 bg-gray-100 relative">
          <div className="absolute inset-0 bg-maroon/5"></div>
          <div className="absolute top-6 left-6 flex items-center gap-2">
            <span className="bg-white text-maroon text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">{event.status}</span>
          </div>
        </div>
        <div className="p-8 md:p-10 relative">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{event.title}</h1>
          <p className="text-gray-500 font-medium">Organized by {event.organizer_first} {event.organizer_last}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        <div className="flex-1 space-y-8">
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">About This Event</h2>
            <div className="prose prose-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
              {event.description}
            </div>
          </div>
        </div>

        <div className="w-full md:w-96 flex-shrink-0 space-y-6">
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Date & Time</h3>
              <p className="text-gray-700 font-medium mb-8 flex items-start bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <svg className="w-5 h-5 mr-3 text-maroon flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <span>
                  {eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br/>
                  <span className="text-sm text-gray-500">{eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </span>
              </p>

              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Location</h3>
              <p className="text-gray-700 font-medium flex items-start bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <svg className="w-5 h-5 mr-3 text-maroon flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span>{event.location}</span>
              </p>
            </div>
          </div>

          <div className="bg-pink/20 rounded-[2rem] shadow-sm border-2 border-maroon/20 p-8 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-maroon/5 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Tickets</h3>
              <div className="space-y-4 mb-8">
                {tiers.map(t => (
                  <div key={t.id} className="flex justify-between items-center bg-white/50 p-3 rounded-xl border border-white">
                    <span className="font-bold text-gray-900 text-sm">{t.name}</span>
                    <span className="font-bold text-maroon">UGX {parseFloat(t.price).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              
              <Link href={`/dashboard/events/${event.id}/checkout`} className="block text-center">
                <button className="w-full bg-maroon text-white font-bold py-4 rounded-xl shadow-md shadow-maroon/20 hover:bg-maroon-dark transition-all">
                  Get Tickets / RSVP
                </button>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
