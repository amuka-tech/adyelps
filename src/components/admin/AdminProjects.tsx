"use client";

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function AdminProjects({ projects, fetchData }: { projects: any[], fetchData: () => void }) {
  const [projectForm, setProjectForm] = useState({ title: '', description: '', goal_amount: '', image_url: '', deadline: '' });
  const [updateForm, setUpdateForm] = useState({ title: '', description: '', image_url: '', project_id: null as number | null });
  const [editingProject, setEditingProject] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    const { error } = await supabase.from('projects').update({
      title: editingProject.title,
      description: editingProject.description,
      goal_amount: parseFloat(editingProject.goal_amount),
      deadline: editingProject.deadline || null,
      status: editingProject.status
    }).eq('id', editingProject.id);

    if (!error) {
      alert('Project updated!');
      setEditingProject(null);
      fetchData();
    } else {
      alert(error.message);
    }
  };

  const handleDeleteProject = async () => {
    const supabase = createClient();
    const { error } = await supabase.from('projects').delete().eq('id', deleteTarget.id);
    if (!error) {
      alert('Project deleted!');
      setDeleteTarget(null);
      fetchData();
    } else {
      alert(error.message);
    }
  };

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
              <div className="flex gap-2">
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{p.status}</span>
                <button onClick={() => setEditingProject(p)} className="px-3 py-1 text-xs font-bold bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200">Edit</button>
                <button onClick={() => setDeleteTarget(p)} className="px-3 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-full hover:bg-red-200">Delete</button>
              </div>
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

      {editingProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Edit Project</h3>
            <form onSubmit={handleUpdateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input required type="text" value={editingProject.title} onChange={e => setEditingProject({...editingProject, title: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea required value={editingProject.description} onChange={e => setEditingProject({...editingProject, description: e.target.value})} className="w-full px-4 py-2 border rounded-xl" rows={3}></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Goal Amount</label>
                  <input required type="number" value={editingProject.goal_amount} onChange={e => setEditingProject({...editingProject, goal_amount: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Deadline</label>
                  <input type="date" value={editingProject.deadline ? editingProject.deadline.split('T')[0] : ''} onChange={e => setEditingProject({...editingProject, deadline: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select value={editingProject.status} onChange={e => setEditingProject({...editingProject, status: e.target.value})} className="w-full px-4 py-2 border rounded-xl">
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <button type="button" onClick={() => setEditingProject(null)} className="px-4 py-2 text-gray-500 font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-maroon text-white font-bold rounded-xl hover:bg-maroon-dark">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Project?</h3>
            <p className="text-gray-500 mb-6">Are you sure you want to delete this project? All donations and updates will also be lost.</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-gray-500 font-bold">Cancel</button>
              <button onClick={handleDeleteProject} className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
