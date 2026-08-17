"use client";

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import ConfirmDialog from './ConfirmDialog';

export default function AdminBusinesses({ 
  pendingBusinesses, 
  handleModerateBusiness 
}: { 
  pendingBusinesses: any[]; 
  handleModerateBusiness: (id: number, status: string) => void; 
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  const [businessToDelete, setBusinessToDelete] = useState<number | null>(null);

  const handleAddBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    await supabase.from('businesses').insert({ name, category, description, website, phone, status: 'ACTIVE', owner_id: null });
    setIsAddModalOpen(false);
    setName('');
    setCategory('');
    setDescription('');
    setWebsite('');
    setPhone('');
    window.location.reload();
  };

  const handleDeleteBusiness = async () => {
    if (businessToDelete === null) return;
    const supabase = createClient();
    await supabase.from('businesses').delete().eq('id', businessToDelete);
    setBusinessToDelete(null);
    window.location.reload();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Business Directory Moderation</h3>
        <button onClick={() => setIsAddModalOpen(true)} className="bg-maroon text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-maroon/90 transition-colors">+ Add Business</button>
      </div>

      <ConfirmDialog
        isOpen={businessToDelete !== null}
        title="Delete Business"
        message="Are you sure you want to permanently delete this business?"
        onConfirm={handleDeleteBusiness}
        onCancel={() => setBusinessToDelete(null)}
      />

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add a Business</h3>
            <form onSubmit={handleAddBusiness} className="space-y-4">
              <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-2" />
              <input type="text" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-2" />
              <input type="text" placeholder="Website" value={website} onChange={e => setWebsite(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2" />
              <input type="text" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2" />
              <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-2 h-24"></textarea>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl font-semibold text-white bg-maroon hover:bg-maroon/90">Add Business</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {pendingBusinesses.length === 0 ? <div className="text-center py-20 text-gray-400">No pending businesses.</div> : (
        <div className="space-y-4">
          {pendingBusinesses.map(biz => (
            <div key={biz.id} className="border border-gray-100 rounded-2xl p-6 bg-gray-50 flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <h4 className="text-lg font-bold text-gray-900">{biz.business_name}</h4>
                <p className="text-sm text-gray-500 mb-2">{biz.category} • {biz.website || 'No website'}</p>
                <p className="text-sm text-gray-600 line-clamp-2">{biz.description}</p>
                <p className="text-xs text-gray-400 mt-2">Submitted by User ID: {biz.owner_id}</p>
              </div>
              <div className="flex gap-2 whitespace-nowrap">
                <button onClick={() => handleModerateBusiness(biz.id, 'ACTIVE')} className="bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2 rounded-xl text-sm font-bold transition-colors">Approve</button>
                <button onClick={() => handleModerateBusiness(biz.id, 'REJECTED')} className="bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl text-sm font-bold transition-colors">Reject</button>
                <button onClick={() => setBusinessToDelete(biz.id)} className="bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl text-sm font-bold transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
