import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function PublicDirectoryPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  // If already logged in, seamlessly redirect them to the actual dashboard directory
  if (token) {
    redirect('/dashboard/directory');
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden text-center">
        
        <div className="bg-maroon/5 p-12 flex flex-col items-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-maroon shadow-md mb-6">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Alumni Directory</h1>
          <p className="text-gray-500 font-medium">Connect with generations of Adyelites.</p>
        </div>

        <div className="p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Members Only Area</h2>
          <p className="text-gray-600 text-lg mb-10 leading-relaxed">
            To protect the privacy of our alumni, the directory is an exclusive member benefit. 
            Please log in to your account or join the network to search for former classmates, 
            view profiles, and expand your professional network.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                Log In to Account
              </Button>
            </Link>
            <Link href="/membership" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full border-2 hover:bg-gray-50">
                Join the Network
              </Button>
            </Link>
          </div>
          
          <div className="mt-10 pt-8 border-t border-gray-100">
            <Link href="/" className="text-gray-500 hover:text-maroon font-bold text-sm transition-colors flex items-center justify-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
