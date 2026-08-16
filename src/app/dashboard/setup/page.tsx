import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import SetupForm from './SetupForm';

export const metadata = {
  title: 'Complete Your Profile - Adyel Alumni Network',
};

export default async function SetupPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/login');
  }

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-maroon to-red-900 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-black mb-2">The Time Capsule</h1>
            <p className="text-pink/90 text-sm md:text-base max-w-sm mx-auto">
              Tell us about your journey to connect with the right people, find mentors, and unlock the marketplace.
            </p>
          </div>
        </div>
        <div className="p-6 md:p-8 bg-gray-50/50">
          <SetupForm user={user} />
        </div>
      </div>
    </div>
  );
}
