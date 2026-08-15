"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/Card';
import { Button } from '@/components/Button';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function ObituaryDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const obituaryId = params.id;

  const [data, setData] = useState<any>(null);
  const [ledger, setLedger] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [condolenceMsg, setCondolenceMsg] = useState("");
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [contributionForm, setContributionForm] = useState({ amount_gross: '', payment_method: 'MOBILE_MONEY' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [obituaryId]);

  const fetchData = async () => {
    try {
      const supabase = createClient();
      const [obitRes, condRes, contrRes] = await Promise.all([
        supabase.from('obituaries').select('*').eq('id', obituaryId).single(),
        supabase.from('condolences').select('*').eq('obituary_id', obituaryId),
        supabase.from('contributions').select('*').eq('obituary_id', obituaryId)
      ]);

      if (obitRes.data) {
        setData({ obituary: obitRes.data, condolences: condRes.data || [] });
      }
      
      if (contrRes.data) {
        const totalGross = contrRes.data.reduce((acc: number, curr: any) => acc + Number(curr.amount_gross || curr.amount || 0), 0);
        setLedger({ 
          totalGross, totalDeductions: 0, netAmount: totalGross, totalDisbursed: 0, 
          contributionLog: contrRes.data 
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCondolence = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("Please log in to post a condolence.");
      router.push('/login');
      return;
    }
    
    const { error } = await supabase.from('condolences').insert({
      obituary_id: obituaryId,
      user_id: session.user.id,
      message: condolenceMsg,
      first_name: session.user.user_metadata?.first_name || '',
      last_name: session.user.user_metadata?.last_name || ''
    });
    setSubmitting(false);
    
    if (!error) {
      setCondolenceMsg("");
      fetchData(); // Refresh list
    } else {
      alert("Failed to post condolence.");
    }
  };

  if (loading) return <div className="p-20 text-center">Loading...</div>;
  if (!data || !data.obituary) return <div className="p-20 text-center">Obituary not found.</div>;

  const { obituary, condolences } = data;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <button onClick={() => router.push('/dashboard/welfare')} className="text-gray-500 hover:text-maroon text-sm font-bold flex items-center mb-4 transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Welfare Ledger
        </button>
      </div>
        
        {/* Top Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${obituary.status === 'ACTIVE' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'}`}>
                {obituary.status}
              </span>
              <span className="text-gray-500 text-sm">Posted {new Date(obituary.created_at).toLocaleDateString()}</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">{obituary.deceased_name}</h1>
          </div>
          {obituary.contribution_expiry && new Date(obituary.contribution_expiry) > new Date() && obituary.status === 'ACTIVE' && (
            <Link href={`/dashboard/welfare/${obituary.id}/contribute`} className="mt-4 md:mt-0">
              <Button className="shadow-lg bg-pink hover:bg-pink-dark">
                Send Contribution
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Details & Condolences */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardContent className="p-6 md:p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 border-b border-gray-100 pb-2">Biography</h3>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{obituary.biography}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1 text-maroon uppercase tracking-wide">Funeral Program</h3>
                    <p className="text-gray-700 whitespace-pre-wrap text-sm">{obituary.funeral_dates_venues}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1 text-maroon uppercase tracking-wide">Spokesperson Contact</h3>
                    <p className="text-gray-700 text-sm">{obituary.spokesperson_contact}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-xl font-bold text-gray-900">Condolence Board</h3>
                <p className="text-sm text-gray-500">Leave a message of support for the family.</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePostCondolence} className="mb-8">
                  <textarea 
                    rows={3} 
                    required
                    value={condolenceMsg}
                    onChange={(e) => setCondolenceMsg(e.target.value)}
                    placeholder="Write your message here..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-maroon focus:border-maroon mb-3"
                  ></textarea>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={submitting}>
                      {submitting ? 'Posting...' : 'Post Message'}
                    </Button>
                  </div>
                </form>

                <div className="space-y-4">
                  {condolences.length === 0 ? (
                    <p className="text-gray-500 text-center py-6">No messages yet. Be the first to leave a condolence.</p>
                  ) : (
                    condolences.map((c: any) => (
                      <div key={c.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-8 h-8 bg-skyblue/20 text-darkblue rounded-full flex items-center justify-center font-bold text-xs uppercase">
                            {c.first_name[0]}{c.last_name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-900">{c.first_name} {c.last_name}</p>
                            <p className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm">{c.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Ledger Dashboard */}
          <div className="space-y-6">
            <Card className="border-2 border-gray-200 shadow-md">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-maroon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                  Live Ledger
                </h3>
              </CardHeader>
              <CardContent className="p-6">
                
                <div className="mb-4 text-sm text-gray-500">
                  Collections are based on freewill contributions.
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <span className="text-gray-600 font-medium">Gross Contributions</span>
                    <span className="font-bold text-gray-900">UGX {ledger?.totalGross.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex flex-col p-3 rounded-lg bg-red-50 border border-red-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-red-600 font-medium text-sm flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Automated Deductions
                      </span>
                      <span className="font-bold text-red-600 text-sm">- UGX {ledger?.totalDeductions.toLocaleString()}</span>
                    </div>
                    {ledger?.deductionsBreakdown?.map((d: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-xs text-red-500 pl-5">
                        <span>{d.name}</span>
                        <span>- {d.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center p-4 rounded-lg bg-green-50 border-2 border-green-200 shadow-inner mt-4">
                    <span className="text-green-800 font-bold text-lg">Net Available</span>
                    <span className="font-extrabold text-green-700 text-xl">UGX {ledger?.netAmount.toLocaleString()}</span>
                  </div>
                </div>

                {ledger?.totalDisbursed > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-bold text-gray-900 mb-2">Disbursement Record</h4>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Funds Sent to Family</span>
                      <span className="font-bold">UGX {ledger.totalDisbursed.toLocaleString()}</span>
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>

            {/* Contribution Log */}
            <Card className="shadow-sm border border-gray-100">
              <CardHeader className="bg-gray-50 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Contribution Log</h3>
                <p className="text-xs text-gray-500">Verified community contributions</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[400px] overflow-y-auto">
                  {ledger?.contributionLog?.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-500">No verified contributions yet.</div>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {ledger?.contributionLog?.map((log: any) => (
                        <li key={log.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase">
                              {log.first_name?.[0]}{log.last_name?.[0]}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{log.first_name} {log.last_name}</p>
                              <p className="text-xs text-gray-500">{new Date(log.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">UGX {parseFloat(log.amount_gross).toLocaleString()}</p>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{log.payment_method.replace('_', ' ')}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
    </div>
  );
}
