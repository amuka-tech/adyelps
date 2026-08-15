"use client";

import React, { useState } from 'react';
import { Button } from '@/components/Button';
import Link from 'next/link';

export function RegistrationForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    classYear: '',
    profession: '',
    email: '',
    phone: '',
    password: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            classYear: formData.classYear,
            profession: formData.profession,
            phone: formData.phone,
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        setSuccess(true);
        setFormData({ firstName: '', lastName: '', classYear: '', profession: '', email: '', phone: '', password: '' });
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h3 className="text-2xl font-bold">Registration Successful!</h3>
        <p>Your account has been created successfully. You can now log in to access the member directory and dashboard.</p>
        <Link href="/login" className="inline-block mt-4 bg-maroon text-white px-6 py-2 rounded-lg font-medium hover:bg-maroon-dark transition-colors">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-maroon focus:border-maroon" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-maroon focus:border-maroon" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year of Completion</label>
          <input type="number" name="classYear" value={formData.classYear} onChange={handleChange} placeholder="e.g. 1995" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-maroon focus:border-maroon" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Profession</label>
          <input type="text" name="profession" value={formData.profession} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-maroon focus:border-maroon" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
        <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-maroon focus:border-maroon" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-maroon focus:border-maroon" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-maroon focus:border-maroon" />
      </div>

      <div className="pt-4">
        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Application'}
        </Button>
      </div>
    </form>
  );
}
