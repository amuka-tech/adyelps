"use client";

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function AdminProjects({ projects, fetchData }: { projects: any[], fetchData: () => void }) {
  const [projectForm, setProjectForm] = useState({ title: '', description: '', goal_amount: '', image_url: '', deadline: '' });
  const [updateForm, setUpdateForm] = useState({ title: '', description: '', image_url: '', project_id: null as number | null });

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    const { error } = await supabase.from('projects').insert({ 
      title: projectForm.title,
      description: projectForm.description,
      goal_amount: parseFloat(projectForm.goal_amount),
      image_url: projectForm.image_url || null,
      deadline: projectForm.deadline || null
    });
    if (!error) { 
      alert('Project created!'); 
      setProjectForm({ title: '', description: '', goal_amount: '', image_url: '', deadline: '' }); 
      fetchData(); 
    } else {
      alert(error.message);
    }
  };

  const handlePostUpdate = async (e: React.FormEvent, projectId: number) => {
    e.preventDefault();
    const supabase = createClient();
    const { error } = await supabase.from('project_updates').insert({
      project_id: projectId,
      title: updateForm.title,
      description: updateForm.description,
      image_url: updateForm.image_url || null
    });
    if (!error) { 
      alert('Project update posted!'); 
      setUpdateForm({ title: '', description: '', image_url: '', project_id: null }); 
      fetchData(); 
    } else {
      alert(error.message);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6">Create New Project</h3>
      <form onSubmit={handleCreateProject} className="space-y-4 mb-10">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Project Title</label>
          <input required type="text" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-maroon/20 outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Goal Amount (UGX)</label>
            <input required type="number" value={projectForm.goal_amount} onChange={e => setProjectForm({...projectForm, goal_amount: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-maroon/20 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Deadline</label>
            <input type="date" value={projectForm.deadline} onChange={e => setProjectForm({...projectForm, deadline: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-maroon/20 outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Image URL</label>
          <input type="text" value={projectForm.image_url} onChange={e => setProjectForm({...projectForm, image_url: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-maroon/20 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
          <textarea required value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-maroon/20 outline-none" rows={3}></textarea>
        </div>
        <button type="submit" className="bg-maroon text-white font-medium px-6 py-3 rounded-xl hover:bg-maroon-dark transition-colors">Create Project</button>
      </form>

      <h3 className="text-xl font-bold text-gray-900 mb-4">Active Projects</h3>
      <div className="space-y-4">
        {projects.map(p => (
          <div key={p.id} className="p-6 border border-gray-100 rounded-2xl bg-white shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-lg text-gray-900">{p.title}</h4>
                <p className="text-sm text-gray-500">Goal: UGX {Number(p.goal_amount).toLocaleString()} • Raised: UGX {Number(p.raised_amount).toLocaleString()}</p>
                <div className="w-full bg-gray-100 rounded-full h-2 mt-2 max-w-sm">
                  <div className="bg-maroon h-2 rounded-full" style={{ width: `${Math.min((p.raised_amount / p.goal_amount) * 100, 100)}%` }}></div>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{p.status}</span>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mt-4">
              <h5 className="text-sm font-bold text-gray-700 mb-3">Post Milestone Update</h5>
              <form onSubmit={(e) => handlePostUpdate(e, p.id)} className="space-y-3">
                <input required type="text" placeholder="Update Title (e.g. Phase 1 Complete)" value={updateForm.project_id === p.id ? updateForm.title : ''} onChange={e => setUpdateForm({...updateForm, title: e.target.value, project_id: p.id})} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-maroon" />
                <textarea required placeholder="Describe the progress made..." value={updateForm.project_id === p.id ? updateForm.description : ''} onChange={e => setUpdateForm({...updateForm, description: e.target.value, project_id: p.id})} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-maroon" rows={2}></textarea>
                <div className="flex gap-2">
                  <input type="text" placeholder="Image URL (optional)" value={updateForm.project_id === p.id ? updateForm.image_url : ''} onChange={e => setUpdateForm({...updateForm, image_url: e.target.value, project_id: p.id})} className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-maroon" />
                  <button type="submit" className="bg-gray-900 text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-black transition-colors whitespace-nowrap">Post Update</button>
                </div>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
