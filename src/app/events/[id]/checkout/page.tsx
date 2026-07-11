"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';
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
      // Simulate live payment here if needed, then call API to insert
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_tier_id: parseInt(selectedTier),
          ...form
        })
      });

      if (res.ok) {
        const data = await res.json();
        alert("Payment Successful! Your ticket has been generated.");
        router.push('/dashboard'); // Where we will show the QR code
      } else {
        const err = await res.json();
        alert(err.error || "Failed to purchase ticket");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-20 text-center">Loading checkout...</div>;
  if (!event) return <div className="p-20 text-center text-red-500">Event not found.</div>;

  const currentTierData = tiers.find(t => t.id.toString() === selectedTier);

  return (
    <div className="flex flex-col w-full bg-gray-50 min-h-[calc(100vh-80px)] py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        
        <Link href={`/events/${eventId}`}>
          <span className="text-gray-500 hover:text-maroon text-sm font-medium mb-6 inline-block">&larr; Back to Event</span>
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Secure Checkout: {event.title}</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          
          <div className="flex-1 space-y-6">
            <Card>
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleRSVP} id="checkout-form" className="space-y-6">
                  
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">1. Select Ticket Tier</h3>
                    <div className="space-y-3">
                      {tiers.map(t => (
                        <label 
                          key={t.id} 
                          className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors ${selectedTier === t.id.toString() ? 'border-maroon bg-red-50/50' : 'border-gray-200 hover:border-maroon/50'}`}
                        >
                          <div className="flex items-center">
                            <input 
                              type="radio" 
                              name="tier" 
                              value={t.id.toString()}
                              checked={selectedTier === t.id.toString()}
                              onChange={e => setSelectedTier(e.target.value)}
                              className="w-5 h-5 text-maroon focus:ring-maroon"
                            />
                            <div className="ml-4">
                              <span className="block font-bold text-gray-900">{t.name}</span>
                              <span className="text-sm text-gray-500">Capacity: {t.capacity}</span>
                            </div>
                          </div>
                          <span className="font-bold text-maroon">UGX {parseFloat(t.price).toLocaleString()}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">2. Guest Details (Optional)</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Requirements</label>
                        <input 
                          type="text" 
                          placeholder="e.g., Vegetarian, No Nuts, Halal" 
                          value={form.dietary_requirements} 
                          onChange={e => setForm({...form, dietary_requirements: e.target.value})} 
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-maroon" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Special Requirements</label>
                        <input 
                          type="text" 
                          placeholder="e.g., Wheelchair access needed, Plus-one details" 
                          value={form.special_requirements} 
                          onChange={e => setForm({...form, special_requirements: e.target.value})} 
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-maroon" 
                        />
                      </div>
                    </div>
                  </div>

                </form>
              </CardContent>
            </Card>
          </div>

          <div className="w-full lg:w-96 flex-shrink-0">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>
                
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                  <span className="text-gray-600">{currentTierData?.name || 'Ticket'} x 1</span>
                  <span className="font-medium text-gray-900">UGX {currentTierData ? parseFloat(currentTierData.price).toLocaleString() : '0'}</span>
                </div>
                
                <div className="flex justify-between items-center mb-8">
                  <span className="text-lg font-bold text-gray-900">Total Due</span>
                  <span className="text-xl font-extrabold text-maroon">
                    UGX {currentTierData ? parseFloat(currentTierData.price).toLocaleString() : '0'}
                  </span>
                </div>

                <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-lg mb-6 border border-blue-100">
                  <div className="flex">
                    <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <p><strong>Simulated Checkout:</strong> Clicking the button below will bypass live MoMo integration and instantly generate your valid QR code ticket.</p>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  form="checkout-form"
                  disabled={submitting || !selectedTier} 
                  className="w-full text-lg py-6 shadow-xl hover:shadow-2xl bg-[#FFCC00] hover:bg-[#E6B800] text-black border-none"
                >
                  {submitting ? 'Processing...' : 'Pay via Mobile Money / Card'}
                </Button>
                
                <div className="mt-4 flex justify-center space-x-2 grayscale opacity-50">
                  {/* Fake payment logos */}
                  <div className="text-[10px] font-bold tracking-wider border border-gray-300 rounded px-2 py-1">VISA</div>
                  <div className="text-[10px] font-bold tracking-wider border border-gray-300 rounded px-2 py-1">MASTERCARD</div>
                  <div className="text-[10px] font-bold tracking-wider border border-gray-300 rounded px-2 py-1">MTN MoMo</div>
                  <div className="text-[10px] font-bold tracking-wider border border-gray-300 rounded px-2 py-1">AIRTEL</div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
