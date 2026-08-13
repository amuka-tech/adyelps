"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/public/events');
        if (res.ok) {
          const data = await res.json();
          setEvents(data.events);
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
    <div className="flex flex-col w-full bg-gray-50 min-h-[calc(100vh-80px)]">
      
      <section className="bg-darkblue py-16 text-center text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">LTC Alumni Events</h1>
          <p className="text-xl text-skyblue max-w-2xl mx-auto">
            Reunite, celebrate, and network. Book your tickets for upcoming AGMs, Galas, and Family Picnics.
          </p>
        </div>
      </section>

      <section className="py-12 flex-1 container mx-auto px-4 max-w-5xl">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500">There are no upcoming events at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {events.map(event => {
              const eventDate = new Date(event.event_date);
              const month = eventDate.toLocaleString('default', { month: 'short' });
              const day = eventDate.getDate();

              return (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="h-48 bg-gray-200 relative">
                    {/* Placeholder for event cover image */}
                    <div className="absolute inset-0 bg-maroon/20 group-hover:bg-maroon/10 transition-colors"></div>
                    {event.status === 'UPCOMING' && (
                      <div className="absolute top-4 right-4 bg-white text-maroon text-xs font-bold px-3 py-1 rounded-full shadow">
                        UPCOMING
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6 relative">
                    <div className="absolute -top-12 left-6 bg-white rounded-xl shadow-md p-3 text-center min-w-[70px] border border-gray-100">
                      <span className="block text-sm font-bold text-red-500 uppercase">{month}</span>
                      <span className="block text-2xl font-extrabold text-gray-900">{day}</span>
                    </div>

                    <div className="mt-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h3>
                      <p className="text-gray-500 text-sm mb-4 flex items-center">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        {event.location}
                      </p>
                      <p className="text-gray-600 line-clamp-2 mb-6">{event.description}</p>
                      
                      <Link href={`/events/${event.id}`}>
                        <Button className="w-full bg-darkblue hover:bg-blue-900 text-white">View Details & Tickets</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
