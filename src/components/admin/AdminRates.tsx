"use client";

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function AdminRates({ rates, fetchData }: { rates: any[], fetchData: () => void }) {
  const [rateForm, setRateForm] = useState({ name: '', rate_type: 'PERCENTAGE', amount: '' });

  const handleCreateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    const { error } = await supabase.from('deduction_rates').insert({ 
      name: rateForm.name, 
      rate_type: rateForm.rate_type, 
      amount: parseFloat(rateForm.amount) 
    });
    if (!error) { 
      alert('Tax Rate added!'); 
      setRateForm({ name: '', rate_type: 'PERCENTAGE', amount: '' }); 
      fetchData(); 
    } else {
      alert(error.message);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6">Manage Deduction Rates</h3>
      <form onSubmit={handleCreateRate} className="space-y-4 mb-10 border border-gray-100 p-6 rounded-2xl bg-gray-50">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Rate Name</label>
            <input required type="text" placeholder="e.g. Platform Fee" value={rateForm.name} onChange={e => setRateForm({...rateForm, name: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Type</label>
            <select required value={rateForm.rate_type} onChange={e => setRateForm({...rateForm, rate_type: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none bg-white">
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FLAT">Flat Amount (UGX)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Amount / Value</label>
            <input required type="number" step="0.01" value={rateForm.amount} onChange={e => setRateForm({...rateForm, amount: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none" />
          </div>
        </div>
        <button type="submit" className="bg-gray-900 text-white font-medium px-6 py-2 rounded-lg hover:bg-black transition-colors">Add Rate</button>
      </form>

      <table className="w-full text-left">
        <thead>
          <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
            <th className="pb-4 font-semibold">Name</th>
            <th className="pb-4 font-semibold">Type</th>
            <th className="pb-4 font-semibold">Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rates.map(r => (
            <tr key={r.id}>
              <td className="py-4 font-bold text-gray-900">{r.name}</td>
              <td className="py-4 text-sm text-gray-600">{r.rate_type}</td>
              <td className="py-4 text-sm font-medium text-maroon">{r.rate_type === 'PERCENTAGE' ? `${r.amount}%` : `UGX ${r.amount}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
