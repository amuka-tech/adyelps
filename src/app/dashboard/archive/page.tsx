"use client";

import React from 'react';
import { showToast } from '@/lib/toast';

export default function ArchivePage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            Nostalgia & Yearbook Archive <span className="text-xl">🎓</span>
          </h1>
          <p className="text-gray-500 text-sm">A trip down memory lane. The history of Adyel.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Photo Galleries */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Historical Archives</h3>
              <button onClick={() => showToast()} className="text-sm font-bold text-maroon bg-pink px-4 py-2 rounded-full hover:bg-maroon hover:text-white transition-colors">Upload Memory</button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="group cursor-pointer relative rounded-2xl overflow-hidden aspect-video bg-gray-200">
                <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80" alt="Students" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                  <span className="text-white font-bold">Class of 1998</span>
                  <span className="text-white/70 text-xs">Graduation Day</span>
                </div>
              </div>
              <div className="group cursor-pointer relative rounded-2xl overflow-hidden aspect-video bg-gray-200">
                <img src="https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&q=80" alt="Building" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                  <span className="text-white font-bold">The Main Block</span>
                  <span className="text-white/70 text-xs">Taken in 2005</span>
                </div>
              </div>
              <div className="group cursor-pointer relative rounded-2xl overflow-hidden aspect-video bg-gray-200">
                <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80" alt="Classroom" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                  <span className="text-white font-bold">Primary 4 Classroom</span>
                  <span className="text-white/70 text-xs">Mrs. Akello's Class</span>
                </div>
              </div>
              <div onClick={() => showToast()} className="group cursor-pointer relative rounded-2xl overflow-hidden aspect-video bg-gray-200 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-2 text-gray-400 shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                  </div>
                  <span className="font-bold text-gray-600 text-sm">View All 142 Photos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hall of Fame */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Hall of Fame: Head Prefects</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                    <th className="pb-4 font-semibold">Year</th>
                    <th className="pb-4 font-semibold">Head Boy</th>
                    <th className="pb-4 font-semibold">Head Girl</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    { year: 1998, boy: "James Ocen", girl: "Sarah Auma" },
                    { year: 1999, boy: "David Okello", girl: "Mary Akello" },
                    { year: 2000, boy: "Patrick Otim", girl: "Grace Apio" },
                    { year: 2001, boy: "Emmanuel Ojok", girl: "Florence Atim" }
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 font-bold text-maroon">{row.year}</td>
                      <td className="py-4 text-gray-800 font-medium">{row.boy}</td>
                      <td className="py-4 text-gray-800 font-medium">{row.girl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-center">
              <button onClick={() => showToast()} className="text-sm font-bold text-maroon hover:underline">Load More Years</button>
            </div>
          </div>
        </div>

        {/* Sidebar items for Archive */}
        <div className="space-y-8">
          {/* School Anthem */}
          <div className="bg-maroon rounded-[2rem] p-8 text-white relative overflow-hidden shadow-lg shadow-maroon/20">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-xl"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">The School Anthem</h3>
              <div className="space-y-4 text-white/90 text-sm leading-relaxed italic border-l-4 border-pink pl-4">
                <p>Oh Adyel, our beloved school,<br/>The fountain of knowledge and truth.<br/>We sing your praises loud and clear,<br/>For shaping the minds of our youth.</p>
                <p>Forward we march with heads held high,<br/>With discipline, hard work, and grace.<br/>Once an Adyelite, always an Adyelite,<br/>We make the world a better place!</p>
              </div>
              <button onClick={() => showToast("Audio playback coming soon!", "info")} className="mt-8 w-full bg-white text-maroon font-bold py-3 rounded-xl shadow-sm hover:bg-gray-50 transition-colors">Play Audio</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
