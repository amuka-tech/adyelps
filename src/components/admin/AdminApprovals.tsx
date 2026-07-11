"use client";

import React from 'react';

export default function AdminApprovals({ 
  contributions, 
  handleVerifyContribution 
}: { 
  contributions: any[]; 
  handleVerifyContribution: (id: number, status: string) => void; 
}) {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6">Pending Contributions</h3>
      {contributions.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <p className="text-gray-500 font-medium">No pending contributions to verify.</p>
        </div>
      ) : (
        <table className="w-full text-left">
          <tbody className="divide-y divide-gray-50">
            {contributions.map(c => (
              <tr key={c.id}>
                <td className="py-4">
                  <p className="font-bold text-gray-900">{c.first_name} {c.last_name}</p>
                  <p className="text-xs text-gray-500">{c.email}</p>
                </td>
                <td className="py-4 font-bold text-maroon text-lg">UGX {parseFloat(c.amount_gross).toLocaleString()}</td>
                <td className="py-4 text-gray-500 text-sm">{c.payment_method}</td>
                <td className="py-4 text-right space-x-2">
                  <button onClick={() => handleVerifyContribution(c.id, 'VERIFIED')} className="bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2 rounded-xl text-sm font-bold transition-colors">Verify</button>
                  <button onClick={() => handleVerifyContribution(c.id, 'REJECTED')} className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl text-sm font-bold transition-colors">Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
