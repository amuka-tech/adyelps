"use client";

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/Card';
import { RegistrationForm } from '@/components/RegistrationForm';
import Link from 'next/link';

export default function RegisterPage() {
  const tiers = [
    {
      name: "Ordinary Member",
      fee: "UGX 50,000 / year",
      benefits: ["Access to Alumni Directory", "Monthly Newsletter", "Voting Rights at AGM"]
    },
    {
      name: "Life Member",
      fee: "UGX 1,000,000 (One-time)",
      benefits: ["All Ordinary benefits", "Lifetime recognition", "VIP Seating at Annual Events", "Special Lapel Pin"]
    },
    {
      name: "Honorary Member",
      fee: "By Nomination",
      benefits: ["Awarded to individuals who have made extraordinary contributions to the school or society."]
    }
  ];

  return (
    <div className="flex flex-col w-full bg-gray-50 min-h-[calc(100vh-80px)] py-12">
      <div className="container mx-auto px-4">
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-maroon rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg shadow-maroon/20">
            A
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create an Account</h1>
          <p className="text-gray-600 mt-2">Join the Alumni Network today</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
          
          {/* Registration Form (Left Column) */}
          <div className="w-full lg:w-1/2">
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900">Registration Form</h2>
                <p className="text-gray-500 text-sm mt-1">Please fill out your details to join the network.</p>
              </CardHeader>
              <CardContent className="p-8">
                <RegistrationForm />
                <div className="mt-8 text-center text-sm text-gray-600 border-t border-gray-100 pt-6">
                  Already have an account? <Link href="/login" className="text-maroon font-bold hover:underline">Log In</Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Membership Categories (Right Column) */}
          <div className="w-full lg:w-1/2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 px-2">Membership Categories</h2>
            <div className="space-y-6">
              {tiers.map((tier, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-maroon/30 transition-colors">
                  <div>
                    <h3 className="text-xl font-bold text-maroon mb-1">{tier.name}</h3>
                    <p className="text-gray-700 font-medium mb-4">{tier.fee}</p>
                    <ul className="space-y-2">
                      {tier.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start text-sm text-gray-600">
                          <svg className="w-5 h-5 text-pink flex-shrink-0 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span className="leading-tight pt-0.5">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 bg-blue-50 p-6 rounded-2xl border border-blue-100 text-blue-900">
              <h3 className="font-bold mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Why Join?
              </h3>
              <p className="text-sm opacity-90 leading-relaxed">
                Registered members get exclusive access to our searchable alumni directory, the ability to promote businesses in the marketplace, post job openings, and receive special discounts at the Alumni Shop.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
