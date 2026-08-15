"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const supabase = createClient();
        const { data: events } = await supabase.from('events').select('*, ticket_tiers(*)').eq('status', 'UPCOMING').order('event_date');
        if (events) {
          setEvents(events);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Upcoming Events</h1>
        <p className="text-gray-500 text-sm">Reunite, celebrate, and network. Book your tickets for upcoming AGMs, Galas, and Picnics.</p>
      </div>

      <div className="flex-1">
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <p className="text-gray-500">There are no upcoming events at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {events.map(event => {
              const eventDate = new Date(event.event_date);
              const month = eventDate.toLocaleString('default', { month: 'short' });
              const day = eventDate.getDate();

              return (
                <div key={event.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-gray-100 group">
                  <div className="h-48 bg-gray-100 relative">
                    <div className="absolute inset-0 bg-maroon/5 group-hover:bg-maroon/10 transition-colors"></div>
                    {event.status === 'UPCOMING' && (
                      <div className="absolute top-4 right-4 bg-white text-maroon text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm tracking-wider uppercase">
                        Upcoming
                      </div>
                    )}
                  </div>
                  <div className="p-8 relative">
                    <div className="absolute -top-10 left-8 bg-white rounded-2xl shadow-md p-3 text-center min-w-[70px] border border-gray-100">
                      <span className="block text-xs font-bold text-red-500 uppercase tracking-widest">{month}</span>
                      <span className="block text-2xl font-extrabold text-gray-900 leading-none mt-1">{day}</span>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-maroon transition-colors">{event.title}</h3>
                      <p className="text-gray-500 text-sm mb-4 flex items-center font-medium">
                        <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        {event.location}
                      </p>
                      <p className="text-gray-600 line-clamp-2 mb-6 text-sm leading-relaxed">{event.description}</p>
                      
                      <Link href={`/dashboard/events/${event.id}`} className="block w-full text-center bg-white border border-gray-200 text-gray-700 hover:border-maroon hover:text-maroon font-bold text-sm px-6 py-3 rounded-xl transition-colors shadow-sm">
                        View Details & Tickets
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
