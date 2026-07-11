"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { showToast } from '@/lib/toast';

export default function MarketplacePage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Filters
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bizRes, sessionRes] = await Promise.all([
        fetch(`/api/marketplace/businesses?category=${category}&location=${location}`),
        fetch('/api/auth/me')
      ]);

      if (bizRes.ok) {
        const data = await bizRes.json();
        setBusinesses(data.businesses);
      }
      if (sessionRes.ok) {
        const data = await sessionRes.json();
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error("Failed to fetch marketplace data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [category, location]);

  const handleWhatsAppClick = (number: string) => {
    // Strip non-numeric chars
    const cleanNumber = number.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  return (
    <div className="animate-in fade-in duration-700 bg-white min-h-screen">
      
      {/* SHOP BY CATEGORY SECTION */}
      <div className="max-w-6xl mx-auto px-4 lg:px-8 pt-12 pb-20">
        <div className="text-center mb-10">
          <h1 className="text-[2.5rem] font-extrabold text-gray-900 tracking-tight mb-2">Shop by Category</h1>
          <p className="text-gray-500 font-medium text-lg">Explore our curated collections</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Fashion Card */}
          <div className="relative group rounded-[2rem] overflow-hidden aspect-square cursor-pointer shadow-sm hover:shadow-xl transition-all">
            <img src="/images/marketplace_fashion_1782107807505.png" alt="Fashion" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
            <div className="absolute bottom-8 left-8">
              <h3 className="text-white text-3xl font-bold tracking-tight mb-1">Fashion</h3>
              <p className="text-gray-300 text-sm mb-3">1243 products</p>
              <span className="text-white text-sm font-medium flex items-center group-hover:underline decoration-2 underline-offset-4">Shop Now <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg></span>
            </div>
          </div>

          {/* Electronics Card */}
          <div className="relative group rounded-[2rem] overflow-hidden aspect-square cursor-pointer shadow-sm hover:shadow-xl transition-all">
            <img src="/images/marketplace_electronics_1782107817319.png" alt="Electronics" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
            <div className="absolute bottom-8 left-8">
              <h3 className="text-white text-3xl font-bold tracking-tight mb-1">Electronics</h3>
              <p className="text-gray-300 text-sm mb-3">876 products</p>
              <span className="text-white text-sm font-medium flex items-center group-hover:underline decoration-2 underline-offset-4">Shop Now <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg></span>
            </div>
          </div>

          {/* Home & Living Card */}
          <div className="relative group rounded-[2rem] overflow-hidden aspect-square cursor-pointer shadow-sm hover:shadow-xl transition-all">
            <img src="/images/marketplace_home_1782107828552.png" alt="Home & Living" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
            <div className="absolute bottom-8 left-8">
              <h3 className="text-white text-3xl font-bold tracking-tight mb-1">Home & Living</h3>
              <p className="text-gray-300 text-sm mb-3">2156 products</p>
              <span className="text-white text-sm font-medium flex items-center group-hover:underline decoration-2 underline-offset-4">Shop Now <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg></span>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURED PRODUCTS SECTION */}
      <div className="bg-[#f8f9fa] -mx-4 lg:-mx-8 px-4 lg:px-8 py-20 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-[2rem] font-bold text-gray-900 tracking-tight mb-2">Featured Products</h2>
              <p className="text-gray-500 font-medium text-lg">Handpicked favorites just for you</p>
            </div>
            <button onClick={() => showToast()} className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center">
              View All <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center text-gray-500 font-medium">Loading catalog...</div>
          ) : businesses.length === 0 ? (
             <div className="py-20 text-center text-gray-500">No products available at the moment.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {businesses.slice(0, 4).map((biz, index) => {
                // Map first business to fashion, second to electronics, etc to mimic screenshot variations nicely
                const images = [
                  "/images/marketplace_product_1782107838067.png",
                  "/images/marketplace_fashion_1782107807505.png",
                  "/images/marketplace_home_1782107828552.png",
                  "/images/marketplace_electronics_1782107817319.png"
                ];
                const prices = ["$299.99", "$449.99", "$599.99", "$349.99"];
                const oldPrices = ["$399.99", null, "$749.99", null];
                const badges = ["Sale", "New", "Sale", "New"];
                
                return (
                  <div key={biz.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="relative aspect-square overflow-hidden bg-gray-100 p-6 flex items-center justify-center">
                      {badges[index] === "Sale" ? (
                        <div className="absolute top-4 left-4 bg-[#ff6b6b] text-white text-[10px] font-bold px-3 py-1 rounded-full z-10 shadow-sm tracking-wider uppercase">Sale</div>
                      ) : (
                        <div className="absolute top-4 left-4 bg-[#111928] text-white text-[10px] font-bold px-3 py-1 rounded-full z-10 shadow-sm tracking-wider uppercase">New</div>
                      )}
                      
                      <img src={images[index]} alt={biz.business_name} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out rounded-xl" />
                    </div>
                    
                    <div className="p-5 flex flex-col flex-1">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1.5">{biz.category}</p>
                      <h3 className="text-sm font-bold text-gray-900 mb-2 leading-tight line-clamp-1">{biz.business_name}</h3>
                      
                      <div className="flex items-center gap-1.5 mb-3">
                        <div className="flex text-[#ff7a00]">
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                          <svg className="w-3.5 h-3.5 text-gray-300 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        </div>
                        <span className="text-[11px] text-gray-500 font-medium">(1247)</span>
                      </div>
                      
                      <div className="mt-auto pt-2 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-extrabold text-gray-900 tracking-tight">{prices[index]}</span>
                          {oldPrices[index] && <span className="text-xs font-medium text-gray-400 line-through">{oldPrices[index]}</span>}
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleWhatsAppClick(biz.whatsapp_number)}
                        className="w-full bg-[#111928] hover:bg-black text-white font-bold text-xs py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
