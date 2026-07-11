"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';

export default function EventDetailsPage() {
  const params = useParams();
  const eventId = params.id;
  
  const [event, setEvent] = useState<any>(null);
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}`);
        if (res.ok) {
          const data = await res.json();
          setEvent(data.event);
          setTiers(data.tiers);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (eventId) fetchEvent();
  }, [eventId]);

  if (loading) return <div className="p-20 text-center">Loading event details...</div>;
  if (!event) return <div className="p-20 text-center text-red-500">Event not found.</div>;

  const eventDate = new Date(event.event_date);

  return (
    <div className="flex flex-col w-full bg-gray-50 min-h-[calc(100vh-80px)]">
      {/* Hero */}
      <div className="h-64 md:h-80 bg-darkblue relative flex items-end">
        <div className="absolute inset-0 bg-maroon/40"></div>
        <div className="container mx-auto px-4 relative z-10 pb-8">
          <Link href="/events">
            <span className="text-white/80 hover:text-white text-sm font-medium mb-4 inline-block">&larr; Back to Events</span>
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-pink text-maroon text-xs font-bold px-2 py-1 rounded uppercase">{event.status}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{event.title}</h1>
          <p className="text-white/90 font-medium">Organized by {event.organizer_first} {event.organizer_last}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-8">
          
          <div className="flex-1 space-y-8">
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
                <div className="prose text-gray-700 whitespace-pre-wrap">
                  {event.description}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="w-full md:w-96 flex-shrink-0 space-y-6">
            <Card className="border-t-4 border-t-maroon">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Date & Time</h3>
                <p className="text-gray-700 mb-6 flex items-start">
                  <svg className="w-5 h-5 mr-3 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  <span>
                    {eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br/>
                    {eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </p>

                <h3 className="text-lg font-bold text-gray-900 mb-4">Location</h3>
                <p className="text-gray-700 flex items-start">
                  <svg className="w-5 h-5 mr-3 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  <span>{event.location}</span>
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Tickets</h3>
                <div className="space-y-4 mb-6">
                  {tiers.map(t => (
                    <div key={t.id} className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <div>
                        <span className="font-bold text-gray-900">{t.name}</span>
                      </div>
                      <span className="font-medium text-maroon">UGX {parseFloat(t.price).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                
                <Link href={`/events/${event.id}/checkout`}>
                  <Button className="w-full text-lg py-6 shadow-xl hover:shadow-2xl">
                    Get Tickets / RSVP
                  </Button>
                </Link>
                <p className="text-xs text-center text-gray-500 mt-3">You will be required to log in.</p>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
