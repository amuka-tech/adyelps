"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card, CardContent } from '@/components/Card';
import { createClient } from '@/utils/supabase/client';

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    class_year: '',
    profession: '',
    phone: ''
  });

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          // If the profile already has a class year, they've likely already onboarded
          if (profile.class_year) {
            router.push('/dashboard');
            return;
          }

          setUser(session.user);
          setFormData({
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            email: profile.email || session.user.email || '',
            class_year: '',
            profession: '',
            phone: ''
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from('users')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          class_year: formData.class_year ? parseInt(formData.class_year) : null,
          profession: formData.profession,
          phone: formData.phone
        })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      // Onboarding complete, redirect to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving your profile.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-maroon border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
        <p className="text-gray-600">Please provide a few more details to join the Alumni Network.</p>
      </div>

      <Card className="shadow-lg border-0">
        <CardContent className="p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">First Name *</label>
                <input 
                  required 
                  type="text" 
                  name="first_name" 
                  value={formData.first_name} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-maroon focus:border-maroon bg-white" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Last Name *</label>
                <input 
                  required 
                  type="text" 
                  name="last_name" 
                  value={formData.last_name} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-maroon focus:border-maroon bg-white" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email Address *</label>
              <input 
                required 
                type="email" 
                name="email" 
                value={formData.email} 
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed" 
                readOnly 
              />
              <p className="text-xs text-gray-500 mt-1">Managed via your Google account.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Class Year *</label>
                <input 
                  required
                  type="number" 
                  name="class_year" 
                  value={formData.class_year} 
                  onChange={handleChange} 
                  placeholder="e.g. 2015" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-maroon focus:border-maroon bg-white" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Profession</label>
                <input 
                  type="text" 
                  name="profession" 
                  value={formData.profession} 
                  onChange={handleChange} 
                  placeholder="e.g. Software Engineer" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-maroon focus:border-maroon bg-white" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-maroon focus:border-maroon bg-white" 
              />
            </div>

            <div className="pt-4">
              <Button type="submit" size="lg" className="w-full shadow-md" disabled={saving}>
                {saving ? 'Saving...' : 'Finish Profile'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
