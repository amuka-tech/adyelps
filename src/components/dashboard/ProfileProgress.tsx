"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function ProfileProgress({ user }: { user: any }) {
  const [dismissed, setDismissed] = useState(false);
  
  if (!user || dismissed) return null;

  const coreFields = ['phone', 'class_year', 'profession'];
  const completedFields = coreFields.filter(field => user[field] && user[field].toString().trim() !== '');
  const completionPercentage = Math.round((completedFields.length / coreFields.length) * 100);

  if (completionPercentage === 100) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-maroon/20 overflow-hidden mb-8 relative">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100">
        <div 
          className="h-full bg-gradient-to-r from-pink to-maroon transition-all duration-1000 ease-out"
          style={{ width: ${completionPercentage}% }}
        />
      </div>
      
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl">??</span>
            <h3 className="font-bold text-gray-900 text-lg">Your Profile is {completionPercentage}% Complete</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Add your graduation year and profession to unlock networking, internal referrals, and the alumni marketplace!
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setDismissed(true)}
            className="text-gray-400 hover:text-gray-600 px-2 py-2 text-sm font-medium transition-colors"
          >
            Dismiss
          </button>
          <Link href="/dashboard/setup" className="flex-1 sm:flex-none">
            <button className="w-full sm:w-auto bg-maroon text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-maroon-dark transition-all shadow-md shadow-maroon/20">
              Complete Profile
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
