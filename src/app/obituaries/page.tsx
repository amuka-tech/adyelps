import React from 'react';
import { Card, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';
import Link from 'next/link';
import { query } from '@/lib/db';

export const metadata = {
  title: 'Obituaries | LTC Alumni',
  description: 'In loving memory of the Adyel alumni and staff who have passed on.',
};

export default async function ObituariesPage() {
  let obituaries: any[] = [];
  try {
    obituaries = await query('SELECT * FROM obituaries ORDER BY created_at DESC') as any[];
  } catch (error) {
    console.error("Failed to load obituaries", error);
  }

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-80px)] bg-gray-50">
      
      {/* Header Section */}
      <section className="bg-gray-900 py-20 text-white text-center border-b-4 border-maroon">
        <div className="container mx-auto px-4 max-w-3xl">
          <svg className="w-12 h-12 mx-auto mb-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"></path>
          </svg>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-serif">In Memoriam</h1>
          <p className="text-xl text-gray-400 font-light">
            Honoring the lives and legacies of Adyel alumni and staff who have passed on.
          </p>
        </div>
      </section>

      {/* Announcements */}
      <section className="py-16 flex-1">
        <div className="container mx-auto px-4 max-w-6xl">
          {obituaries.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
              <p className="text-gray-500">There are no obituary announcements at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {obituaries.map((obit) => (
                <Card key={obit.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow border-gray-200 h-full flex flex-col">
                  <div className="flex flex-col h-full">
                    <div 
                      className="w-full h-56 flex items-center justify-center relative overflow-hidden bg-gray-800 bg-center bg-cover shrink-0"
                      style={obit.photo_url ? { backgroundImage: `url(${obit.photo_url})` } : {}}
                    >
                      {!obit.photo_url && (
                        <>
                          <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9ImN1cnJlbnRDb2xvciIvPjwvc3ZnPg==')]"></div>
                          <svg className="w-20 h-20 text-white/10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                        </>
                      )}
                    </div>
                    <CardContent className="w-full p-8 flex flex-col flex-1">
                      <div className="mb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900 font-serif mb-1">{obit.deceased_name}</h2>
                            <p className="text-maroon font-medium uppercase tracking-wider text-sm">Alumni / Staff</p>
                          </div>
                          {obit.status && (
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${obit.status === 'ACTIVE' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                              {obit.status}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <p className="text-sm font-bold text-gray-500 mb-2">Posted: {new Date(obit.created_at).toLocaleDateString()}</p>
                        <p className="text-gray-700 leading-relaxed italic border-l-4 border-gray-200 pl-4 whitespace-pre-wrap">{obit.biography}</p>
                      </div>
                      
                      {obit.funeral_dates_venues && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
                          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-1">Funeral Arrangements</h4>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{obit.funeral_dates_venues}</p>
                        </div>
                      )}
                      
                      <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-2">
                        <Link href={`/obituaries/${obit.id}`} className="w-full">
                          <Button variant="outline" className="w-full border-maroon text-maroon hover:bg-maroon hover:text-white transition-colors">
                            Read Obituary & Condolences
                          </Button>
                        </Link>
                        {obit.contribution_expiry && new Date(obit.contribution_expiry) > new Date() && obit.status === 'ACTIVE' && (
                          <Link href={`/dashboard/welfare/${obit.id}/contribute`} className="w-full">
                            <Button className="w-full bg-pink hover:bg-pink-dark text-white shadow-md border-transparent">
                              Send Contribution
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Welfare CTA */}
      <section className="bg-maroon py-12 text-center text-white">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold mb-3">Support the Welfare Fund</h3>
          <p className="text-pink/80 max-w-2xl mx-auto mb-6">
            The Alumni Welfare Fund provides support to grieving families of registered alumni.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/login">
              <Button className="bg-white text-maroon hover:bg-gray-100">Contribute to Fund</Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
