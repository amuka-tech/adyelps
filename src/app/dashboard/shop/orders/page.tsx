"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/Card';
import { Button } from '@/components/Button';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/shop/orders')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.orders) setOrders(data.orders);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PAID': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SHIPPED': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) return <div className="p-20 text-center text-gray-500 font-bold">Loading your orders...</div>;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
        <Link href="/dashboard/shop">
          <Button variant="outline">Back to Shop</Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <Card className="text-center p-16 bg-gray-50 border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">You haven't made any purchases from the alumni shop.</p>
          <Link href="/dashboard/shop">
            <Button>Start Shopping</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden shadow-sm border-gray-200">
              <CardHeader className="bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Order Placed</p>
                  <p className="font-bold text-gray-900">{new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}</p>
                </div>
                <div className="sm:text-center">
                  <p className="text-sm text-gray-500 font-medium">Total Amount</p>
                  <p className="font-bold text-maroon">UGX {Number(order.total_amount).toLocaleString()}</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-sm text-gray-500 font-medium">Order #</p>
                  <p className="font-bold text-gray-900">ADYL-{order.id.toString().padStart(6, '0')}</p>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-900">Items Ordered</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="py-4 flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded border border-gray-200 overflow-hidden flex items-center justify-center">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">UGX {Number(item.price_at_purchase).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-bold text-gray-700 mb-1">Delivery Details</p>
                  <p className="text-sm text-gray-600">{order.shipping_address}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
