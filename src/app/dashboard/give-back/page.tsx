"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/Card';
import { createClient } from '@/utils/supabase/client';

export default function GiveBackPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('projects').select('*').eq('status', 'ACTIVE');
        if (data) {
          setProjects(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Give Back</h1>
        <p className="text-gray-500 text-sm">Join fellow alumni in funding critical infrastructure projects, scholarships, and resources.</p>
      </div>

      <div className="bg-maroon/5 rounded-[2rem] p-6 mb-8 border border-maroon/10 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Leave a Legacy</h3>
          <p className="text-gray-600 text-sm">Adyel shaped who we are today.</p>
        </div>
        <div className="hidden md:block bg-white text-maroon font-bold px-4 py-2 rounded-xl shadow-sm border border-maroon/20">
          Over UGX 50M raised!
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-gray-500">
          Loading campaigns...
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-16 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No active projects</h3>
          <p className="text-gray-500">There are currently no fundraising campaigns. Check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => {
            const percent = Math.min(100, Math.round((project.raised_amount / project.goal_amount) * 100));
            
            return (
              <Link href={`/dashboard/give-back/${project.id}`} key={project.id} className="block group">
                <div className="bg-white rounded-[2rem] shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-gray-100 h-full flex flex-col overflow-hidden">
                  
                  {/* Image Placeholder */}
                  <div className="h-48 bg-gray-100 relative overflow-hidden">
                    {project.image_url ? (
                      <img src={project.image_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-maroon/5 text-maroon group-hover:scale-105 transition-transform duration-500">
                        <svg className="w-16 h-16 opacity-20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path></svg>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white px-3 py-1.5 text-[10px] font-bold rounded-full shadow-sm tracking-wider uppercase">
                      {project.status === 'ACTIVE' ? (
                        <span className="text-green-600 flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse"></span> Funding Open</span>
                      ) : (
                        <span className="text-gray-600">Goal Reached</span>
                      )}
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-maroon transition-colors leading-tight">{project.title}</h3>
                    <p className="text-gray-500 mb-6 flex-1 line-clamp-2 text-sm leading-relaxed">{project.description}</p>
                    
                    {/* Progress Bar */}
                    <div className="mt-auto">
                      <div className="flex justify-between items-end mb-2">
                        <div className="text-sm">
                          <span className="font-bold text-gray-900">UGX {Number(project.raised_amount).toLocaleString()}</span>
                          <span className="text-gray-500 ml-1">raised</span>
                        </div>
                        <span className="text-sm font-bold text-maroon">{percent}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mb-3">
                        <div className="bg-maroon h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${percent}%` }}></div>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-400 font-bold uppercase tracking-wider">
                        <span>Goal: UGX {Number(project.goal_amount).toLocaleString()}</span>
                        {project.deadline && <span>Ends: {new Date(project.deadline).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
