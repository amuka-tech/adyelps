"use client";

import React, { useState } from 'react';

export default function AdminObituaries({ fetchData }: { fetchData: () => void }) {
  const [obitForm, setObitForm] = useState({ 
    deceased_name: '', 
    biography: '', 
    funeral_dates_venues: '', 
    spokesperson_contact: '',
    contribution_expiry: ''
  });

  const handleCreateObituary = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/welfare/obituaries', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(obitForm) 
    });
    if (res.ok) { 
      alert('Obituary created!'); 
      setObitForm({ deceased_name: '', biography: '', funeral_dates_venues: '', spokesperson_contact: '', contribution_expiry: '' }); 
      fetchData(); 
    } else {
      alert((await res.json()).error);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6">Create New Obituary</h3>
      <form onSubmit={handleCreateObituary} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Deceased Name</label>
          <input required type="text" value={obitForm.deceased_name} onChange={e => setObitForm({...obitForm, deceased_name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-maroon/20 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Contribution Expiry Date</label>
          <input type="datetime-local" value={obitForm.contribution_expiry} onChange={e => setObitForm({...obitForm, contribution_expiry: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-maroon/20 outline-none" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Funeral Dates & Venues</label>
            <textarea rows={2} required value={obitForm.funeral_dates_venues} onChange={e => setObitForm({...obitForm, funeral_dates_venues: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-maroon/20 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Spokesperson Contact</label>
            <input type="text" required value={obitForm.spokesperson_contact} onChange={e => setObitForm({...obitForm, spokesperson_contact: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-maroon/20 outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Biography</label>
          <textarea value={obitForm.biography} onChange={e => setObitForm({...obitForm, biography: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-maroon/20 outline-none" rows={3}></textarea>
        </div>
        <button type="submit" className="bg-maroon text-white font-medium px-6 py-3 rounded-xl hover:bg-maroon-dark transition-colors">Create Obituary</button>
      </form>
    </div>
  );
}
