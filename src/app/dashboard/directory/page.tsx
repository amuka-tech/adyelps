"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function DirectoryPage() {
  const [loading, setLoading] = useState(true);

  // Directory State
  const [alumni, setAlumni] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterProfession, setFilterProfession] = useState("");
  const [years, setYears] = useState<string[]>([]);
  const [professions, setProfessions] = useState<string[]>([]);

  // Removed modal state

  useEffect(() => {
    fetchDirectory();
  }, []);

  const fetchDirectory = async () => {
    try {
      const supabase = createClient();
      const { data: members, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, phone, class_year, profession, hide_contact_info')
        .order('first_name');
        
      if (members) {
        setAlumni(members);
        
        // Extract unique years and professions for filters
        const uniqueYears: any = Array.from(new Set(members.map((m: any) => m.class_year).filter(Boolean))).sort().reverse();
        const uniqueProf: any = Array.from(new Set(members.map((m: any) => m.profession).filter(Boolean))).sort();
        setYears(uniqueYears);
        setProfessions(uniqueProf);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Removed handleSendMessage
  const filteredAlumni = alumni.filter(alumnus => {
    const fullName = `${alumnus.first_name} ${alumnus.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());
    const matchesYear = filterYear === "" || alumnus.class_year === filterYear;
    const matchesProfession = filterProfession === "" || alumnus.profession === filterProfession;
    return matchesSearch && matchesYear && matchesProfession;
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Alumni Directory & Squad Finder</h1>
        <p className="text-gray-500 text-sm">Search by leaving year to find your primary school cohort, or connect by industry.</p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name..."
              className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon focus:border-maroon bg-gray-50 outline-none transition-colors hover:bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-48">
            <select 
              className="block w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-maroon focus:border-maroon bg-gray-50 outline-none transition-colors hover:bg-white"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            >
              <option value="">All Cohorts (Years)</option>
              {years.map(y => <option key={y} value={y}>Class of {y}</option>)}
            </select>
          </div>

          <div className="w-full md:w-64">
            <select 
              className="block w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-maroon focus:border-maroon bg-gray-50 outline-none transition-colors hover:bg-white"
              value={filterProfession}
              onChange={(e) => setFilterProfession(e.target.value)}
            >
              <option value="">All Professions</option>
              {professions.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          
          <Button className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-none shadow-none font-bold rounded-xl" onClick={() => {
            setSearchTerm(""); setFilterYear(""); setFilterProfession("");
          }}>
            Clear
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading directory...</div>
      ) : filteredAlumni.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAlumni.map((alumnus) => {
            const initials = `${alumnus.first_name[0]}${alumnus.last_name[0]}`;
            return (
              <div key={alumnus.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition-all hover:-translate-y-1">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-sm bg-gray-50 text-maroon border border-gray-100`}>
                  {initials}
                </div>
                <h3 className="font-bold text-lg text-gray-900 truncate">{alumnus.first_name} {alumnus.last_name}</h3>
                <p className="text-maroon font-bold text-xs uppercase tracking-wider mb-2">Class of {alumnus.class_year}</p>
                <p className="text-gray-500 text-sm mb-4 truncate">
                  {alumnus.profession || 'No profession listed'}
                </p>
                
                {alumnus.hide_contact_info ? (
                  <div className="mb-6">
                    <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">Contact info hidden</span>
                  </div>
                ) : (
                  <div className="text-xs text-gray-600 mb-6 truncate px-2 font-medium">
                    {alumnus.email}<br/>
                    {alumnus.phone || 'No phone'}
                  </div>
                )}
                
                <Link 
                  href={`/dashboard/messages/${alumnus.id}`}
                  className="w-full block text-center bg-white border border-gray-200 text-gray-700 hover:border-maroon hover:text-maroon py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors"
                >
                  Message
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No alumni found</h3>
          <p className="text-gray-500 text-sm">We couldn't find anyone matching your search criteria.</p>
        </div>
      )}

      {/* Removed Message Modal */}
    </div>
  );
}
