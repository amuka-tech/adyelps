"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { Card, CardContent } from '@/components/Card';
import Link from 'next/link';

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('@/utils/supabase/client').then(({ createClient }) => {
      const supabase = createClient();
      supabase
        .from('shop_products')
        .select('*')
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false })
        .then(({ data }: any) => {
          if (data) setProducts(data);
          setLoading(false);
        })
        .catch((err: any) => {
          console.error(err);
          setLoading(false);
        });
    });
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Page Header */}
      <section className="bg-gray-100 py-20 text-maroon-dark text-center border-b">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Official Alumni Shop</h1>
        <p className="text-xl max-w-2xl mx-auto px-4 text-gray-600">
          Wear your pride. All proceeds go towards funding school projects.
        </p>
      </section>

      {/* Shop Items */}
      <section className="py-16 bg-white flex-1">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <p className="text-gray-500 font-medium">Showing {products.length} products</p>
            <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-maroon focus:border-maroon outline-none">
              <option>Sort by: Latest</option>
              <option>Sort by: Price (Low to High)</option>
              <option>Sort by: Price (High to Low)</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-500">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-2xl border border-gray-100">No products available at the moment.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <Card key={product.id} className="flex flex-col group overflow-hidden border-gray-100 shadow-sm hover:shadow-lg transition-all">
                  <div className="h-64 bg-gray-50 flex items-center justify-center relative overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9ImN1cnJlbnRDb2xvciIvPjwvc3ZnPg==')]"></div>
                    )}
                    {product.stock_quantity === 0 && (
                      <div className="absolute top-4 right-4 bg-black/80 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                        Sold Out
                      </div>
                    )}
                  </div>
                  <CardContent className="flex-1 flex flex-col p-6">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-maroon transition-colors mb-2 line-clamp-1">{product.name}</h3>
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <span className="font-bold text-xl text-maroon block">UGX {Number(product.price).toLocaleString()}</span>
                        <span className="text-xs text-gray-400 font-medium mt-1 inline-block">Login for Member Discount</span>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm mb-6 flex-1 line-clamp-2">{product.description}</p>
                    
                    <Link href={`/shop/${product.id}`} className="block w-full">
                      <Button variant="outline" className="w-full border-gray-200 text-gray-700 hover:border-maroon hover:text-maroon transition-colors">
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-darkblue py-16 text-white text-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Are you an Alumnus?</h2>
          <p className="text-skyblue/80 mb-8 text-lg">
            Registered alumni get exclusive access to member-only pricing and limited edition merchandise.
          </p>
          <Link href="/membership">
            <Button className="bg-maroon hover:bg-maroon-dark text-white px-8 py-3 text-lg">Join the Alumni</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
