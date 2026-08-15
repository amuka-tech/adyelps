"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function MentorshipHub() {
  const [activeTab, setActiveTab] = useState('find');
  const [loading, setLoading] = useState(true);
  const [mentors, setMentors] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [myProfile, setMyProfile] = useState<any>(null);
  
  // Profile Form State
  const [industry, setIndustry] = useState('');
  const [bio, setBio] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [maxMentees, setMaxMentees] = useState(3);
  const [savingProfile, setSavingProfile] = useState(false);

  // Request Form State
  const [requestModal, setRequestModal] = useState<any>(null);
  const [requestGoals, setRequestGoals] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      const [mentorsRes, reqsRes, profileRes] = await Promise.all([
        supabase.from('mentors').select('*, users(*)'),
        supabase.from('mentorship_requests').select('*'),
        session ? supabase.from('users').select('*').eq('id', session.user.id).single() : { data: null }
      ]);
      
      if (mentorsRes.data) setMentors(mentorsRes.data);
      if (reqsRes.data) setMyRequests(reqsRes.data);
      if (profileRes.data) {
        setMyProfile(profileRes.data);
        setIndustry(profileRes.data.industry || '');
        setBio(profileRes.data.bio || '');
        setSkillsStr(profileRes.data.skills?.join(', ') || '');
        setMaxMentees(profileRes.data.max_mentees || 3);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.from('mentors').upsert({
        user_id: session.user.id,
        expertise: industry,
        bio,
        max_mentees: maxMentees,
        is_active: true,
      }, { onConflict: 'user_id' });

      if (error) {
        alert('Failed to save profile: ' + error.message);
      } else {
        alert('Mentor profile saved successfully!');
        fetchData();
        setActiveTab('find');
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRequestMentorship = async () => {
    if (!requestGoals) return alert("Please specify your goals.");
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.from('mentorship_requests').insert({
        mentor_id: requestModal.id,
        mentee_id: session.user.id,
        message: requestGoals,
        status: 'PENDING',
      });

      if (error) {
        alert(error.message);
      } else {
        alert("Request sent successfully!");
        setRequestModal(null);
        setRequestGoals('');
        fetchData();
        setActiveTab('requests');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRespondRequest = async (requestId: number, status: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('mentorship_requests')
        .update({ status })
        .eq('id', requestId);

      if (error) {
        alert('Failed to update request.');
      } else {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-gray-500 font-medium">Loading Mentorship Hub...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">E-Learning & Mentorship</h1>
        <p className="text-gray-500 text-sm">Find a mentor to guide your career, or become one to give back to the Adyel community.</p>
      </div>

      {/* TABS */}
      <div className="flex bg-white rounded-2xl p-1 mb-8 shadow-sm border border-gray-100 max-w-2xl">
        <button 
          onClick={() => setActiveTab('find')} 
          className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'find' ? 'bg-maroon text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Find a Mentor
        </button>
        <button 
          onClick={() => setActiveTab('requests')} 
          className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'requests' ? 'bg-maroon text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          My Mentorships
        </button>
        <button 
          onClick={() => setActiveTab('profile')} 
          className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'profile' ? 'bg-maroon text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Become a Mentor
        </button>
      </div>

      {/* TAB: FIND MENTOR */}
      {activeTab === 'find' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500">No mentors available at the moment. Be the first to become one!</div>
          ) : (
            mentors.map((mentor) => (
              <Card key={mentor.profile_id} className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 text-maroon rounded-full flex items-center justify-center font-bold text-lg">
                        {mentor.firstName[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{mentor.firstName} {mentor.lastName}</h3>
                        <p className="text-xs text-gray-500">{mentor.job_title} at {mentor.company}</p>
                      </div>
                    </div>
                    {mentor.matchScore > 0 && (
                      <span className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full border border-green-100">
                        Strong Match
                      </span>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <span className="inline-block bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider mb-2">
                      {mentor.industry}
                    </span>
                    <p className="text-sm text-gray-600 line-clamp-3">{mentor.bio}</p>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-6">
                    {mentor.skills?.map((s: string, i: number) => (
                      <span key={i} className="bg-gray-50 text-gray-600 border border-gray-100 text-xs px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>

                  <Button 
                    onClick={() => setRequestModal(mentor)}
                    className="w-full bg-maroon hover:bg-maroon-dark text-white rounded-xl py-2.5 text-sm font-bold shadow-sm"
                  >
                    Request Mentorship
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* REQUEST MODAL */}
      {requestModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Request Mentorship</h2>
            <p className="text-sm text-gray-500 mb-6">You are requesting mentorship from <span className="font-bold">{requestModal.firstName} {requestModal.lastName}</span>.</p>
            
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">What are your goals?</label>
              <textarea 
                rows={4}
                value={requestGoals}
                onChange={e => setRequestGoals(e.target.value)}
                placeholder="E.g., I'd like to learn more about system design and prepare for senior roles..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-maroon/20 outline-none"
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setRequestModal(null)} variant="outline" className="flex-1 rounded-xl">Cancel</Button>
              <Button onClick={handleRequestMentorship} className="flex-1 bg-maroon hover:bg-maroon-dark text-white rounded-xl">Send Request</Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: MY MENTORSHIPS */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 min-h-[400px]">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Active Engagements & Requests</h2>
          
          {myRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">You don't have any active mentorships or pending requests.</div>
          ) : (
            <div className="space-y-4">
              {myRequests.map((req) => (
                <div key={req.id} className="border border-gray-100 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-gray-200 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        req.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border border-green-100' : 
                        req.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' : 
                        'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        {req.status}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">Requested on {new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    <h3 className="font-bold text-gray-900 text-lg">
                      Mentor: <span className="text-maroon">{req.mentor_firstName} {req.mentor_lastName}</span>
                      <span className="text-gray-300 mx-2">|</span>
                      Mentee: <span className="text-blue-600">{req.mentee_firstName} {req.mentee_lastName}</span>
                    </h3>
                    <p className="text-sm text-gray-600 mt-2"><span className="font-bold text-gray-700">Goals:</span> {req.goals}</p>
                  </div>

                  {/* If current user is the mentor and status is PENDING, show Accept/Decline */}
                  {req.status === 'PENDING' && myProfile && req.mentor_id === myProfile.user_id && (
                    <div className="flex gap-2 w-full md:w-auto">
                      <Button onClick={() => handleRespondRequest(req.id, 'ACTIVE')} className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm px-6">Accept</Button>
                      <Button onClick={() => handleRespondRequest(req.id, 'DECLINED')} className="bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl text-sm px-6 border border-red-100">Decline</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: BECOME A MENTOR */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-maroon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              Mentor Profile
            </h2>
            <p className="text-sm text-gray-500 mt-1">Fill out your profile to start receiving mentorship requests from other alumni.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Industry</label>
              <input 
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Technology, Finance, Healthcare"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-maroon/20 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Skills / Expertise (Comma separated)</label>
              <input 
                required
                value={skillsStr}
                onChange={(e) => setSkillsStr(e.target.value)}
                placeholder="e.g. React, Leadership, Public Speaking"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-maroon/20 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Maximum Mentees</label>
              <select 
                value={maxMentees}
                onChange={(e) => setMaxMentees(parseInt(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-maroon/20 outline-none"
              >
                <option value={1}>1 Mentee</option>
                <option value={3}>3 Mentees</option>
                <option value={5}>5 Mentees</option>
                <option value={10}>10 Mentees</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Bio & Approach</label>
              <textarea 
                required
                rows={5}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Describe your career journey and how you plan to help mentees..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-maroon/20 outline-none"
              />
            </div>

            <Button 
              type="submit" 
              disabled={savingProfile}
              className="w-full bg-maroon hover:bg-maroon-dark text-white rounded-xl py-3 text-sm font-bold shadow-md shadow-maroon/20"
            >
              {savingProfile ? 'Saving...' : (myProfile ? 'Update Mentor Profile' : 'Publish Mentor Profile')}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
