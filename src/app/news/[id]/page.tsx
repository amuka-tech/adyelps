"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/Button';

export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/public/news/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Article not found');
        return res.json();
      })
      .then(data => {
        setArticle(data.article);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-bold">Loading article...</div>;
  if (error || !article) return <div className="h-screen flex items-center justify-center bg-gray-50 text-red-500 font-bold">{error || 'Article not found'}</div>;

  return (
    <div className="flex flex-col w-full bg-gray-50 min-h-[calc(100vh-80px)]">
      {/* Hero Header */}
      <section className="bg-white py-16 border-b border-gray-200">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Link href="/news" className="text-sm font-bold text-gray-500 hover:text-maroon transition-colors flex items-center justify-center mb-6">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to News
          </Link>
          <span className="text-xs font-bold tracking-wider uppercase text-maroon bg-maroon/10 px-3 py-1.5 rounded-full w-fit mx-auto mb-4 inline-block">
            {article.category}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">{article.title}</h1>
          <p className="text-gray-500 font-medium">
            By <span className="font-bold text-gray-900">{article.first_name} {article.last_name}</span> • {new Date(article.created_at).toLocaleDateString()}
          </p>
        </div>
      </section>

      {/* Featured Image */}
      {article.image_url && (
        <section className="bg-white px-4 pb-12">
          <div className="container mx-auto max-w-5xl h-[300px] sm:h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-lg border border-gray-100">
            <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
          </div>
        </section>
      )}

      {/* Article Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 prose prose-lg prose-gray max-w-none whitespace-pre-wrap leading-relaxed">
            {article.content}
          </div>

          {/* Social Share (Placeholder) */}
          <div className="mt-12 text-center">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Share this article</h3>
            <div className="flex justify-center gap-4">
              <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">Facebook</Button>
              <Button variant="outline" className="text-sky-500 border-sky-200 hover:bg-sky-50">Twitter</Button>
              <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">WhatsApp</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
