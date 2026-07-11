"use client";

import React from 'react';

export default function AdminCondolences({ 
  condolences, 
  handleModerateCondolence 
}: { 
  condolences: any[]; 
  handleModerateCondolence: (id: number, status: string) => void; 
}) {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6">Condolence Moderation</h3>
      {condolences.length === 0 ? <div className="text-center py-20 text-gray-400">No pending condolences.</div> : (
        <div className="space-y-4">
          {condolences.map(c => (
            <div key={c.id} className="border border-gray-100 rounded-2xl p-6 bg-gray-50 flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-pink text-maroon flex items-center justify-center text-sm">{c.first_name[0]}</span>
                  {c.first_name} {c.last_name}
                </h4>
                <p className="text-xs text-gray-500 mb-3 ml-10">For: {c.deceased_name} • {new Date(c.created_at).toLocaleString()}</p>
                <div className="bg-white p-4 rounded-xl text-gray-700 italic border border-gray-100 shadow-sm ml-10">
                  "{c.message}"
                </div>
              </div>
              <div className="flex gap-2 whitespace-nowrap mt-4 md:mt-0">
                <button onClick={() => handleModerateCondolence(c.id, 'APPROVED')} className="bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2 rounded-xl text-sm font-bold transition-colors">Approve</button>
                <button onClick={() => handleModerateCondolence(c.id, 'REJECTED')} className="bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl text-sm font-bold transition-colors">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
