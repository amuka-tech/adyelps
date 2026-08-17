"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function AdminObituaries({ fetchData }: { fetchData: () => void }) {
  const [obituaries, setObituaries] = useState<any[]>([]);
  const [editingObit, setEditingObit] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const [obitForm, setObitForm] = useState({ 
    deceased_name: '', 
    biography: '', 
    funeral_dates_venues: '', 
    spokesperson_contact: '',
    contribution_expiry: ''
  });

  const fetchObituaries = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('obituaries').select('*').order('created_at', { ascending: false });
    if (data) setObituaries(data);
  };

  useEffect(() => {
    fetchObituaries();
  }, []);

  const handleUpdateObituary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingObit) return;
    const supabase = createClient();
    const { error } = await supabase.from('obituaries').update({
      deceased_name: editingObit.deceased_name,
      biography: editingObit.biography,
      funeral_dates_venues: editingObit.funeral_dates_venues,
      spokesperson_contact: editingObit.spokesperson_contact
    }).eq('id', editingObit.id);

    if (error) {
      alert(error.message);
    } else {
      setEditingObit(null);
      fetchObituaries();
    }
  };

  const handleDeleteObituary = async () => {
    if (!deleteTarget) return;
    const supabase = createClient();
    const { error } = await supabase.from('obituaries').delete().eq('id', deleteTarget.id);
    if (error) {
      alert(error.message);
    } else {
      setObituaries(obituaries.filter(o => o.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const handleCreateObituary = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    
    const insertData: any = { ...obitForm };
    if (!insertData.contribution_expiry) {
      insertData.contribution_expiry = null;
    }

    const { error } = await supabase.from('obituaries').insert([insertData]);

    if (!error) { 
      alert('Obituary created!'); 
      setObitForm({ deceased_name: '', biography: '', funeral_dates_venues: '', spokesperson_contact: '', contribution_expiry: '' }); 
      fetchData(); 
      fetchObituaries();
    } else {
      alert(error.message);
    }
  };

  return (
    <div>
      {/* Edit Modal */}
      {editingObit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Edit Obituary</h3>
            <form onSubmit={handleUpdateObituary} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Deceased Name</label>
                <input required type="text" value={editingObit.deceased_name || ''} onChange={e => setEditingObit({...editingObit, deceased_name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-maroon/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Biography</label>
                <textarea required value={editingObit.biography || ''} onChange={e => setEditingObit({...editingObit, biography: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-maroon/20 outline-none min-h-[100px]"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Funeral Dates & Venues</label>
                <textarea required value={editingObit.funeral_dates_venues || ''} onChange={e => setEditingObit({...editingObit, funeral_dates_venues: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-maroon/20 outline-none min-h-[80px]"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Spokesperson Contact</label>
                <input required type="text" value={editingObit.spokesperson_contact || ''} onChange={e => setEditingObit({...editingObit, spokesperson_contact: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-maroon/20 outline-none" />
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button type="button" onClick={() => setEditingObit(null)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
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
            <h3 className="text-lg font-bold mb-2">Delete Obituary</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this obituary? This cannot be undone.</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              <button onClick={handleDeleteObituary} className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-10">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Existing Obituaries</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left bg-white rounded-xl shadow-sm border border-gray-100">
            <thead className="bg-gray-50">
              <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 font-semibold">Deceased Name</th>
                <th className="p-4 font-semibold">Created At</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {obituaries.map(obit => (
                <tr key={obit.id}>
                  <td className="p-4 font-bold text-gray-900">{obit.deceased_name}</td>
                  <td className="p-4 text-sm text-gray-600">{new Date(obit.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-sm text-gray-600">Active</td>
                  <td className="p-4 text-right space-x-4">
                    <button onClick={() => setEditingObit(obit)} className="text-blue-600 hover:underline text-sm font-medium">Edit</button>
                    <button onClick={() => setDeleteTarget(obit)} className="text-red-600 hover:underline text-sm font-medium">Delete</button>
                  </td>
                </tr>
              ))}
              {obituaries.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-400">No obituaries found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

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
