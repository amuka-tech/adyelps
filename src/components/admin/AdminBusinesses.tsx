"use client";

import React from 'react';

export default function AdminBusinesses({ 
  pendingBusinesses, 
  handleModerateBusiness 
}: { 
  pendingBusinesses: any[]; 
  handleModerateBusiness: (id: number, status: string) => void; 
}) {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6">Business Directory Moderation</h3>
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
