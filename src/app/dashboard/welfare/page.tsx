"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function WelfareHubPage() {
  const [obituaries, setObituaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchObituaries() {
      try {
        const res = await fetch('/api/welfare/obituaries');
        if (res.ok) {
          const data = await res.json();
          setObituaries(data.obituaries);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchObituaries();
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Bereavement & Welfare Fund</h1>
        <p className="text-gray-500 text-sm">Supporting our fellow LTC Alumni and their families during difficult times.</p>
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-center text-center mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Total Welfare Fund</h2>
        <h3 className="text-4xl font-bold text-maroon">UGX 12,450,000</h3>
        <p className="text-xs text-gray-500 mt-2 font-medium">Contributed by the Alumni community this year.</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Recent Announcements</h2>
      </div>
      
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading announcements...</div>
      ) : obituaries.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <p className="text-gray-500 font-medium">There are no recent bereavement announcements.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {obituaries.map(ob => (
            <div key={ob.id} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="h-48 bg-gray-100 relative group flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full ${ob.status === 'ACTIVE' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                    {ob.status}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">{new Date(ob.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{ob.deceased_name}</h3>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">{ob.biography}</p>
                
                <div className="flex flex-col gap-2">
                  <Link href={`/dashboard/welfare/${ob.id}`} className="block w-full">
                    <button className="w-full bg-white border border-gray-200 text-gray-700 hover:border-maroon hover:text-maroon py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors">
                      Read Obituary & Condolences
                    </button>
                  </Link>
                  {ob.contribution_expiry && new Date(ob.contribution_expiry) > new Date() && (
                    <Link href={`/dashboard/welfare/${ob.id}/contribute`} className="block w-full">
                      <button className="w-full bg-pink border border-transparent text-white hover:bg-pink-dark py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors">
                        Send Contribution
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
