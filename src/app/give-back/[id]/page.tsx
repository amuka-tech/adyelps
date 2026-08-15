"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/Card';
import { Button } from '@/components/Button';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [project, setProject] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  // Donation Form
  const [amount, setAmount] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchProjectData = async () => {
    try {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      if (projectData) setProject(projectData);

      const { data: donationsData } = await supabase
        .from('project_donations')
        .select('*, users(first_name, last_name)')
        .eq('project_id', id)
        .order('created_at', { ascending: false });
      if (donationsData) setDonations(donationsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
    import('@/utils/supabase/client').then(({ createClient }) => {
      const supabase = createClient();
      supabase.auth.getSession().then(({ data: { session: s } }) => {
        if (s) setSession(s.user);
      });
    });
  }, [id]);

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      alert("Please log in to make a donation.");
      window.location.href = '/login';
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
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-10 h-10 border-4 border-maroon border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project) {
    return <div className="p-20 text-center text-xl text-gray-500">Project not found.</div>;
  }

  const percent = Math.min(100, Math.round((project.raised_amount / project.goal_amount) * 100));

  return (
    <div className="flex flex-col w-full bg-gray-50 min-h-[calc(100vh-80px)] py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content (Left) */}
          <div className="lg:w-2/3 space-y-8">
            <Card className="overflow-hidden border-none shadow-sm">
              {project.image_url ? (
                <div className="h-64 sm:h-80 md:h-96 w-full relative">
                  <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-48 md:h-64 bg-darkblue flex items-center justify-center text-white">
                  <svg className="w-20 h-20 opacity-20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path></svg>
                </div>
              )}
              <CardContent className="p-8">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-green-700 bg-green-100 px-3 py-1 rounded-full">School Project</span>
                  {project.deadline && (
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      Deadline: {new Date(project.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{project.title}</h1>
                
                <div className="prose prose-lg text-gray-700 max-w-none">
                  {project.description.split('\n').map((paragraph: string, idx: number) => (
                    <p key={idx} className="mb-4">{paragraph}</p>
                  ))}
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold uppercase mr-4">
                    {project.first_name[0]}{project.last_name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Campaign Manager</p>
                    <p className="text-sm text-gray-500">{project.first_name} {project.last_name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar (Right) */}
          <div className="lg:w-1/3 space-y-6">
            
            {/* Donation Card */}
            <Card className="sticky top-24 border-maroon/20 shadow-lg shadow-maroon/5">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-3xl font-bold text-gray-900">UGX {Number(project.raised_amount).toLocaleString()}</span>
                    <span className="text-lg font-bold text-maroon">{percent}%</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">raised of UGX {Number(project.goal_amount).toLocaleString()} goal</p>
                  
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden mb-2">
                    <div className="bg-maroon h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: `${percent}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 font-medium text-right">{donations.length} total donations</p>
                </div>

                <hr className="border-gray-100 my-6" />

                <form onSubmit={handleDonate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Donation Amount (UGX)</label>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[50000, 100000, 500000].map(preset => (
                        <button 
                          key={preset} 
                          type="button" 
                          onClick={() => setAmount(preset.toString())}
                          className={`py-2 text-sm font-medium rounded border ${amount === preset.toString() ? 'bg-maroon text-white border-maroon' : 'bg-white text-gray-600 border-gray-300 hover:border-maroon'}`}
                        >
                          {preset / 1000}k
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">UGX</span>
                      </div>
                      <input 
                        type="number" 
                        required 
                        min="1000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-maroon focus:border-maroon font-medium text-gray-900" 
                        placeholder="Custom amount" 
                      />
                    </div>
                  </div>

                  <label className="flex items-center mt-4">
                    <input 
                      type="checkbox" 
                      checked={isAnonymous} 
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="text-maroon focus:ring-maroon rounded mr-3" 
                    />
                    <span className="text-sm text-gray-700">Make my donation anonymous</span>
                  </label>

                  <Button type="submit" className="w-full py-4 text-lg font-bold shadow-md shadow-maroon/20" disabled={processing || project.status !== 'ACTIVE'}>
                    {processing ? 'Processing...' : 'Contribute Now'}
                  </Button>
                  {!session && (
                    <p className="text-xs text-center text-red-500 font-medium mt-2">You will be redirected to log in first.</p>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Leaderboard Card */}
            <Card>
              <CardHeader className="bg-gray-50 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  Donor Leaderboard
                </h3>
              </CardHeader>
              <CardContent className="p-0">
                {donations.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">Be the first to donate to this project!</p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {donations.map((d, idx) => (
                      <li key={d.id} className="p-4 flex items-center hover:bg-gray-50 transition-colors">
                        <div className="w-8 font-bold text-gray-300 text-lg">{idx + 1}</div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">{d.first_name} {d.last_name}</p>
                          {d.class_year && <p className="text-xs text-gray-500">Class of {d.class_year}</p>}
                        </div>
                        <div className="text-right font-bold text-maroon">
                          UGX {Number(d.amount).toLocaleString()}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
