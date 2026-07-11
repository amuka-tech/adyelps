"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/Card';
import { Button } from '@/components/Button';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PublicObituaryDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const obituaryId = params.id;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const obitRes = await fetch(`/api/welfare/obituaries/${obituaryId}`);
        if (obitRes.ok) setData(await obitRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [obituaryId]);

  if (loading) return <div className="p-20 text-center">Loading...</div>;
  if (!data || !data.obituary) return <div className="p-20 text-center">Obituary not found.</div>;

  const { obituary, condolences } = data;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <button onClick={() => router.push('/obituaries')} className="text-gray-500 hover:text-maroon text-sm font-bold flex items-center mb-4 transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Public Obituaries
        </button>
      </div>
        
      {/* Top Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className={`text-xs font-bold px-2 py-1 rounded ${obituary.status === 'ACTIVE' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'}`}>
              {obituary.status}
            </span>
            <span className="text-gray-500 text-sm">Posted {new Date(obituary.created_at).toLocaleDateString()}</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">{obituary.deceased_name}</h1>
        </div>
        {obituary.contribution_expiry && new Date(obituary.contribution_expiry) > new Date() && obituary.status === 'ACTIVE' && (
          <Link href={`/dashboard/welfare/${obituary.id}/contribute`} className="mt-4 md:mt-0">
            <Button className="shadow-lg bg-pink hover:bg-pink-dark">
              Send Contribution
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-8">
        
        {/* Biography & Program */}
        <Card>
          <CardContent className="p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 border-b border-gray-100 pb-2">Biography</h3>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{obituary.biography}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1 text-maroon uppercase tracking-wide">Funeral Program</h3>
                <p className="text-gray-700 whitespace-pre-wrap text-sm">{obituary.funeral_dates_venues}</p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1 text-maroon uppercase tracking-wide">Spokesperson Contact</h3>
                <p className="text-gray-700 text-sm">{obituary.spokesperson_contact}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Condolence Board */}
        <Card>
          <CardHeader>
            <h3 className="text-xl font-bold text-gray-900">Condolence Board</h3>
            <p className="text-sm text-gray-500">Messages of support from the community.</p>
          </CardHeader>
          <CardContent>
            
            <div className="mb-8 p-6 bg-gray-50 border border-gray-100 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-gray-700 font-medium">Please log in to leave a message of support for the family.</p>
              <Link href="/login">
                <Button variant="outline" className="border-maroon text-maroon hover:bg-maroon hover:text-white shrink-0">
                  Log In to Post
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {condolences.length === 0 ? (
                <p className="text-gray-500 text-center py-6">No messages yet. Log in to be the first to leave a condolence.</p>
              ) : (
                condolences.map((c: any) => (
                  <div key={c.id} className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-xs uppercase">
                          {c.first_name?.[0] || 'A'}{c.last_name?.[0] || 'N'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{c.first_name || 'Anonymous'} {c.last_name || ''}</p>
                          <p className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mt-2">{c.message}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
