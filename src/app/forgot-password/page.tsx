"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setStatus({ type: 'error', message: error.message });
      } else {
        setStatus({ type: 'success', message: 'If an account exists, a password reset link has been sent to your email.' });
        setEmail('');
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full bg-gray-50 min-h-[calc(100vh-80px)] items-center justify-center py-12">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-maroon rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
            A
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-600 mt-2">Enter your email to receive a reset link</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardContent className="p-8">
            {status.message && (
              <div className={`px-4 py-3 rounded-lg mb-6 text-sm font-medium border ${status.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                {status.message}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-maroon focus:border-maroon bg-white" 
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Button type="submit" size="lg" className="w-full shadow-md mt-2" disabled={loading || status.type === 'success'}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
            
            <div className="mt-8 text-center text-sm text-gray-600">
              Remember your password? <Link href="/login" className="text-maroon font-bold hover:underline">Log In</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
