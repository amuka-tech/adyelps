"use client";

import React, { useState } from 'react';

export default function AdminEvents({ fetchData }: { fetchData: () => void }) {
  const [eventForm, setEventForm] = useState({ 
    title: '', 
    description: '', 
    event_date: '', 
    location: '', 
    image_url: '', 
    tiers: [{ name: 'General Admission', price: '0', capacity: '100' }] 
  });

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/events', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(eventForm) 
    });
    if (res.ok) { 
      alert('Event created!'); 
      setEventForm({ title: '', description: '', event_date: '', location: '', image_url: '', tiers: [] }); 
      fetchData(); 
    } else {
      alert((await res.json()).error);
    }
  };

  return (
    <div>
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
