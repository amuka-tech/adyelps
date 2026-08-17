"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function AdminEvents({ fetchData }: { fetchData: () => void }) {
  const [events, setEvents] = useState<any[]>([]);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const [eventForm, setEventForm] = useState({ 
    title: '', 
    description: '', 
    event_date: '', 
    location: '', 
    image_url: '', 
    tiers: [{ name: 'General Admission', price: '0', capacity: '100' }] 
  });

  const fetchEvents = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('events').select('*, ticket_tiers(*)').order('event_date', { ascending: false });
    if (data) setEvents(data);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    const supabase = createClient();
    const { error } = await supabase.from('events').update({
      title: editingEvent.title,
      description: editingEvent.description,
      event_date: editingEvent.event_date,
      location: editingEvent.location,
      image_url: editingEvent.image_url,
      status: editingEvent.status
    }).eq('id', editingEvent.id);

    if (error) {
      alert(error.message);
    } else {
      setEditingEvent(null);
      fetchEvents();
    }
  };

  const handleDeleteEvent = async () => {
    if (!deleteTarget) return;
    const supabase = createClient();
    const { error } = await supabase.from('events').delete().eq('id', deleteTarget.id);
    if (error) {
      alert(error.message);
    } else {
      setEvents(events.filter(ev => ev.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('You must be logged in to create an event.');
      return;
    }

    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        title: eventForm.title,
        description: eventForm.description,
        event_date: eventForm.event_date,
        location: eventForm.location,
        image_url: eventForm.image_url || null,
        created_by_id: user.id
      })
      .select()
      .single();

    if (eventError) {
      alert(eventError.message);
      return;
    }

    if (eventForm.tiers.length > 0 && event) {
      const tiersToInsert = eventForm.tiers.map((tier) => ({
        event_id: event.id,
        name: tier.name,
        price: parseFloat(tier.price) || 0,
        capacity: parseInt(tier.capacity) || 0
      }));

      const { error: tiersError } = await supabase
        .from('ticket_tiers')
        .insert(tiersToInsert);

      if (tiersError) {
        alert(tiersError.message);
        return;
      }
    }

    alert('Event created!'); 
    setEventForm({ title: '', description: '', event_date: '', location: '', image_url: '', tiers: [] }); 
    fetchData(); 
    fetchEvents();
  };

  return (
    <div>
      {/* Edit Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Edit Event</h3>
            <form onSubmit={handleUpdateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input required type="text" value={editingEvent.title || ''} onChange={e => setEditingEvent({...editingEvent, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-maroon/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date & Time</label>
                <input required type="datetime-local" value={editingEvent.event_date ? new Date(editingEvent.event_date).toISOString().slice(0, 16) : ''} onChange={e => setEditingEvent({...editingEvent, event_date: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-maroon/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input required type="text" value={editingEvent.location || ''} onChange={e => setEditingEvent({...editingEvent, location: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-maroon/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea required value={editingEvent.description || ''} onChange={e => setEditingEvent({...editingEvent, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-maroon/20 outline-none" rows={3}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input type="text" value={editingEvent.image_url || ''} onChange={e => setEditingEvent({...editingEvent, image_url: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-maroon/20 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select value={editingEvent.status || 'UPCOMING'} onChange={e => setEditingEvent({...editingEvent, status: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-maroon/20 outline-none">
                  <option value="UPCOMING">UPCOMING</option>
                  <option value="ONGOING">ONGOING</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button type="button" onClick={() => setEditingEvent(null)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
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
            <h3 className="text-lg font-bold mb-2">Delete Event</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this event? This cannot be undone.</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              <button onClick={handleDeleteEvent} className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-10">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Existing Events</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left bg-white rounded-xl shadow-sm border border-gray-100">
            <thead className="bg-gray-50">
              <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 font-semibold">Title</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Location</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {events.map(ev => (
                <tr key={ev.id}>
                  <td className="p-4 font-bold text-gray-900">{ev.title}</td>
                  <td className="p-4 text-sm text-gray-600">{new Date(ev.event_date).toLocaleString()}</td>
                  <td className="p-4 text-sm text-gray-600">{ev.location}</td>
                  <td className="p-4 text-sm text-gray-600">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-600`}>{ev.status || 'UPCOMING'}</span>
                  </td>
                  <td className="p-4 text-right space-x-4">
                    <button onClick={() => setEditingEvent(ev)} className="text-blue-600 hover:underline text-sm font-medium">Edit</button>
                    <button onClick={() => setDeleteTarget(ev)} className="text-red-600 hover:underline text-sm font-medium">Delete</button>
                  </td>
                </tr>
              ))}
              {events.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-400">No events found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-6">Create New Event</h3>
      <form onSubmit={handleCreateEvent} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Event Title</label>
            <input required type="text" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-maroon/20 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Date & Time</label>
            <input required type="datetime-local" value={eventForm.event_date} onChange={e => setEventForm({...eventForm, event_date: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-maroon/20 outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Location</label>
          <input required type="text" value={eventForm.location} onChange={e => setEventForm({...eventForm, location: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-maroon/20 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
          <textarea required value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-maroon/20 outline-none" rows={4}></textarea>
        </div>

        <div className="border border-gray-200 rounded-2xl p-6 bg-white space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-gray-900">Ticket Tiers</h4>
            <button type="button" onClick={() => setEventForm({...eventForm, tiers: [...eventForm.tiers, { name: '', price: '', capacity: '' }]})} className="text-sm font-bold text-maroon hover:underline flex items-center gap-1">
              + Add Tier
            </button>
          </div>
          {eventForm.tiers.map((tier, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="col-span-5">
                <label className="block text-xs font-medium text-gray-500 mb-1">Tier Name</label>
                <input required type="text" placeholder="e.g. VIP" value={tier.name} onChange={e => {
                  const newTiers = [...eventForm.tiers];
                  newTiers[index].name = e.target.value;
                  setEventForm({...eventForm, tiers: newTiers});
                }} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 outline-none text-sm" />
              </div>
              <div className="col-span-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">Price (UGX)</label>
                <input required type="number" placeholder="0" value={tier.price} onChange={e => {
                  const newTiers = [...eventForm.tiers];
                  newTiers[index].price = e.target.value;
                  setEventForm({...eventForm, tiers: newTiers});
                }} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 outline-none text-sm" />
              </div>
              <div className="col-span-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">Capacity</label>
                <input required type="number" placeholder="100" value={tier.capacity} onChange={e => {
                  const newTiers = [...eventForm.tiers];
                  newTiers[index].capacity = e.target.value;
                  setEventForm({...eventForm, tiers: newTiers});
                }} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon/20 outline-none text-sm" />
              </div>
              <div className="col-span-1 flex justify-end mt-4">
                <button type="button" onClick={() => {
                  if (eventForm.tiers.length > 1) {
                    const newTiers = [...eventForm.tiers];
                    newTiers.splice(index, 1);
                    setEventForm({...eventForm, tiers: newTiers});
                  }
                }} className="text-red-500 hover:text-red-700 disabled:opacity-30" disabled={eventForm.tiers.length === 1}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <button type="submit" className="w-full py-4 text-lg bg-maroon text-white font-medium rounded-2xl hover:bg-maroon-dark transition-colors shadow-md shadow-maroon/20">Create & Publish Event</button>
      </form>
    </div>
  );
}
