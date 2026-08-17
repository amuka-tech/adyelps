"use client";

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import ConfirmDialog from './ConfirmDialog';

export default function AdminJobs({ 
  pendingJobs, 
  handleModerateJob 
}: { 
  pendingJobs: any[]; 
  handleModerateJob: (id: number, status: string) => void; 
}) {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Full-time');
  const [jobToDelete, setJobToDelete] = useState<number | null>(null);

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    await supabase.from('jobs').insert({ title, company, location, description, type, status: 'ACTIVE', posted_by_id: null });
    setIsPostModalOpen(false);
    setTitle('');
    setCompany('');
    setLocation('');
    setDescription('');
    setType('Full-time');
    window.location.reload();
  };

  const handleDeleteJob = async () => {
    if (jobToDelete === null) return;
    const supabase = createClient();
    await supabase.from('jobs').delete().eq('id', jobToDelete);
    setJobToDelete(null);
    window.location.reload();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Job Moderation</h3>
        <button onClick={() => setIsPostModalOpen(true)} className="bg-maroon text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-maroon/90 transition-colors">+ Post Job</button>
      </div>

      <ConfirmDialog
        isOpen={jobToDelete !== null}
        title="Delete Job"
        message="Are you sure you want to permanently delete this job?"
        onConfirm={handleDeleteJob}
        onCancel={() => setJobToDelete(null)}
      />

      {isPostModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Post a Job</h3>
            <form onSubmit={handlePostJob} className="space-y-4">
              <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-2" />
              <input type="text" placeholder="Company" value={company} onChange={e => setCompany(e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-2" />
              <input type="text" placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-2" />
              <select value={type} onChange={e => setType(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2">
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
              </select>
              <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-2 h-24"></textarea>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsPostModalOpen(false)} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl font-semibold text-white bg-maroon hover:bg-maroon/90">Post Job</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {pendingJobs.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          </div>
          <p className="text-gray-500 font-medium">All caught up! No pending jobs.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingJobs.map(job => (
            <div key={job.id} className="border border-gray-100 rounded-2xl p-6 bg-gray-50">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{job.title}</h4>
                  <p className="text-sm text-gray-500">{job.company} • {job.location}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleModerateJob(job.id, 'ACTIVE')} className="bg-gray-900 text-white hover:bg-black px-4 py-2 rounded-xl text-sm font-bold">Approve</button>
                  <button onClick={() => handleModerateJob(job.id, 'REJECTED')} className="bg-white border border-gray-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl text-sm font-bold">Reject</button>
                  <button onClick={() => setJobToDelete(job.id)} className="bg-white border border-gray-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl text-sm font-bold">Delete</button>
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
