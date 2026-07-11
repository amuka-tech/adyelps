"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/Card';

export default function GiveBackPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('/api/public/projects');
        if (res.ok) {
          const data = await res.json();
          setProjects(data.projects);
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
    <div className="flex flex-col w-full bg-gray-50 min-h-[calc(100vh-80px)]">
      
      {/* Hero Section */}
      <section className="bg-darkblue py-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9ImN1cnJlbnRDb2xvciIvPjwvc3ZnPg==')]"></div>
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Leave a Legacy. Give Back.</h1>
          <p className="text-xl text-skyblue mb-8">
            Adyel Primary School shaped who we are today. Join fellow alumni in funding critical infrastructure projects, scholarships, and resources for the next generation.
          </p>
          <div className="inline-block bg-maroon/20 border border-maroon text-pink px-6 py-3 rounded-full font-medium">
            Over UGX 50M raised by alumni to date!
          </div>
        </div>
      </section>

      {/* Projects List */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Active Campaigns</h2>
              <p className="text-gray-600">Browse current projects that need your support.</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-maroon border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : projects.length === 0 ? (
            <Card className="text-center py-16 border-dashed">
              <CardContent>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No active projects</h3>
                <p className="text-gray-500">There are currently no fundraising campaigns. Check back later.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => {
                const percent = Math.min(100, Math.round((project.raised_amount / project.goal_amount) * 100));
                
                return (
                  <Link href={`/give-back/${project.id}`} key={project.id} className="block group">
                    <Card className="h-full flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 border-gray-200">
                      
                      {/* Image Placeholder */}
                      <div className="h-48 bg-gray-200 relative overflow-hidden">
                        {project.image_url ? (
                          <img src={project.image_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-darkblue text-white group-hover:scale-105 transition-transform duration-500">
                            <svg className="w-16 h-16 opacity-20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path></svg>
                          </div>
                        )}
                        <div className="absolute top-4 right-4 bg-white px-3 py-1 text-xs font-bold rounded-full shadow-sm">
                          {project.status === 'ACTIVE' ? (
                            <span className="text-green-600 flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-1.5 animate-pulse"></span> Funding Open</span>
                          ) : (
                            <span className="text-gray-600">Goal Reached</span>
                          )}
                        </div>
                      </div>

                      <CardContent className="flex-1 flex flex-col p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-maroon transition-colors">{project.title}</h3>
                        <p className="text-gray-600 mb-6 flex-1 line-clamp-2 text-sm">{project.description}</p>
                        
                        {/* Progress Bar */}
                        <div className="mt-auto">
                          <div className="flex justify-between items-end mb-2">
                            <div className="text-sm">
                              <span className="font-bold text-gray-900">UGX {Number(project.raised_amount).toLocaleString()}</span>
                              <span className="text-gray-500"> raised</span>
                            </div>
                            <span className="text-sm font-bold text-maroon">{percent}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <div className="bg-maroon h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${percent}%` }}></div>
                          </div>
                          <div className="flex justify-between items-center mt-3 text-xs text-gray-500 font-medium">
                            <span>Goal: UGX {Number(project.goal_amount).toLocaleString()}</span>
                            {project.deadline && <span>Ends: {new Date(project.deadline).toLocaleDateString()}</span>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
