"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Card, CardContent } from '@/components/Card';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/public/shop/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Product not found');
        return res.json();
      })
      .then(data => {
        setProduct(data.product);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-bold">Loading product details...</div>;
  if (error || !product) return <div className="h-screen flex items-center justify-center bg-gray-50 text-red-500 font-bold">{error || 'Product not found'}</div>;

  return (
    <div className="flex flex-col w-full bg-gray-50 min-h-[calc(100vh-80px)]">
      
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 max-w-6xl">
          <Link href="/shop" className="text-sm font-bold text-gray-500 hover:text-maroon transition-colors flex items-center w-fit">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Shop
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-12">
          
          {/* Product Image */}
          <div className="w-full md:w-1/2">
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 aspect-square flex items-center justify-center relative">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9ImN1cnJlbnRDb2xvciIvPjwvc3ZnPg==')]"></div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="w-full md:w-1/2 flex flex-col">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <div className="mb-6 pb-6 border-b border-gray-200">
              <span className="text-3xl font-bold text-maroon block mb-2">UGX {Number(product.price).toLocaleString()}</span>
              {product.stock_quantity > 0 ? (
                <span className="inline-flex items-center text-sm font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  In Stock
                </span>
              ) : (
                <span className="inline-flex items-center text-sm font-bold text-red-700 bg-red-100 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                  Sold Out
                </span>
              )}
            </div>

            <div className="prose text-gray-600 mb-8 max-w-none">
              <p>{product.description}</p>
            </div>

            <div className="mt-auto pt-6 border-t border-gray-200">
              <Card className="bg-pink/10 border-pink/20 shadow-none">
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-bold text-maroon-dark mb-2">Member Exclusive Shopping</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Purchasing official merchandise requires an Adyel Alumni account. Registered members may also receive exclusive discounts on select items.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Link href="/login" className="flex-1">
                      <Button className="w-full bg-darkblue hover:bg-blue-900 text-white">Login to Purchase</Button>
                    </Link>
                    <Link href="/membership" className="flex-1">
                      <Button variant="outline" className="w-full border-darkblue text-darkblue hover:bg-darkblue hover:text-white">Join Alumni</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
