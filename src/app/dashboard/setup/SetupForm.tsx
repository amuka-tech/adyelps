"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function SetupForm({ user }: { user: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    phone: user?.phone || '',
    class_year: user?.class_year || '',
    profession: user?.profession || '',
  });

  const currentYear = new Date().getFullYear();
  // Generate years from 1950 to current year
  const years = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from('users')
        .update({
          phone: formData.phone,
          class_year: formData.class_year,
          profession: formData.profession,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      // Refresh the page data (Server Components will re-run)
      router.refresh();
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">
          Graduation Year
        </label>
        <select
          name="class_year"
          value={formData.class_year}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition-all bg-white"
        >
          <option value="" disabled>Select your graduation year</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-2">Required for the Alumni Directory</p>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">
          Current Profession / Industry
        </label>
        <input
          type="text"
          name="profession"
          value={formData.profession}
          onChange={handleChange}
          placeholder="e.g. Software Engineer, Doctor, Entrepreneur"
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition-all bg-white"
        />
        <p className="text-xs text-gray-500 mt-2">Required for Mentorship and Careers matching</p>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">
          Phone Number
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="e.g. +256700000000"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition-all bg-white"
        />
        <p className="text-xs text-gray-500 mt-2">Needed if you plan to use Mobile Money for tickets or donations</p>
      </div>

      <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Skip for now
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-maroon text-white font-bold rounded-xl shadow-md shadow-maroon/20 hover:bg-maroon-dark transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            'Save & Continue'
          )}
        </button>
      </div>
    </form>
  );
}
