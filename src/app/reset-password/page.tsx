"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Extract token from URL
    const searchParams = new URLSearchParams(window.location.search);
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      setStatus({ type: 'error', message: 'No reset token found in URL.' });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    if (newPassword.length < 8) {
      setStatus({ type: 'error', message: 'Password must be at least 8 characters.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', message: data.message });
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to reset password.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!token && !status.message) {
    return null; // Avoid flashing the form if there's no token yet
  }

  return (
    <div className="flex flex-col w-full bg-gray-50 min-h-[calc(100vh-80px)] items-center justify-center py-12">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-maroon rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
            A
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Choose New Password</h1>
          <p className="text-gray-600 mt-2">Enter your new secure password below</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardContent className="p-8">
            {status.message && (
              <div className={`px-4 py-3 rounded-lg mb-6 text-sm font-medium border ${status.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                {status.message}
                {status.type === 'success' && (
                  <div className="mt-3">
                    <Link href="/login" className="inline-block bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700">
                      Go to Login
                    </Link>
                  </div>
                )}
              </div>
            )}
            
            {status.type !== 'success' && token && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                  <input 
                    type="password" 
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-maroon focus:border-maroon bg-white" 
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                  <input 
                    type="password" 
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-maroon focus:border-maroon bg-white" 
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full shadow-md mt-2" disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            )}
            
            <div className="mt-8 text-center text-sm text-gray-600">
              <Link href="/login" className="text-maroon font-bold hover:underline">Back to Login</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
