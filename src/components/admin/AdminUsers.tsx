"use client";

import React from 'react';

export default function AdminUsers({ 
  users, 
  search, 
  setSearch, 
  handleRoleChange, 
  handleStatusChange 
}: { 
  users: any[]; 
  search: string; 
  setSearch: (s: string) => void; 
  handleRoleChange: (userId: string, roleId: number) => void; 
  handleStatusChange: (userId: string, status: string) => void; 
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">User Role Management</h3>
        <input 
          type="text" 
          placeholder="Search by name or email..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-maroon/20 outline-none"
        />
      </div>
      
      {users.filter(u => u.account_status === 'PENDING').length > 0 && (
        <div className="mb-10">
          <h4 className="text-lg font-bold text-maroon mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-maroon animate-pulse"></span>
            Pending Registrations
          </h4>
          <div className="overflow-x-auto border border-maroon/20 rounded-2xl">
            <table className="w-full text-left bg-red-50/30">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-maroon/10">
                  <th className="p-4 font-semibold">Applicant</th>
                  <th className="p-4 font-semibold">Details</th>
                  <th className="p-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-maroon/10">
                {users.filter(u => u.account_status === 'PENDING').map(user => (
                  <tr key={user.id}>
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{user.first_name} {user.last_name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-700">Class of {user.class_year || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{user.profession || 'No profession listed'}</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { handleStatusChange(user.id, 'ACTIVE'); handleRoleChange(user.id, 6); }} className="bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2 rounded-xl text-sm font-bold transition-colors">Approve</button>
                        <button onClick={() => handleStatusChange(user.id, 'BANNED')} className="bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded-xl text-sm font-bold transition-colors">Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <h4 className="text-lg font-bold text-gray-900 mb-4">Active Directory</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-gray-400 text-xs uppercase tracking-wider">
              <th className="px-4 pb-2 font-semibold">Member</th>
              <th className="px-4 pb-2 font-semibold">Role</th>
              <th className="px-4 pb-2 font-semibold text-right">Assign Role</th>
              <th className="px-4 pb-2 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(u => u.account_status !== 'PENDING').map(user => (
              <tr key={user.id} className="group bg-white hover:bg-gray-50 transition-colors shadow-sm border border-gray-100 rounded-xl">
                <td className="p-4 rounded-l-xl border-y border-l border-gray-100 group-hover:border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-skyblue/20 text-darkblue flex items-center justify-center font-bold text-sm">
                      {user.first_name[0]}{user.last_name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 leading-tight">{user.first_name} {user.last_name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 border-y border-gray-100 group-hover:border-gray-200">
                  <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${user.role === 'SUPER_ADMIN' ? 'bg-pink text-maroon' : 'bg-gray-100 text-gray-600'}`}>
                    {user.role || 'Member'}
                  </span>
                </td>
                <td className="p-4 text-right border-y border-gray-100 group-hover:border-gray-200">
                  <select onChange={(e) => handleRoleChange(user.id, parseInt(e.target.value))} className="bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl focus:ring-2 focus:ring-maroon/20 p-2.5 outline-none cursor-pointer hover:bg-gray-50 transition-colors">
                    <option value="">Change Role...</option>
                    <option value="6">Member (Read-Only)</option>
                    <option value="4">PRO (News/Events)</option>
                    <option value="5">Career Manager</option>
                    <option value="3">Treasurer (Welfare)</option>
                    <option value="2">General Admin</option>
                    <option value="1">Super Admin</option>
                  </select>
                </td>
                <td className="p-4 text-right rounded-r-xl border-y border-r border-gray-100 group-hover:border-gray-200">
                  <select onChange={(e) => handleStatusChange(user.id, e.target.value)} className={`${user.account_status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100' : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100'} border text-sm font-bold rounded-xl p-2.5 outline-none cursor-pointer transition-colors focus:ring-2`}>
                    <option value="">{user.account_status || 'ACTIVE'}</option>
                    <option value="SUSPENDED">Suspend Account</option>
                    <option value="BANNED">Ban Account</option>
                    <option value="ACTIVE">Reactivate</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
