"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ListBusinessPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    business_name: '',
    category: 'Legal',
    description: '',
    location: '',
    website_url: '',
    whatsapp_number: '',
    offers_alumni_discount: false,
    discount_details: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const res = await fetch('/api/marketplace/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      if (res.ok) {
        alert("Business submitted successfully! It will appear in the directory once approved by the admin team.");
        router.push('/dashboard/marketplace');
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit business");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-6">
        <Link href="/dashboard/marketplace" className="text-gray-500 hover:text-maroon text-sm font-bold flex items-center mb-4 transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Directory
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">List Your Business</h1>
        <p className="text-gray-500 text-sm">Promote your services to the Adyel Alumni network.</p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden max-w-4xl">
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Business Name *</label>
                <input required type="text" value={form.business_name} onChange={e => setForm({...form, business_name: e.target.value})} placeholder="e.g. Acme Consulting" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon bg-gray-50 focus:bg-white transition-colors outline-none text-sm" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Category *</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon bg-gray-50 focus:bg-white transition-colors outline-none text-sm">
                  <option value="Legal">Legal Services</option>
                  <option value="IT">IT & Tech</option>
                  <option value="Health">Healthcare & Medical</option>
                  <option value="Construction">Construction & Engineering</option>
                  <option value="Retail">Retail & E-commerce</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Location *</label>
                <input required type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="e.g. Kampala" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon bg-gray-50 focus:bg-white transition-colors outline-none text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Business Description *</label>
              <textarea required rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe your products or services..." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon bg-gray-50 focus:bg-white transition-colors outline-none text-sm resize-none"></textarea>
            </div>

            <hr className="border-gray-100" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">WhatsApp Number *</label>
                <input required type="text" value={form.whatsapp_number} onChange={e => setForm({...form, whatsapp_number: e.target.value})} placeholder="e.g. +256700000000" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon bg-gray-50 focus:bg-white transition-colors outline-none text-sm" />
                <p className="text-xs text-gray-500 mt-2 font-medium">Include country code for direct chat links.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Website URL <span className="font-normal lowercase ml-1">(Optional)</span></label>
                <input type="text" value={form.website_url} onChange={e => setForm({...form, website_url: e.target.value})} placeholder="e.g. www.acme.com" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon bg-gray-50 focus:bg-white transition-colors outline-none text-sm" />
              </div>
            </div>

            <div className="bg-green-50/50 p-6 border-2 border-green-200/50 rounded-2xl transition-colors hover:border-green-300">
              <div className="flex items-start space-x-4 cursor-pointer" onClick={() => setForm({...form, offers_alumni_discount: !form.offers_alumni_discount})}>
                <input 
                  type="checkbox" 
                  checked={form.offers_alumni_discount}
                  readOnly
                  className="mt-1 w-5 h-5 text-green-600 focus:ring-green-600 rounded accent-green-600"
                />
                <div>
                  <label className="font-bold text-gray-900 block cursor-pointer">Offer an exclusive Alumni Discount</label>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    Attract more clients from the network by offering a special discount to fellow Adyelites.
                  </p>
                </div>
              </div>

              {form.offers_alumni_discount && (
                <div className="pl-9 mt-6 animate-in slide-in-from-top-2 duration-300">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Discount Details *</label>
                  <input 
                    required={form.offers_alumni_discount}
                    type="text" 
                    value={form.discount_details} 
                    onChange={e => setForm({...form, discount_details: e.target.value})} 
                    placeholder="e.g. Get 15% off all consultations with code ADYEL15" 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-green-600 bg-white focus:bg-white transition-colors outline-none text-sm shadow-sm" 
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button type="submit" disabled={submitting} className="bg-maroon text-white font-bold px-8 py-3 rounded-xl shadow-md shadow-maroon/20 hover:bg-maroon-dark transition-all disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit for Review'}
              </button>
            </div>

          </form>
        </div>
      </div>

    </div>
  );
}
