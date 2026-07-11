"use client";

import React from 'react';

export default function AdminJobs({ 
  pendingJobs, 
  handleModerateJob 
}: { 
  pendingJobs: any[]; 
  handleModerateJob: (id: number, status: string) => void; 
}) {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6">Job Moderation</h3>
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
