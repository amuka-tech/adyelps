"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/Card';
import { Button } from '@/components/Button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const [project, setProject] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  // Donation Form
  const [amount, setAmount] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchProjectData = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
        setDonations(data.donations);
        setUpdates(data.updates || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
    // Check if user is logged in
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => data && setSession(data.user))
      .catch(() => {});
  }, [id]);

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      alert("Please log in to make a donation.");
      router.push('/login');
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch(`/api/projects/${id}/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount), is_anonymous: isAnonymous })
      });
      
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setAmount('');
        setIsAnonymous(false);
        fetchProjectData(); // Refresh UI
      } else {
        alert(data.error || "Failed to process donation.");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-20 text-center text-gray-500">
        Loading project details...
      </div>
    );
  }

  if (!project) {
    return <div className="p-20 text-center text-xl text-gray-500">Project not found.</div>;
  }

  const percent = Math.min(100, Math.round((project.raised_amount / project.goal_amount) * 100));

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-6">
        <Link href="/dashboard/give-back" className="text-gray-500 hover:text-maroon text-sm font-bold flex items-center mb-4 transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Campaigns
        </Link>
      </div>
        
      <div className="flex flex-col xl:flex-row gap-8">
        
        {/* Main Content (Left) */}
        <div className="xl:w-2/3 space-y-8">
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            {project.image_url ? (
              <div className="h-64 sm:h-80 md:h-96 w-full relative">
                <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-48 md:h-64 bg-maroon/5 flex items-center justify-center text-maroon">
                <svg className="w-20 h-20 opacity-20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path></svg>
              </div>
            )}
            <div className="p-8 md:p-10">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-100 px-3 py-1.5 rounded-full shadow-sm">School Project</span>
                {project.deadline && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full shadow-sm">
                    Deadline: {new Date(project.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">{project.title}</h1>
              
              <div className="prose text-gray-600 whitespace-pre-wrap leading-relaxed">
                {project.description}
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-100 flex items-center">
                <div className="w-12 h-12 bg-pink/50 text-maroon rounded-full flex items-center justify-center font-bold text-sm uppercase mr-4 shadow-sm border border-maroon/10">
                  {project.first_name[0]}{project.last_name[0]}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Campaign Manager</p>
                  <p className="text-sm font-bold text-gray-900">{project.first_name} {project.last_name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Project Updates Timeline */}
          {updates && updates.length > 0 && (
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 md:p-10 mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <svg className="w-6 h-6 mr-3 text-maroon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Project Updates
              </h2>
              
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {updates.map((update: any) => (
                  <div key={update.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-maroon text-white shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group-hover:border-maroon/30 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-gray-900">{update.title}</span>
                      </div>
                      <time className="block mb-4 text-xs font-bold text-maroon uppercase tracking-wider">
                        {new Date(update.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </time>
                      <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                        {update.content}
                      </div>
                      {update.image_url && (
                        <div className="mt-4 rounded-xl overflow-hidden h-40">
                          <img src={update.image_url} alt={update.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar (Right) */}
        <div className="xl:w-1/3 space-y-6">
          
          {/* Donation Card */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 sticky top-8">
            <div className="mb-6">
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-extrabold text-gray-900 leading-none">UGX {Number(project.raised_amount).toLocaleString()}</span>
                <span className="text-lg font-bold text-maroon">{percent}%</span>
              </div>
              <p className="text-sm font-medium text-gray-500 mb-6">raised of UGX {Number(project.goal_amount).toLocaleString()} goal</p>
              
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden mb-3">
                <div className="bg-maroon h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${percent}%` }}></div>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider text-right">{donations.length} total donations</p>
            </div>

            <hr className="border-gray-100 my-8" />

            <form onSubmit={handleDonate} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Select Donation Amount</label>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[50000, 100000, 500000].map(preset => (
                    <button 
                      key={preset} 
                      type="button" 
                      onClick={() => setAmount(preset.toString())}
                      className={`py-3 text-sm font-bold rounded-xl border-2 transition-all ${amount === preset.toString() ? 'bg-pink/20 text-maroon border-maroon shadow-sm' : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-maroon/30 hover:bg-white'}`}
                    >
                      {preset / 1000}k
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 font-bold text-sm">UGX</span>
                  </div>
                  <input 
                    type="number" 
                    required 
                    min="1000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-14 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-maroon focus:border-maroon font-bold text-gray-900 bg-gray-50 focus:bg-white transition-colors outline-none" 
                    placeholder="Custom amount" 
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isAnonymous} 
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="text-maroon focus:ring-maroon rounded mr-3 w-4 h-4 accent-maroon" 
                  />
                  <span className="text-sm font-bold text-gray-700">Make my donation anonymous</span>
                </label>
              </div>

              <button type="submit" className="w-full bg-maroon text-white font-bold py-4 rounded-xl shadow-md shadow-maroon/20 hover:bg-maroon-dark transition-all disabled:opacity-50" disabled={processing || project.status !== 'ACTIVE'}>
                {processing ? 'Processing...' : 'Contribute Now'}
              </button>
            </form>
          </div>

          {/* Leaderboard Card */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50/50 p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 flex items-center">
                <svg className="w-5 h-5 text-yellow-400 mr-2 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                Donor Leaderboard
              </h3>
            </div>
            <div className="p-0">
              {donations.length === 0 ? (
                <p className="text-sm font-medium text-gray-500 text-center py-8">Be the first to donate to this project!</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {donations.map((d, idx) => (
                    <li key={d.id} className="p-5 flex items-center hover:bg-gray-50 transition-colors">
                      <div className="w-8 font-extrabold text-gray-300 text-lg">{idx + 1}</div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 leading-tight">{d.first_name} {d.last_name}</p>
                        {d.class_year && <p className="text-xs font-medium text-gray-500 mt-0.5">Class of {d.class_year}</p>}
                      </div>
                      <div className="text-right font-bold text-maroon">
                        UGX {Number(d.amount).toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
