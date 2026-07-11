"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';

export default function ContributePage({ params }: { params: { id: string } }) {
  const obituaryId = params.id;
  const router = useRouter();

  const [obituary, setObituary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [contributionForm, setContributionForm] = useState({
    amount_gross: '',
    payment_method: 'MOBILE_MONEY'
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/welfare/obituaries/${obituaryId}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setObituary(data.obituary);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [obituaryId]);

  const handleLogContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    if (obituary?.contribution_expiry && new Date() > new Date(obituary.contribution_expiry)) {
      alert("This contribution link has expired.");
      setSubmitting(false);
      return;
    }

    const res = await fetch(`/api/welfare/ledger/${obituaryId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ obituary_id: obituaryId, ...contributionForm })
    });
    setSubmitting(false);

    if (res.ok) {
      alert("Contribution logged! It will appear on the ledger once verified by the Treasurer.");
      router.push(`/dashboard/welfare/${obituaryId}`);
    } else {
      if (res.status === 401) {
        alert("Please log in to contribute.");
        router.push('/login');
      } else {
        alert("Failed to log contribution.");
      }
    }
  };

  if (loading) return <div className="p-20 text-center">Loading...</div>;
  if (!obituary) return <div className="p-20 text-center text-red-500">Obituary not found.</div>;

  const isExpired = obituary.contribution_expiry && new Date() > new Date(obituary.contribution_expiry);

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <button onClick={() => router.push(`/dashboard/welfare/${obituaryId}`)} className="text-gray-500 hover:text-maroon text-sm font-bold flex items-center mb-4 transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Obituary
        </button>
      </div>

      <Card className="shadow-2xl border-0 overflow-hidden">
        <div className="bg-maroon p-6 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9ImN1cnJlbnRDb2xvciIvPjwvc3ZnPg==')]"></div>
          <h1 className="text-2xl font-bold relative z-10 mb-1">Send Contribution</h1>
          <p className="text-pink/90 relative z-10">Supporting the family of {obituary.deceased_name}</p>
        </div>
        
        <CardContent className="p-8 bg-gray-50">
          {isExpired ? (
            <div className="text-center py-10 bg-red-50 border border-red-100 rounded-xl">
              <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Contribution Period Closed</h2>
              <p className="text-gray-600">This contribution link expired on {new Date(obituary.contribution_expiry).toLocaleString()}.</p>
              <Button onClick={() => router.push(`/dashboard/welfare/${obituaryId}`)} className="mt-6 bg-white text-gray-800 border border-gray-300 hover:bg-gray-100">
                Return to Obituary
              </Button>
            </div>
          ) : obituary.status !== 'ACTIVE' ? (
            <div className="text-center py-10 bg-gray-200 border border-gray-300 rounded-xl">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Fund is Closed</h2>
              <p className="text-gray-600">The welfare fund for this obituary is currently {obituary.status}.</p>
            </div>
          ) : (
            <form onSubmit={handleLogContribution} className="space-y-6">
              {obituary.contribution_expiry && (
                <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-xl flex items-start text-sm">
                  <svg className="w-5 h-5 text-blue-500 mr-2 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <div>
                    <strong>Time Sensitive:</strong> This contribution link will automatically expire on {new Date(obituary.contribution_expiry).toLocaleString()}.
                  </div>
                </div>
              )}

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Payment Method</label>
                  <select 
                    value={contributionForm.payment_method} 
                    onChange={e => setContributionForm({...contributionForm, payment_method: e.target.value})} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-maroon/20 outline-none bg-gray-50"
                  >
                    <option value="MOBILE_MONEY">Mobile Money</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Amount Sent (Gross UGX)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-500 font-bold">UGX</span>
                    <input 
                      type="number" 
                      required
                      min="1000"
                      value={contributionForm.amount_gross} 
                      onChange={e => setContributionForm({...contributionForm, amount_gross: e.target.value})} 
                      placeholder="e.g. 50000"
                      className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-maroon/20 outline-none bg-gray-50 font-bold text-lg"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Enter the exact amount you sent. The system will automatically calculate standard taxes and withdrawal fees for the public ledger.
                  </p>
                </div>
              </div>
              
              <Button type="submit" size="lg" className="w-full bg-pink hover:bg-pink-dark text-white shadow-xl text-lg h-14" disabled={submitting}>
                {submitting ? 'Processing...' : 'Submit Contribution'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
