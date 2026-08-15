"use client";

import React, { useState } from 'react';
import { showToast } from '@/lib/toast';
import { createClient } from '@/utils/supabase/client';

export default function AdminNews({ news, fetchData }: { news: any[], fetchData: () => void }) {
  const [newsForm, setNewsForm] = useState({ title: '', content: '', image_url: '', category: 'General', status: 'DRAFT' });

  const handleCreateNews = async (e: React.FormEvent, status: string) => {
    e.preventDefault();
    const supabase = createClient();
    const { error } = await supabase.from('news').insert({ ...newsForm, status });
    if (!error) { 
      alert('News Article created!'); 
      setNewsForm({ title: '', content: '', image_url: '', category: 'General', status: 'DRAFT' }); 
      fetchData(); 
    } else {
      alert(error.message);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6">Create News Article</h3>
      <form className="space-y-4 mb-10">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-500 mb-1">Headline</label>
            <input required type="text" value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-maroon/20 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
            <select required value={newsForm.category} onChange={e => setNewsForm({...newsForm, category: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-maroon/20 outline-none">
              <option value="General">General</option>
              <option value="Alumni Achievements">Alumni Achievements</option>
              <option value="School Updates">School Updates</option>
              <option value="Event Recaps">Event Recaps</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Image URL (Optional)</label>
          <input type="text" value={newsForm.image_url} onChange={e => setNewsForm({...newsForm, image_url: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-maroon/20 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Article Content (Rich Text)</label>
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <div className="bg-gray-50 border-b border-gray-200 p-2 flex gap-2">
              <button type="button" onClick={() => showToast("Rich text editor coming soon", "info")} className="p-1.5 hover:bg-gray-200 rounded text-gray-600 font-bold">B</button>
              <button type="button" onClick={() => showToast("Rich text editor coming soon", "info")} className="p-1.5 hover:bg-gray-200 rounded text-gray-600 italic">I</button>
              <button type="button" onClick={() => showToast("Rich text editor coming soon", "info")} className="p-1.5 hover:bg-gray-200 rounded text-gray-600 underline">U</button>
              <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>
              <button type="button" onClick={() => showToast("Rich text editor coming soon", "info")} className="p-1.5 hover:bg-gray-200 rounded text-gray-600">List</button>
              <button type="button" onClick={() => showToast("Rich text editor coming soon", "info")} className="p-1.5 hover:bg-gray-200 rounded text-gray-600">Link</button>
            </div>
            <textarea required value={newsForm.content} onChange={e => setNewsForm({...newsForm, content: e.target.value})} className="w-full px-4 py-3 border-none focus:ring-0 outline-none min-h-[200px]" placeholder="Write your article here..."></textarea>
          </div>
        </div>
        <div className="flex gap-4">
          <button type="button" onClick={(e) => handleCreateNews(e, 'PUBLISHED')} className="bg-maroon text-white font-medium px-6 py-3 rounded-xl hover:bg-maroon-dark transition-colors">Publish Now</button>
          <button type="button" onClick={(e) => handleCreateNews(e, 'DRAFT')} className="bg-white border border-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors">Save as Draft</button>
        </div>
      </form>

      <h3 className="text-xl font-bold text-gray-900 mb-4">Published & Drafted Articles</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left bg-white rounded-xl shadow-sm border border-gray-100">
          <thead className="bg-gray-50">
            <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
              <th className="p-4 font-semibold">Title</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="p-4 font-semibold">Author</th>
              <th className="p-4 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {news.map(article => (
              <tr key={article.id}>
                <td className="p-4 font-bold text-gray-900">{article.title}</td>
                <td className="p-4 text-sm text-gray-600">{article.category}</td>
                <td className="p-4 text-sm text-gray-600">{article.first_name} {article.last_name}</td>
                <td className="p-4 text-right">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${article.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{article.status}</span>
                </td>
              </tr>
            ))}
            {news.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-400">No articles found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
