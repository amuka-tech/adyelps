"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function PostJobPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    company: '',
    industry: 'Technology',
    location: '',
    job_type: 'FULL_TIME',
    description: '',
    requirements: '',
    application_link: '',
    offers_referral: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { error } = await supabase.from('jobs').insert({
        ...form,
        posted_by_id: session.user.id,
        status: 'PENDING'
      });
      
      if (!error) {
        alert("Job submitted successfully! It will appear on the board once approved by the admin team.");
        router.push('/dashboard/careers');
      } else {
        alert(error.message || "Failed to submit job");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-6">
        <Link href="/dashboard/careers" className="text-gray-500 hover:text-maroon text-sm font-bold flex items-center mb-4 transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Job Board
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Post a Job Opportunity</h1>
        <p className="text-gray-500 text-sm">Share an opening from your company with the LTC Alumni network.</p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden max-w-4xl">
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Job Title *</label>
                <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Senior Software Engineer" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon bg-gray-50 focus:bg-white transition-colors outline-none text-sm" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Company Name *</label>
                <input required type="text" value={form.company} onChange={e => setForm({...form, company: e.target.value})} placeholder="e.g. Google" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon bg-gray-50 focus:bg-white transition-colors outline-none text-sm" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Location *</label>
                <input required type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="e.g. Kampala, Uganda" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon bg-gray-50 focus:bg-white transition-colors outline-none text-sm" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Industry *</label>
                <select value={form.industry} onChange={e => setForm({...form, industry: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon bg-gray-50 focus:bg-white transition-colors outline-none text-sm">
                  <option value="Technology">Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Job Type *</label>
                <select value={form.job_type} onChange={e => setForm({...form, job_type: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon bg-gray-50 focus:bg-white transition-colors outline-none text-sm">
                  <option value="FULL_TIME">Full-Time</option>
                  <option value="PART_TIME">Part-Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="REMOTE">Remote</option>
                  <option value="INTERNSHIP">Internship</option>
                </select>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Job Description *</label>
              <textarea required rows={5} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe the role and responsibilities..." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon bg-gray-50 focus:bg-white transition-colors outline-none text-sm resize-none"></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Requirements *</label>
              <textarea required rows={4} value={form.requirements} onChange={e => setForm({...form, requirements: e.target.value})} placeholder="List the key qualifications and skills..." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon bg-gray-50 focus:bg-white transition-colors outline-none text-sm resize-none"></textarea>
            </div>

            <hr className="border-gray-100" />

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Application Link</label>
              <input type="url" value={form.application_link} onChange={e => setForm({...form, application_link: e.target.value})} placeholder="https://company.com/careers/job" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon bg-gray-50 focus:bg-white transition-colors outline-none text-sm" />
              <p className="text-xs text-gray-500 mt-2 font-medium">If blank, applicants will have to rely solely on referrals or contacting you directly.</p>
            </div>

            <div className="bg-pink/20 p-6 border-2 border-maroon/10 rounded-2xl flex items-start space-x-4 cursor-pointer hover:border-maroon/30 transition-colors" onClick={() => setForm({...form, offers_referral: !form.offers_referral})}>
              <input 
                type="checkbox" 
                checked={form.offers_referral}
                readOnly
                className="mt-1 w-5 h-5 text-maroon focus:ring-maroon rounded accent-maroon"
              />
              <div>
                <label className="font-bold text-gray-900 block cursor-pointer">I can provide a referral for this position</label>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                  Checking this box adds a "Request Referral" button to the job post. When members click it, you will receive an internal notification to review their profile and potentially refer them internally at your company.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button type="submit" disabled={submitting} className="bg-maroon text-white font-bold px-8 py-3 rounded-xl shadow-md shadow-maroon/20 hover:bg-maroon-dark transition-all disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit Job for Approval'}
              </button>
            </div>

          </form>
        </div>
      </div>

    </div>
  );
}
