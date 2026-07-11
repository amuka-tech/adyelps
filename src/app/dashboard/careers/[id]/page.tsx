"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Referral Modal
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralMessage, setReferralMessage] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [jobRes, sessionRes] = await Promise.all([
          fetch(`/api/careers/jobs/${params.id}`),
          fetch('/api/auth/me')
        ]);
        
        if (jobRes.ok) setJob((await jobRes.json()).job);
        if (sessionRes.ok) setCurrentUser((await sessionRes.json()).user);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

  const handleRequestReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequesting(true);
    try {
      const res = await fetch(`/api/careers/jobs/${params.id}/referral`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: referralMessage })
      });
      
      if (res.ok) {
        setShowReferralModal(false);
        alert("Referral request sent successfully! The job poster has been notified.");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to request referral");
      }
    } catch (err) {
      console.error(err);
      alert("Error requesting referral");
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return <div className="p-20 text-center">Loading job details...</div>;
  if (!job) return <div className="p-20 text-center">Job not found or has expired.</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <button onClick={() => router.push('/dashboard/careers')} className="text-gray-500 hover:text-maroon text-sm font-bold flex items-center mb-4 transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Job Board
        </button>
      </div>

        <Card className="border-t-4 border-t-maroon overflow-hidden">
          <CardContent className="p-0">
            {/* Header Section */}
            <div className="bg-white p-8 md:p-10 border-b border-gray-100">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                  <p className="text-xl text-gray-700 font-medium">{job.company}</p>
                </div>
                
                <div className="flex flex-col gap-3 md:items-end">
                  {job.application_link && (
                    <a href={job.application_link} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
                      <Button className="w-full md:w-auto shadow-md">Apply Now (External)</Button>
                    </a>
                  )}
                  {job.offers_referral && currentUser?.id !== job.posted_by_id && (
                    <Button variant="outline" className="w-full md:w-auto border-maroon text-maroon hover:bg-maroon hover:text-white transition-colors" onClick={() => setShowReferralModal(true)}>
                      Request a Referral
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <span className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-md text-sm font-medium flex items-center">
                  <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  {job.job_type.replace('_', ' ')}
                </span>
                <span className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-md text-sm font-medium flex items-center">
                  <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  {job.location}
                </span>
                <span className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-md text-sm font-medium flex items-center">
                  <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                  {job.industry}
                </span>
              </div>
            </div>

            {/* Poster Info */}
            <div className="bg-blue-50/50 px-8 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-darkblue text-white rounded-full flex items-center justify-center font-bold text-sm uppercase">
                  {job.first_name[0]}{job.last_name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Posted by {job.first_name} {job.last_name}</p>
                  <p className="text-xs text-gray-500">{new Date(job.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              {job.offers_referral && (
                <div className="text-right hidden sm:block">
                  <span className="bg-green-100 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-bold">
                    Referral Available
                  </span>
                </div>
              )}
            </div>

            {/* Main Details */}
            <div className="p-8 md:p-10 space-y-8 bg-white">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements & Qualifications</h2>
                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-6 rounded-xl border border-gray-100">
                  {job.requirements}
                </div>
              </div>
            </div>
            
          </CardContent>
        </Card>

      {/* Referral Modal */}
      {showReferralModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">Request a Referral</h3>
              <button onClick={() => setShowReferralModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6">
                <p className="text-sm text-blue-800">
                  You are requesting a referral from <strong>{job.first_name} {job.last_name}</strong> for the <strong>{job.title}</strong> role at <strong>{job.company}</strong>.
                </p>
              </div>
              <form onSubmit={handleRequestReferral} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Message to Poster (Optional)</label>
                  <textarea 
                    rows={4}
                    value={referralMessage} 
                    onChange={e => setReferralMessage(e.target.value)} 
                    placeholder="Briefly explain why you're a good fit, or ask them a question about the role..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-maroon"
                  ></textarea>
                </div>
                <div className="pt-2">
                  <Button type="submit" className="w-full shadow-lg" disabled={requesting}>
                    {requesting ? 'Sending Request...' : 'Send Request'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
