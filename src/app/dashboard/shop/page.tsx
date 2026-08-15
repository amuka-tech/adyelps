"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';
import { createClient } from '@/utils/supabase/client';

export default function MemberShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('shop_products').select('*').eq('status', 'ACTIVE');
        if (data) setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Alumni Shop</h1>
          <p className="text-gray-500">Exclusive merchandise with member pricing.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/dashboard/shop/orders">
            <Button variant="outline" className="text-gray-600 border-gray-300">My Orders</Button>
          </Link>
          <Link href="/dashboard/shop/cart">
            <Button className="bg-darkblue hover:bg-blue-900 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              View Cart
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="w-10 h-10 border-4 border-maroon border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center p-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No products available</h3>
          <p className="text-gray-500">Check back soon for new merchandise!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const regularPrice = Number(product.price);
            const memberPrice = regularPrice * 0.9; // 10% member discount

            return (
              <Card key={product.id} className="flex flex-col group border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all">
                <div className="h-56 bg-gray-50 relative flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9ImN1cnJlbnRDb2xvciIvPjwvc3ZnPg==')]"></div>
                  )}
                  {product.stock_quantity === 0 && (
                    <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider">
                      Sold Out
                    </div>
                  )}
                  {product.stock_quantity > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-3 py-1.5 rounded shadow-sm uppercase tracking-wider">
                      10% OFF
                    </div>
                  )}
                </div>
                <CardContent className="flex-1 flex flex-col p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-maroon transition-colors">{product.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{product.description}</p>
                  
                  <div className="flex flex-col mb-4">
                    <span className="text-xs text-gray-400 font-medium line-through">UGX {regularPrice.toLocaleString()} (Public)</span>
                    <span className="text-xl font-extrabold text-maroon">UGX {memberPrice.toLocaleString()}</span>
                  </div>
                  
                  <Link href={`/dashboard/shop/${product.id}`} className="block w-full">
                    <Button variant="outline" className="w-full border-gray-200 text-gray-700 hover:border-maroon hover:text-maroon transition-colors">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
