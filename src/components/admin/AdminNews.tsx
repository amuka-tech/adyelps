"use client";

import React, { useState } from 'react';
import { showToast } from '@/lib/toast';
import { createClient } from '@/utils/supabase/client';

export default function AdminNews({ news, fetchData }: { news: any[], fetchData: () => void }) {
  const [newsForm, setNewsForm] = useState({ title: '', content: '', image_url: '', category: 'General', status: 'DRAFT' });
  
  const [editingArticle, setEditingArticle] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

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

  const handleUpdateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    const supabase = createClient();
    const { error } = await supabase.from('news').update({
      title: editingArticle.title,
      category: editingArticle.category,
      content: editingArticle.content,
      status: editingArticle.status
    }).eq('id', editingArticle.id);

    if (error) {
      alert(error.message);
    } else {
      setEditingArticle(null);
      fetchData();
    }
  };

  const handleDeleteArticle = async () => {
    if (!deleteTarget) return;
    const supabase = createClient();
    const { error } = await supabase.from('news').delete().eq('id', deleteTarget.id);
    if (error) {
      alert(error.message);
    } else {
      setDeleteTarget(null);
      fetchData();
    }
  };

  return (
    <div>
      {/* Edit Modal */}
      {editingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Edit Article</h3>
            <form onSubmit={handleUpdateArticle} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input required type="text" value={editingArticle.title || ''} onChange={e => setEditingArticle({...editingArticle, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-maroon/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select required value={editingArticle.category || 'General'} onChange={e => setEditingArticle({...editingArticle, category: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-maroon/20 outline-none">
                  <option value="General">General</option>
                  <option value="Alumni Achievements">Alumni Achievements</option>
                  <option value="School Updates">School Updates</option>
                  <option value="Event Recaps">Event Recaps</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea required value={editingArticle.content || ''} onChange={e => setEditingArticle({...editingArticle, content: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-maroon/20 outline-none min-h-[150px]"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select value={editingArticle.status || 'DRAFT'} onChange={e => setEditingArticle({...editingArticle, status: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-maroon/20 outline-none">
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="DRAFT">DRAFT</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button type="button" onClick={() => setEditingArticle(null)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white bg-maroon rounded-lg hover:bg-maroon-dark">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-xl max-w-sm w-full text-center">
            <h3 className="text-lg font-bold mb-2">Delete Article</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this article? This cannot be undone.</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              <button onClick={handleDeleteArticle} className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

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
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {news.map(article => (
              <tr key={article.id}>
                <td className="p-4 font-bold text-gray-900">{article.title}</td>
                <td className="p-4 text-sm text-gray-600">{article.category}</td>
                <td className="p-4 text-sm text-gray-600">{article.first_name} {article.last_name}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${article.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{article.status}</span>
                </td>
                <td className="p-4 text-right space-x-4">
                  <button onClick={() => setEditingArticle(article)} className="text-blue-600 hover:underline text-sm font-medium">Edit</button>
                  <button onClick={() => setDeleteTarget(article)} className="text-red-600 hover:underline text-sm font-medium">Delete</button>
                </td>
              </tr>
            ))}
            {news.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-400">No articles found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
