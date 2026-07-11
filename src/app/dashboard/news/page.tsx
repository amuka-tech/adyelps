"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/Card';

export default function MemberNewsFeed() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/news')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.articles) setArticles(data.articles);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-20 text-center font-bold text-gray-500">Loading your news feed...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Member News Hub</h1>
        <p className="text-gray-500">Stay up to date with the latest from the Adyel Alumni community.</p>
      </div>

      {articles.length === 0 ? (
        <Card className="text-center p-16 bg-gray-50 border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15"></path></svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No news yet</h2>
          <p className="text-gray-500">Check back later for updates and announcements.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article: any) => (
            <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-all group border-gray-100 h-full flex flex-col">
              <div className="h-48 bg-gray-100 relative overflow-hidden">
                {article.image_url ? (
                  <img src={article.image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="absolute inset-0 bg-darkblue flex items-center justify-center opacity-90">
                    <svg className="w-16 h-16 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15"></path></svg>
                  </div>
                )}
                {article.category && (
                  <div className="absolute top-4 left-4 bg-maroon text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm tracking-wider uppercase">
                    {article.category}
                  </div>
                )}
              </div>
              <CardContent className="p-6 flex-1 flex flex-col">
                <p className="text-xs text-gray-400 font-bold mb-3 uppercase tracking-wider">
                  {new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-maroon transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <div className="text-sm text-gray-600 mb-6 line-clamp-3 leading-relaxed flex-1 prose" dangerouslySetInnerHTML={{ __html: article.content.substring(0, 150) + '...' }} />
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-skyblue/20 text-darkblue flex items-center justify-center text-xs font-bold uppercase">
                      {article.first_name?.[0]}{article.last_name?.[0]}
                    </div>
                    <span className="text-xs font-bold text-gray-500">{article.first_name}</span>
                  </div>
                  <Link href={`/news/${article.id}`} className="text-sm font-bold text-maroon hover:text-maroon-dark flex items-center gap-1 group/link">
                    Read More 
                    <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
