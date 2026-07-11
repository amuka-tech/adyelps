"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Redirect Super Admins directly to the admin portal, bypassing the member lounge
        if (data.user?.role === 'SUPER_ADMIN' || data.user?.assignedRoles?.includes('Super Admin')) {
          window.location.href = '/superadmin';
        } else {
          // Trigger a hard reload to update the Navbar state and go to dashboard
          window.location.href = '/dashboard';
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
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
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Log in to your Alumni account</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardContent className="p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm font-medium">
                {error}
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-5">
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
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Password</label>
                  <Link href="/forgot-password" className="text-xs text-maroon hover:underline font-medium">Forgot password?</Link>
                </div>
                <input 
                  type="password" 
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-maroon focus:border-maroon bg-white" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button type="submit" size="lg" className="w-full shadow-md mt-2" disabled={loading}>
                {loading ? 'Logging in...' : 'Log In'}
              </Button>
            </form>
            
            <div className="mt-8 text-center text-sm text-gray-600">
              Don't have an account? <Link href="/membership" className="text-maroon font-bold hover:underline">Join the Network</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
