"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id;

  const [event, setEvent] = useState<any>(null);
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedTier, setSelectedTier] = useState('');
  const [form, setForm] = useState({
    dietary_requirements: '',
    special_requirements: ''
  });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}`);
        if (res.ok) {
          const data = await res.json();
          setEvent(data.event);
          setTiers(data.tiers);
          if (data.tiers.length > 0) {
            setSelectedTier(data.tiers[0].id.toString());
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (eventId) fetchEvent();
  }, [eventId]);

  const handleRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const selectedTierData = tiers.find(t => t.id.toString() === selectedTier);
      if (!selectedTierData) {
        alert("Please select a ticket tier");
        setSubmitting(false);
        return;
      }

      const res = await fetch(`/api/payments/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(selectedTierData.price),
          type: 'EVENT_TICKET',
          metadata: {
            event_id: eventId,
            ticket_type: selectedTierData.name,
            dietary_requirements: form.dietary_requirements,
            special_requirements: form.special_requirements
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Redirect to Paystack Checkout URL (or local callback if dev)
        window.location.href = data.checkoutUrl;
      } else {
        const err = await res.json();
        alert(err.error || "Failed to initialize payment");
        setSubmitting(false);
      }
    } catch (error) {
      alert("An error occurred");
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-gray-500">Loading checkout...</div>;
  if (!event) return <div className="p-20 text-center text-red-500">Event not found.</div>;

  const currentTierData = tiers.find(t => t.id.toString() === selectedTier);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-6">
        <Link href={`/dashboard/events/${eventId}`} className="text-gray-500 hover:text-maroon text-sm font-bold flex items-center mb-4 transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Event
        </Link>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Secure Checkout</h1>
        <p className="text-gray-500 text-sm">You are purchasing a ticket for <strong>{event.title}</strong></p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">1. Select Ticket Tier</h3>
            </div>
            <div className="p-8">
              <form onSubmit={handleRSVP} id="checkout-form" className="space-y-8">
                
                <div className="space-y-4">
                  {tiers.map(t => (
                    <label 
                      key={t.id} 
                      className={`flex items-center justify-between p-6 border-2 rounded-2xl cursor-pointer transition-all ${selectedTier === t.id.toString() ? 'border-maroon bg-pink/20 shadow-sm' : 'border-gray-100 hover:border-maroon/30 hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          name="tier" 
                          value={t.id.toString()}
                          checked={selectedTier === t.id.toString()}
                          onChange={e => setSelectedTier(e.target.value)}
                          className="w-5 h-5 text-maroon focus:ring-maroon accent-maroon"
                        />
                        <div className="ml-4">
                          <span className={`block font-bold ${selectedTier === t.id.toString() ? 'text-maroon' : 'text-gray-900'}`}>{t.name}</span>
                          <span className="text-sm text-gray-500">Capacity: {t.capacity} remaining</span>
                        </div>
                      </div>
                      <span className={`font-bold text-lg ${selectedTier === t.id.toString() ? 'text-maroon' : 'text-gray-900'}`}>UGX {parseFloat(t.price).toLocaleString()}</span>
                    </label>
                  ))}
                </div>

                <hr className="border-gray-100" />

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-6">2. Guest Details <span className="text-gray-400 font-normal text-sm ml-2">(Optional)</span></h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Dietary Requirements</label>
                      <input 
                        type="text" 
                        placeholder="e.g., Vegetarian, No Nuts, Halal" 
                        value={form.dietary_requirements} 
                        onChange={e => setForm({...form, dietary_requirements: e.target.value})} 
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon focus:border-maroon bg-gray-50 focus:bg-white transition-colors outline-none text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Special Requirements</label>
                      <input 
                        type="text" 
                        placeholder="e.g., Wheelchair access needed, Plus-one details" 
                        value={form.special_requirements} 
                        onChange={e => setForm({...form, special_requirements: e.target.value})} 
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon focus:border-maroon bg-gray-50 focus:bg-white transition-colors outline-none text-sm" 
                      />
                    </div>
                  </div>
                </div>

              </form>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 sticky top-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
            
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100">
              <span className="text-gray-600 font-medium">{currentTierData?.name || 'Ticket'} <span className="text-gray-400 ml-1">x 1</span></span>
              <span className="font-bold text-gray-900">UGX {currentTierData ? parseFloat(currentTierData.price).toLocaleString() : '0'}</span>
            </div>
            
            <div className="flex justify-between items-end mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total Due</span>
              <span className="text-2xl font-extrabold text-maroon leading-none">
                UGX {currentTierData ? parseFloat(currentTierData.price).toLocaleString() : '0'}
              </span>
            </div>

            <div className="bg-blue-50 text-blue-800 text-xs p-4 rounded-xl mb-8 border border-blue-100 leading-relaxed">
              <div className="flex items-start">
                <svg className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p><strong>Simulated Checkout:</strong> Clicking the button below will bypass live MoMo integration and instantly generate your valid QR code ticket.</p>
              </div>
            </div>

            <button 
              type="submit" 
              form="checkout-form"
              disabled={submitting || !selectedTier} 
              className="w-full text-sm font-bold py-4 rounded-xl shadow-md shadow-yellow-400/20 bg-[#FFCC00] hover:bg-[#F2C200] text-gray-900 border-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Processing Payment...' : 'Pay via Mobile Money / Card'}
            </button>
            
            <div className="mt-6 flex justify-center space-x-3 grayscale opacity-40">
              {/* Fake payment logos */}
              <div className="text-[9px] font-bold tracking-widest border border-gray-400 rounded px-2 py-1">VISA</div>
              <div className="text-[9px] font-bold tracking-widest border border-gray-400 rounded px-2 py-1">MASTERCARD</div>
              <div className="text-[9px] font-bold tracking-widest border border-gray-400 rounded px-2 py-1">MoMo</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
