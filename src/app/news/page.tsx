"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';
import Link from 'next/link';

export default function NewsPage() {
  const [newsArticles, setNewsArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/news')
      .then(res => res.json())
      .then(data => {
        if (data.articles) setNewsArticles(data.articles);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col w-full bg-gray-50 min-h-[calc(100vh-80px)]">
      {/* Header */}
      <section className="bg-white py-16 border-b border-gray-200">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">School & Alumni News</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay up to date with the latest developments, achievements, and announcements from Adyel and its vibrant alumni community.
          </p>
        </div>
      </section>

      {/* Featured News */}
      <section className="py-12 flex-1">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <span className="w-8 h-1 bg-maroon mr-4"></span>
            Latest Headlines
          </h2>
          
          {loading ? (
            <div className="text-center py-20 text-gray-500">Loading articles...</div>
          ) : newsArticles.length === 0 ? (
            <div className="text-center py-20 text-gray-500 bg-white rounded-2xl border border-gray-100">No news articles published yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsArticles.map((article) => (
                <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full group bg-white border-gray-100">
                  <div className="h-48 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                    {article.image_url ? (
                      <img src={article.image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9ImN1cnJlbnRDb2xvciIvPjwvc3ZnPg==')]"></div>
                    )}
                  </div>
                  <CardContent className="flex-1 flex flex-col p-6">
                    <div className="flex flex-col mb-3">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-maroon bg-maroon/10 px-2 py-1 rounded w-fit mb-2">
                        {article.category}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">By {article.first_name} {article.last_name} • {new Date(article.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-maroon transition-colors leading-snug line-clamp-2">{article.title}</h3>
                    
                    <div className="mt-auto pt-4 border-t border-gray-50">
                      <Link href={`/news/${article.id}`} className="block w-full text-center py-2 px-4 text-sm font-bold border border-gray-200 rounded-lg text-gray-700 hover:border-maroon hover:text-maroon transition-colors">
                        Read Full Article
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-darkblue py-16 text-white mt-auto">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl font-bold mb-4">Never Miss an Update</h2>
          <p className="text-skyblue/80 mb-8">Subscribe to the LTC Alumni newsletter to get the latest news delivered straight to your inbox.</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto" onSubmit={(e) => { e.preventDefault(); alert('Subscribed successfully!'); }}>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              required
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-maroon"
            />
            <Button type="submit" className="bg-maroon hover:bg-maroon-dark px-8 py-3 whitespace-nowrap">
              Subscribe Now
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
