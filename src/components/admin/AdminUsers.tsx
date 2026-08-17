"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import ConfirmDialog from './ConfirmDialog';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  class_year: string | null;
  profession: string | null;
  phone: string | null;
  role: string | null;
  hide_contact_info: boolean;
  created_at: string;
}

const ROLES = ['MEMBER', 'ADMIN', 'SUPER_ADMIN'];

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ first_name: '', last_name: '', email: '', class_year: '', profession: '', phone: '', role: 'MEMBER' });

  // Edit modal
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', email: '', class_year: '', profession: '', phone: '', role: '' });

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const supabase = createClient();

  const fetchUsers = async () => {
    setLoading(true);
    let query = supabase.from('users').select('*').order('created_at', { ascending: false });
    if (search.trim()) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    const { data, error } = await query;
    if (error) console.error('Error fetching users:', error);
    else setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // CREATE
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('users').insert({
      first_name: createForm.first_name,
      last_name: createForm.last_name,
      email: createForm.email,
      class_year: createForm.class_year || null,
      profession: createForm.profession || null,
      phone: createForm.phone || null,
      role: createForm.role,
    });
    setSaving(false);
    if (error) { alert('Error creating user: ' + error.message); return; }
    setShowCreate(false);
    setCreateForm({ first_name: '', last_name: '', email: '', class_year: '', profession: '', phone: '', role: 'MEMBER' });
    showSuccess('User created successfully!');
    fetchUsers();
  };

  // EDIT
  const openEdit = (user: User) => {
    setEditUser(user);
    setEditForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      class_year: user.class_year || '',
      profession: user.profession || '',
      phone: user.phone || '',
      role: user.role || 'MEMBER',
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setSaving(true);
    const { error } = await supabase.from('users').update({
      first_name: editForm.first_name,
      last_name: editForm.last_name,
      email: editForm.email,
      class_year: editForm.class_year || null,
      profession: editForm.profession || null,
      phone: editForm.phone || null,
      role: editForm.role,
    }).eq('id', editUser.id);
    setSaving(false);
    if (error) { alert('Error updating user: ' + error.message); return; }
    setEditUser(null);
    showSuccess('User updated successfully!');
    fetchUsers();
  };

  // DELETE
  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from('users').delete().eq('id', deleteTarget.id);
    if (error) { alert('Error deleting user: ' + error.message); return; }
    setDeleteTarget(null);
    showSuccess('User removed successfully.');
    fetchUsers();
  };

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-maroon/20 outline-none bg-white";

  return (
    <div>
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Delete User"
        message={`Are you sure you want to permanently delete ${deleteTarget?.first_name} ${deleteTarget?.last_name}? This will remove their profile record.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add New User</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">First Name *</label>
                  <input required value={createForm.first_name} onChange={e => setCreateForm(p => ({ ...p, first_name: e.target.value }))} className={inputClass} placeholder="John" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Last Name *</label>
                  <input required value={createForm.last_name} onChange={e => setCreateForm(p => ({ ...p, last_name: e.target.value }))} className={inputClass} placeholder="Doe" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email *</label>
                <input required type="email" value={createForm.email} onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))} className={inputClass} placeholder="john@example.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Class Year</label>
                  <input value={createForm.class_year} onChange={e => setCreateForm(p => ({ ...p, class_year: e.target.value }))} className={inputClass} placeholder="e.g. 2005" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone</label>
                  <input value={createForm.phone} onChange={e => setCreateForm(p => ({ ...p, phone: e.target.value }))} className={inputClass} placeholder="+256 700 000000" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Profession</label>
                <input value={createForm.profession} onChange={e => setCreateForm(p => ({ ...p, profession: e.target.value }))} className={inputClass} placeholder="e.g. Engineer" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Role *</label>
                <select required value={createForm.role} onChange={e => setCreateForm(p => ({ ...p, role: e.target.value }))} className={inputClass}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-maroon text-white rounded-xl font-semibold hover:bg-maroon/90 transition-colors disabled:opacity-60">
                  {saving ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
              <button onClick={() => setEditUser(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">First Name *</label>
                  <input required value={editForm.first_name} onChange={e => setEditForm(p => ({ ...p, first_name: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Last Name *</label>
                  <input required value={editForm.last_name} onChange={e => setEditForm(p => ({ ...p, last_name: e.target.value }))} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email *</label>
                <input required type="email" value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Class Year</label>
                  <input value={editForm.class_year} onChange={e => setEditForm(p => ({ ...p, class_year: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone</label>
                  <input value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Profession</label>
                <input value={editForm.profession} onChange={e => setEditForm(p => ({ ...p, profession: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Role *</label>
                <select required value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))} className={inputClass}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditUser(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-maroon text-white rounded-xl font-semibold hover:bg-maroon/90 transition-colors disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Registered Users</h3>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} user{users.length !== 1 ? 's' : ''} found</p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-maroon/20 outline-none w-64"
          />
          <button
            onClick={() => setShowCreate(true)}
            className="bg-maroon text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-maroon/90 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            Add User
          </button>
        </div>
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
          ✓ {successMsg}
        </div>
      )}

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-maroon border-t-transparent rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          <p className="text-gray-400 font-medium">{search ? 'No users match your search.' : 'No registered users yet.'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
          <table className="w-full text-left bg-white">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Member</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Details</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Joined</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-maroon/10 text-maroon flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {(user.first_name?.[0] || '?')}{(user.last_name?.[0] || '')}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 leading-tight">{user.first_name} {user.last_name}</div>
                        <div className="text-xs text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-sm text-gray-600 space-y-0.5">
                      {user.class_year && <div className="text-xs">🎓 Class of {user.class_year}</div>}
                      {user.profession && <div className="text-xs">💼 {user.profession}</div>}
                      {user.phone && <div className="text-xs">📞 {user.phone}</div>}
                      {!user.class_year && !user.profession && !user.phone && <span className="text-xs text-gray-300 italic">No details</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                      user.role === 'SUPER_ADMIN' ? 'bg-maroon/10 text-maroon' :
                      user.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {user.role || 'MEMBER'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(user)}
                        className="px-3 py-1.5 text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(user)}
                        className="px-3 py-1.5 text-xs font-bold bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
