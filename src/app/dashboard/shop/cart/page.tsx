"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');
  const [shippingAddress, setShippingAddress] = useState('');

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('adyel_cart') || '[]');
    setCartItems(items);
    setLoading(false);
  }, []);

  const removeFromCart = (index: number) => {
    const newCart = [...cartItems];
    newCart.splice(index, 1);
    setCartItems(newCart);
    localStorage.setItem('adyel_cart', JSON.stringify(newCart));
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    const newCart = [...cartItems];
    newCart[index].quantity = newQuantity;
    setCartItems(newCart);
    localStorage.setItem('adyel_cart', JSON.stringify(newCart));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    if (shippingMethod === 'DELIVERY' && !shippingAddress.trim()) {
      alert("Please provide a delivery address");
      return;
    }

    setProcessing(true);
    
    try {
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          type: 'SHOP_ORDER',
          metadata: {
            items: cartItems,
            shipping_method: shippingMethod,
            shipping_address: shippingMethod === 'PICKUP' ? 'Pickup at Adyel Primary School' : shippingAddress
          }
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        // Clear cart since the payment is actively being initiated
        localStorage.removeItem('adyel_cart');
        setCartItems([]);
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.error || "Checkout failed");
        setProcessing(false);
      }
    } catch (err) {
      console.error(err);
      alert("Network error during checkout");
    } finally {
      setProcessing(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = shippingMethod === 'DELIVERY' ? 15000 : 0;
  const total = subtotal + shippingCost;

  if (loading) return null;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
        <Link href="/dashboard/shop">
          <Button variant="outline">Continue Shopping</Button>
        </Link>
      </div>

      {cartItems.length === 0 ? (
        <Card className="text-center p-16 bg-gray-50 border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added any Adyel merch yet!</p>
          <Link href="/dashboard/shop">
            <Button>Browse Shop</Button>
          </Link>
        </Card>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="w-full lg:w-2/3 space-y-4">
            {cartItems.map((item, idx) => (
              <Card key={`${item.product_id}-${idx}`} className="overflow-hidden shadow-sm border-gray-100">
                <CardContent className="p-4 flex gap-4 items-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 line-clamp-1">{item.name}</h3>
                    <p className="text-maroon font-bold text-sm mb-2">UGX {item.price.toLocaleString()}</p>
                    
                    <div className="flex items-center gap-4 mt-auto">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-8">
                        <button onClick={() => updateQuantity(idx, item.quantity - 1)} className="px-3 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold">-</button>
                        <div className="w-10 text-center text-sm font-bold">{item.quantity}</div>
                        <button onClick={() => updateQuantity(idx, item.quantity + 1)} className="px-3 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold">+</button>
                      </div>
                      
                      <button onClick={() => removeFromCart(idx)} className="text-xs text-red-500 hover:text-red-700 font-medium underline">
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-right pl-4 border-l border-gray-100 hidden sm:block">
                    <p className="text-xs text-gray-500 mb-1">Subtotal</p>
                    <p className="font-bold text-gray-900">UGX {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Checkout Summary */}
          <div className="w-full lg:w-1/3">
            <Card className="sticky top-24 shadow-md border-maroon/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-4">Order Summary</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Items ({cartItems.length})</span>
                    <span>UGX {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? 'Free' : `UGX ${shippingCost.toLocaleString()}`}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-lg text-gray-900">
                    <span>Total</span>
                    <span className="text-maroon">UGX {total.toLocaleString()}</span>
                  </div>
                </div>

                <form onSubmit={handleCheckout} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Delivery Method</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div 
                        className={`border rounded-lg p-3 cursor-pointer text-center text-sm font-medium transition-colors ${shippingMethod === 'PICKUP' ? 'border-maroon bg-maroon/5 text-maroon' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                        onClick={() => setShippingMethod('PICKUP')}
                      >
                        <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                        Pick up at School
                      </div>
                      <div 
                        className={`border rounded-lg p-3 cursor-pointer text-center text-sm font-medium transition-colors ${shippingMethod === 'DELIVERY' ? 'border-maroon bg-maroon/5 text-maroon' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                        onClick={() => setShippingMethod('DELIVERY')}
                      >
                        <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                        Delivery (+15k)
                      </div>
                    </div>
                  </div>

                  {shippingMethod === 'DELIVERY' && (
                    <div className="animate-fade-in-up">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Address (Kampala & Lira only)</label>
                      <textarea 
                        required
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-maroon focus:border-maroon resize-none text-sm"
                        rows={3}
                        placeholder="Enter full address, street, and landmarks"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                      ></textarea>
                    </div>
                  )}

                  <div className="pt-4">
                    <Button type="submit" className="w-full py-4 text-lg shadow-lg shadow-maroon/20" disabled={processing}>
                      {processing ? 'Processing...' : 'Complete Purchase'}
                    </Button>
                    <p className="text-xs text-center text-gray-400 mt-3 flex items-center justify-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                      Secure payment via Mobile Money prompt will appear next
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
