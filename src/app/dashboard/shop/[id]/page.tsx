"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Card, CardContent } from '@/components/Card';

export default function MemberProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetch(`/api/public/shop/${id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.product) setProduct(data.product);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const addToCart = () => {
    setAddingToCart(true);
    
    // Simple localStorage Cart
    const currentCart = JSON.parse(localStorage.getItem('adyel_cart') || '[]');
    
    const memberPrice = Number(product.price) * 0.9;
    const existingItemIndex = currentCart.findIndex((item: any) => item.product_id === product.id);
    
    if (existingItemIndex >= 0) {
      currentCart[existingItemIndex].quantity += quantity;
    } else {
      currentCart.push({
        product_id: product.id,
        name: product.name,
        price: memberPrice,
        image_url: product.image_url,
        quantity: quantity
      });
    }
    
    localStorage.setItem('adyel_cart', JSON.stringify(currentCart));
    
    setTimeout(() => {
      setAddingToCart(false);
      alert('Added to cart!');
      router.push('/dashboard/shop/cart');
    }, 500);
  };

  if (loading) return <div className="p-20 text-center font-bold text-gray-500">Loading product...</div>;
  if (!product) return <div className="p-20 text-center font-bold text-red-500">Product not found.</div>;

  const regularPrice = Number(product.price);
  const memberPrice = regularPrice * 0.9;

  return (
    <div className="flex flex-col gap-6">
      
      {/* Breadcrumbs */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <Link href="/dashboard/shop" className="text-sm font-bold text-gray-500 hover:text-maroon transition-colors flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Shop
        </Link>
        <Link href="/dashboard/shop/cart" className="text-sm font-bold text-maroon hover:text-maroon-dark transition-colors flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          Cart
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Image */}
          <div className="w-full lg:w-1/2">
            <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden relative border border-gray-100 flex items-center justify-center">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9ImN1cnJlbnRDb2xvciIvPjwvc3ZnPg==')]"></div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <div className="mb-2 inline-block bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded w-fit uppercase tracking-wider shadow-sm">
              Member Exclusive: 10% Off
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            <div className="mb-8 flex items-end gap-4 pb-6 border-b border-gray-100">
              <div>
                <span className="text-xs text-gray-400 font-bold line-through block">UGX {regularPrice.toLocaleString()} (Public Price)</span>
                <span className="text-4xl font-extrabold text-maroon block">UGX {memberPrice.toLocaleString()}</span>
              </div>
              <div className="ml-auto">
                {product.stock_quantity > 0 ? (
                  <span className="text-green-600 bg-green-50 px-3 py-1 rounded text-sm font-bold border border-green-100">In Stock ({product.stock_quantity})</span>
                ) : (
                  <span className="text-red-600 bg-red-50 px-3 py-1 rounded text-sm font-bold border border-red-100">Sold Out</span>
                )}
              </div>
            </div>

            <div className="prose text-gray-600 mb-10 max-w-none">
              <p>{product.description}</p>
            </div>

            <div className="mt-auto bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="w-full sm:w-1/3">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Quantity</label>
                  <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden h-12">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 h-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                      disabled={product.stock_quantity === 0}
                    >-</button>
                    <input 
                      type="number" 
                      className="flex-1 w-full h-full text-center font-bold text-gray-900 focus:outline-none appearance-none" 
                      value={quantity}
                      readOnly
                    />
                    <button 
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      className="px-4 h-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                      disabled={product.stock_quantity === 0}
                    >+</button>
                  </div>
                </div>
                
                <div className="w-full sm:w-2/3">
                  <Button 
                    className="w-full h-12 text-lg font-bold shadow-md shadow-maroon/20" 
                    disabled={product.stock_quantity === 0 || addingToCart}
                    onClick={addToCart}
                  >
                    {addingToCart ? 'Adding...' : 'Add to Cart'}
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
