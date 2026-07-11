"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function JobBoardPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (industry) queryParams.append('industry', industry);
      if (location) queryParams.append('location', location);
      if (jobType) queryParams.append('job_type', jobType);

      const res = await fetch(`/api/careers/jobs?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [industry, location, jobType]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Career Hub</h1>
          <p className="text-gray-500 text-sm">Exclusive job opportunities and referrals from fellow Adyelites.</p>
        </div>
        <Link href="/dashboard/careers/post" className="bg-maroon text-white font-medium text-sm px-6 py-2.5 rounded-full shadow-md shadow-maroon/20 hover:bg-maroon-dark transition-all flex items-center gap-2">
          Post a Job
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Filters</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Job Type</label>
                <select 
                  value={jobType} 
                  onChange={(e) => setJobType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon bg-gray-50 outline-none text-sm hover:bg-white transition-colors"
                >
                  <option value="">Any Type</option>
                  <option value="FULL_TIME">Full-Time</option>
                  <option value="PART_TIME">Part-Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="REMOTE">Remote</option>
                  <option value="INTERNSHIP">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Industry</label>
                <select 
                  value={industry} 
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon bg-gray-50 outline-none text-sm hover:bg-white transition-colors"
                >
                  <option value="">All Industries</option>
                  <option value="Technology">Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Location</label>
                <input 
                  type="text" 
                  placeholder="e.g. Kampala, London" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon bg-gray-50 outline-none text-sm hover:bg-white transition-colors"
                />
              </div>

              <button 
                className="w-full py-3 mt-2 text-xs font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                onClick={() => { setIndustry(''); setLocation(''); setJobType(''); }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Job Feed */}
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Active Opportunities
            </h2>
            <span className="text-gray-400 font-medium text-sm">{jobs.length} found</span>
          </div>

          {loading ? (
            <div className="py-20 text-center text-gray-500">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="py-20 text-center bg-white border border-gray-100 rounded-[2rem] shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </div>
              <p className="text-gray-500 text-sm mb-4">No active jobs found matching your criteria.</p>
              <button className="text-maroon font-bold text-sm" onClick={() => { setIndustry(''); setLocation(''); setJobType(''); }}>Clear Filters</button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map(job => (
                <Link href={`/dashboard/careers/${job.id}`} key={job.id} className="block group">
                  <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-maroon/20 transition-all hover:-translate-y-1">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-maroon transition-colors">{job.title}</h3>
                        <p className="text-gray-600 font-medium mb-4">{job.company}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-gray-50 text-gray-600 border border-gray-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">{job.job_type.replace('_', ' ')}</span>
                          <span className="bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">{job.location}</span>
                          <span className="bg-purple-50 text-purple-600 border border-purple-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">{job.industry}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-start md:items-end gap-3">
                        <span className="text-xs font-medium text-gray-400">Posted {new Date(job.created_at).toLocaleDateString()}</span>
                        {job.offers_referral ? (
                          <span className="bg-green-50 text-green-700 border border-green-100 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                            Referral Available
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
