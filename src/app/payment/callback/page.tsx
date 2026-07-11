"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PaymentCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  const simulate = searchParams.get('simulate');

  const [status, setStatus] = useState<'VERIFYING' | 'SUCCESS' | 'FAILED'>('VERIFYING');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!reference) {
      setStatus('FAILED');
      setErrorMessage('No payment reference found.');
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference, simulate: simulate === 'true' })
        });
        
        const data = await res.json();
        if (data.status === 'SUCCESS') {
          setStatus('SUCCESS');
        } else {
          setStatus('FAILED');
          setErrorMessage(data.message || 'Payment verification failed on the gateway.');
        }
      } catch (err) {
        setStatus('FAILED');
        setErrorMessage('Network error during verification.');
      }
    };

    verifyPayment();
  }, [reference, simulate]);

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 max-w-md w-full p-8 text-center animate-in fade-in zoom-in duration-500">
        
        {status === 'VERIFYING' && (
          <div className="flex flex-col items-center py-8">
            <div className="w-16 h-16 border-4 border-gray-100 border-t-maroon rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
            <p className="text-gray-500 text-sm">Please do not close this window or click back. We are confirming your transaction with the gateway.</p>
          </div>
        )}

        {status === 'SUCCESS' && (
          <div className="flex flex-col items-center py-4">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-inner text-green-500">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-500 text-sm mb-8">Your transaction (<span className="font-mono text-xs">{reference}</span>) was completed successfully. Your receipt and related documents have been generated.</p>
            
            <Link href="/dashboard" className="w-full">
              <button className="w-full bg-maroon text-white font-bold py-3.5 rounded-xl shadow-lg shadow-maroon/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                Return to Dashboard
              </button>
            </Link>
          </div>
        )}

        {status === 'FAILED' && (
          <div className="flex flex-col items-center py-4">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-inner text-red-500">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-500 text-sm mb-2">We could not verify your payment at this time.</p>
            <p className="text-red-500 text-xs font-bold bg-red-50 px-3 py-2 rounded-lg mb-8">{errorMessage}</p>
            
            <div className="w-full flex gap-3">
              <Link href="/dashboard" className="flex-1">
                <button className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-all text-sm">
                  Cancel
                </button>
              </Link>
              <button onClick={() => window.location.reload()} className="flex-1 bg-gray-900 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm">
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading callback...</div>}>
      <PaymentCallbackInner />
    </Suspense>
  );
}
