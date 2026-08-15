"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Card, CardContent } from '@/components/Card';
import { createClient } from '@/utils/supabase/client';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [newsEvents, setNewsEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const stats = [
    { label: "Years Since Founding", value: "40+" },
    { label: "Registered Alumni", value: "2,500+" },
    { label: "Projects Completed", value: "15" }
  ];

  const defaultItems = [
    { type: "Event", title: "Annual Family Picnic 2026", created_at: "2026-08-15T00:00:00.000Z", desc: "Join us for a fun-filled day with family and old friends at the school playground.", id: "1" },
    { type: "News", title: "New Computer Lab Commissioned", created_at: "2026-05-20T00:00:00.000Z", desc: "Thanks to alumni contributions, a new state-of-the-art lab is now open.", id: "1" },
    { type: "Event", title: "AGM & Elections 2026", created_at: "2026-12-05T00:00:00.000Z", desc: "Annual General Meeting to elect the new Executive Committee.", id: "2" }
  ];

  useEffect(() => {
    async function checkAuthAndFetchData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);

        const { data: newsData } = await supabase
          .from('news_articles')
          .select('id, title, created_at, content, image_url')
          .eq('status', 'PUBLISHED')
          .order('created_at', { ascending: false })
          .limit(2);

        const latestNews = newsData ? newsData.map(item => ({
          id: item.id,
          title: item.title,
          created_at: item.created_at,
          type: 'News',
          desc: item.content ? item.content.substring(0, 150) : '',
          image_url: item.image_url
        })) : [];

        const { data: eventsData } = await supabase
          .from('events')
          .select('id, title, event_date, description, image_url')
          .gte('event_date', new Date().toISOString())
          .order('event_date', { ascending: true })
          .limit(1);

        const upcomingEvents = eventsData ? eventsData.map(item => ({
          id: item.id,
          title: item.title,
          created_at: item.event_date,
          type: 'Event',
          desc: item.description,
          image_url: item.image_url
        })) : [];

        const combined = [...upcomingEvents, ...latestNews].slice(0, 3);
        setNewsEvents(combined.length > 0 ? combined : defaultItems);
      } catch (error) {
        console.error('Error fetching data:', error);
        setNewsEvents(defaultItems);
      } finally {
        setLoading(false);
      }
    }

    checkAuthAndFetchData();
  }, []);

  const displayItems = newsEvents.length > 0 ? newsEvents : defaultItems;

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden">
        {/* We use an absolute div for the background to apply an overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-maroon/70 mix-blend-multiply z-10"></div>
          <Image 
            src="/hero-bg.png" 
            alt="LTC Alumni Gathering"
            fill
            className="object-cover object-center"
            priority
          />
        </div>
        
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 text-sm font-semibold tracking-wider mb-6 animate-fade-in-up">
            WELCOME HOME
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-2 drop-shadow-lg tracking-tight">
            Adyel
          </h1>
          <p className="text-xl md:text-3xl font-medium text-pink mb-10 drop-shadow-md">
            Aged to Perfection since 2016
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
            {isLoggedIn ? (
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/membership" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                  Join the Alumni Network
                </Button>
              </Link>
            )}
            <Link href="/give-back" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-maroon backdrop-blur-sm shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                Donate to our Causes
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Decorative wave or shape divider at the bottom could go here */}
        <div className="absolute bottom-0 w-full h-16 bg-gradient-to-t from-white to-transparent z-20"></div>
      </section>

      {/* Quick Stats Section */}
      <section className="py-16 bg-white relative z-30 -mt-8 rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] mx-4 md:mx-10 lg:mx-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center p-6 rounded-2xl bg-gray-50 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl md:text-5xl font-extrabold text-maroon mb-2">{stat.value}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News & Upcoming Events */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Latest Updates</h2>
            <p className="text-lg text-gray-600">Stay informed about what's happening in our community and school.</p>
            <div className="w-20 h-1 bg-pink mx-auto mt-6 rounded-full"></div>
          </div>
          
          {loading ? (
             <div className="flex justify-center items-center h-48">
               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-maroon"></div>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {displayItems.map((item, idx) => (
                <Card key={idx} className="h-full flex flex-col group overflow-hidden border-gray-100 shadow-sm hover:shadow-lg transition-all">
                  <div className="h-48 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9ImN1cnJlbnRDb2xvciIvPjwvc3ZnPg==')]"></div>
                    )}
                    <div className={`absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full shadow-sm ${item.type === 'News' ? 'bg-white text-maroon' : 'bg-maroon text-white'}`}>
                      {item.type}
                    </div>
                  </div>
                  <CardContent className="flex-1 flex flex-col p-6">
                    <div className="text-xs text-gray-500 mb-2 font-medium">{new Date(item.created_at).toLocaleDateString()}</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-maroon transition-colors line-clamp-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm mb-6 flex-1 line-clamp-3">{item.desc}</p>
                    <Link href={`/news-events`} className="text-maroon font-bold text-sm flex items-center hover:text-pink transition-colors w-fit mt-auto">
                      View Details 
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12 flex justify-center gap-4">
            <Link href="/news-events">
              <Button variant="outline" size="lg" className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                View All News & Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Explore Platform Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Explore Our Platform</h2>
            <p className="text-lg text-gray-600">Discover all the features we've built for the LTC Adyel community.</p>
            <div className="w-20 h-1 bg-maroon mx-auto mt-6 rounded-full"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Link href="/dashboard/archive" className="group">
              <div className="bg-gray-50 border border-gray-100 p-8 rounded-2xl text-center hover:bg-maroon hover:text-white transition-all shadow-sm hover:shadow-xl h-full flex flex-col justify-center items-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📸</div>
                <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-white">Digital Archive</h3>
                <p className="text-sm text-gray-500 group-hover:text-pink">Relive the memories</p>
              </div>
            </Link>
            <Link href="/dashboard/welfare" className="group">
              <div className="bg-gray-50 border border-gray-100 p-8 rounded-2xl text-center hover:bg-maroon hover:text-white transition-all shadow-sm hover:shadow-xl h-full flex flex-col justify-center items-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🤝</div>
                <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-white">Welfare</h3>
                <p className="text-sm text-gray-500 group-hover:text-pink">Support our own</p>
              </div>
            </Link>
            <Link href="/dashboard/governance" className="group">
              <div className="bg-gray-50 border border-gray-100 p-8 rounded-2xl text-center hover:bg-maroon hover:text-white transition-all shadow-sm hover:shadow-xl h-full flex flex-col justify-center items-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🏛️</div>
                <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-white">Governance</h3>
                <p className="text-sm text-gray-500 group-hover:text-pink">Elections & Audits</p>
              </div>
            </Link>
            <Link href="/news-events" className="group">
              <div className="bg-gray-50 border border-gray-100 p-8 rounded-2xl text-center hover:bg-maroon hover:text-white transition-all shadow-sm hover:shadow-xl h-full flex flex-col justify-center items-center">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📰</div>
                <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-white">News & Events</h3>
                <p className="text-sm text-gray-500 group-hover:text-pink">Stay updated</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Member Benefits Section */}
      <section className="py-20 bg-darkblue text-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-skyblue font-bold tracking-wider text-sm uppercase mb-2 block">Why Join Us?</span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Unlock Exclusive Member Benefits</h2>
            <p className="text-lg text-gray-300">
              Creating an account gives you access to powerful tools to advance your career, grow your business, and connect with fellow alumni on a deeper level.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            <Link href="/dashboard/mentorship" className="block">
              <Card className="bg-white/5 border-white/10 hover:border-skyblue/50 hover:-translate-y-2 transition-all duration-300 shadow-xl backdrop-blur-sm h-full">
                <CardContent className="p-8 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-skyblue to-blue-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg rotate-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">Exclusive Career Network</h3>
                  <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                    Access a private job board where alumni post openings from their companies. Request internal referrals directly from the posters to give your resume an edge.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/marketplace" className="block">
              <Card className="bg-white/5 border-white/10 hover:border-pink/50 hover:-translate-y-2 transition-all duration-300 shadow-xl backdrop-blur-sm relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 bg-pink text-white text-xs font-bold px-3 py-1 rounded-bl-lg">NEW</div>
                <CardContent className="p-8 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink to-red-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg -rotate-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">Business Marketplace</h3>
                  <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                    Promote your business to the entire alumni network. Discover verified member-owned businesses and unlock exclusive "LTC Discount" codes.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard" className="block">
              <Card className="bg-white/5 border-white/10 hover:border-maroon/50 hover:-translate-y-2 transition-all duration-300 shadow-xl backdrop-blur-sm h-full">
                <CardContent className="p-8 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-maroon to-red-900 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg rotate-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">Full Alumni Directory</h3>
                  <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                    Search for old classmates by graduation year or profession. Reconnect with lost friends and expand your professional network globally.
                  </p>
                </CardContent>
              </Card>
            </Link>

          </div>

          <div className="mt-12 text-center">
            {isLoggedIn ? (
              <p className="text-skyblue font-bold">You are logged in and have full access to these benefits!</p>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/membership">
                  <Button className="bg-skyblue hover:bg-blue-400 text-darkblue shadow-lg hover:shadow-xl font-bold">Register Now</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-darkblue font-bold">Log In</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Short About Teaser */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            <div className="w-full md:w-1/2">
              <div className="relative rounded-2xl overflow-hidden aspect-4/3 shadow-2xl">
                <div className="absolute inset-0 bg-maroon/10"></div>
                {/* Another image placeholder */}
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                  School History Image
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Shared Heritage</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Adyel shaped the lives of our Adyel. 
                Our alumni network was formed to unite us, celebrate our successes, 
                and give back to our alma mater and community.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pink/20 flex items-center justify-center mt-1 mr-3 text-maroon">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <span className="text-gray-700">Connecting Adyel members worldwide.</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-skyblue/20 flex items-center justify-center mt-1 mr-3 text-darkblue">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <span className="text-gray-700">Providing scholarships and mentoring to bright pupils.</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-maroon/10 flex items-center justify-center mt-1 mr-3 text-maroon">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <span className="text-gray-700">Funding critical infrastructure projects at the school.</span>
                </li>
              </ul>
              <Link href="/about">
                <Button>Learn About Our History</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
