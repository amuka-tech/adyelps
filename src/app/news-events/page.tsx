import React from 'react';
import { Button } from '@/components/Button';
import { Card, CardContent } from '@/components/Card';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'News & Events | Adyel Alumni',
  description: 'Stay updated with the latest news, announcements, and upcoming events from the Adyel Alumni Association.',
};

export default function NewsEventsPage() {
  const events = [
    {
      title: "Adyel Family Day & Picnic 2026",
      date: "August 15, 2026",
      time: "10:00 AM - 5:00 PM",
      location: "Adyel Primary School Playground",
      desc: "A fun-filled day for alumni to bring their spouses and children. Enjoy games, barbecue, and networking in a relaxed atmosphere.",
      price: "UGX 20,000"
    },
    {
      title: "Annual Sports Gala",
      date: "October 10, 2026",
      time: "8:00 AM - 6:00 PM",
      location: "Lira Town Stadium",
      desc: "Inter-alumni football and netball matches. Re-live the old rivalries between the different school houses!",
      price: "Free for Spectators"
    },
    {
      title: "Annual General Meeting (AGM)",
      date: "December 5, 2026",
      time: "2:00 PM - 5:00 PM",
      location: "School Main Hall",
      desc: "The official yearly meeting for the alumni executive to report on the year's progress and elect new leaders.",
      price: "Free (Members Only)"
    }
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Page Header */}
      <section className="bg-pink py-20 text-maroon text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">News & Events</h1>
        <p className="text-xl max-w-2xl mx-auto px-4 font-medium">
          Stay informed about what's happening in our community.
        </p>
      </section>

      {/* Annual Events */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Upcoming Annual Events</h2>
            <div className="w-20 h-1 bg-maroon mx-auto rounded-full"></div>
          </div>

          <div className="space-y-8 max-w-5xl mx-auto">
            {events.map((event, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row hover:shadow-md transition-shadow">
                <div className="bg-skyblue/20 w-full md:w-1/3 flex flex-col items-center justify-center p-8 text-center border-b md:border-b-0 md:border-r border-gray-200">
                  <div className="text-maroon font-bold text-xl mb-2">{event.date.split(',')[0]}</div>
                  <div className="text-gray-600 text-sm">{event.date.split(',')[1]}</div>
                  <div className="mt-4 text-darkblue text-sm font-semibold">{event.time}</div>
                </div>
                <div className="p-8 w-full md:w-2/3 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-gray-500 mb-4 flex items-center text-sm">
                      <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      {event.location}
                    </p>
                    <p className="text-gray-700 mb-6">{event.desc}</p>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-bold text-maroon">{event.price}</span>
                    <Button size="sm">RSVP / Buy Ticket</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Latest News</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* News Item 1 */}
            <Card className="flex flex-col">
              <div className="h-48 bg-gray-300"></div>
              <CardContent className="flex-1">
                <p className="text-sm text-pink font-semibold mb-2">School Development</p>
                <h3 className="text-xl font-bold text-gray-900 mb-3">New Computer Lab Commissioned</h3>
                <p className="text-gray-600 text-sm mb-4">Thanks to the generous contributions from the alumni, the new state-of-the-art computer lab was officially opened yesterday.</p>
                <Link href={`/news-events`} className="text-maroon font-semibold hover:underline text-sm block mt-2">Read Full Story</Link>
              </CardContent>
            </Card>

            {/* News Item 2 */}
            <Card className="flex flex-col">
              <div className="h-48 bg-gray-300"></div>
              <CardContent className="flex-1">
                <p className="text-sm text-pink font-semibold mb-2">Alumni Updates</p>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Election Results 2025</h3>
                <p className="text-gray-600 text-sm mb-4">Meet the newly elected Executive Committee who will steer the association for the next two years.</p>
                <Link href={`/news-events`} className="text-maroon font-semibold hover:underline text-sm block mt-2">Read Full Story</Link>
              </CardContent>
            </Card>

            {/* News Item 3 */}
            <Card className="flex flex-col">
              <div className="h-48 bg-gray-300"></div>
              <CardContent className="flex-1">
                <p className="text-sm text-pink font-semibold mb-2">Academics</p>
                <h3 className="text-xl font-bold text-gray-900 mb-3">PLE Performance Review</h3>
                <p className="text-gray-600 text-sm mb-4">The school registered an impressive 95% first-grade passing rate in the recent Primary Leaving Examinations.</p>
                <Link href={`/news-events`} className="text-maroon font-semibold hover:underline text-sm block mt-2">Read Full Story</Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
