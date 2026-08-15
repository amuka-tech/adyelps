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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
          <input required type="text" name="firstName" placeholder="John" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-maroon focus:border-maroon bg-white" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
          <input required type="text" name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-maroon focus:border-maroon bg-white" />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
        <input required type="email" name="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-maroon focus:border-maroon bg-white" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
        <input required type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} minLength={6} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-maroon focus:border-maroon bg-white" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Class Year</label>
          <input type="number" name="classYear" value={formData.classYear} onChange={handleChange} placeholder="e.g. 2015" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-maroon focus:border-maroon bg-white" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Profession</label>
          <input type="text" name="profession" value={formData.profession} onChange={handleChange} placeholder="e.g. Software Engineer" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-maroon focus:border-maroon bg-white" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+256..." className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-maroon focus:border-maroon bg-white" />
      </div>

      <div className="pt-2">
        <Button className="w-full shadow-md" size="lg" type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Submit Application'}
        </Button>
      </div>

      <div className="mt-6 mb-4 flex items-center justify-center space-x-4">
        <span className="h-px bg-gray-200 w-full"></span>
        <span className="text-gray-400 text-sm font-medium">OR</span>
        <span className="h-px bg-gray-200 w-full"></span>
      </div>

      <Button 
        type="button" 
        variant="outline" 
        size="lg"
        className="w-full shadow-sm bg-white border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-3"
        onClick={async () => {
          const { createClient } = await import('@/utils/supabase/client');
          const supabase = createClient();
          await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            }
          });
        }}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Sign up with Google
      </Button>
    </form>
  );
}
