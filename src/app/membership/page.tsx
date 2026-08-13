import React from 'react';
import { Button } from '@/components/Button';
import { Card, CardContent, CardHeader } from '@/components/Card';
import { RegistrationForm } from '@/components/RegistrationForm';

export const metadata = {
  title: 'Membership | LTC Alumni',
  description: 'Join the LTC Alumni network and connect with old classmates in our directory.',
};

export default function MembershipPage() {
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
    <div className="flex flex-col w-full">
      {/* Page Header */}
      <section className="bg-darkblue py-20 text-white text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Membership</h1>
        <p className="text-xl text-skyblue max-w-2xl mx-auto px-4">
          Join the network, update your details, and connect with old friends.
        </p>
      </section>

      {/* Registration Form & Info */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
            
            {/* Form */}
            <div className="w-full lg:w-1/2">
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-bold text-gray-900">Registration Form</h2>
                  <p className="text-gray-500 text-sm mt-1">Please fill out your details to join the network.</p>
                </CardHeader>
                <CardContent>
                  <RegistrationForm />
                </CardContent>
              </Card>
            </div>

            {/* Tiers */}
            <div className="w-full lg:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Membership Categories</h2>
              <div className="space-y-6">
                {tiers.map((tier, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-maroon">{tier.name}</h3>
                      <p className="text-gray-500 font-medium mb-3">{tier.fee}</p>
                      <ul className="space-y-1">
                        {tier.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start text-sm text-gray-600">
                            <svg className="w-4 h-4 text-pink mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Directory Teaser */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Alumni Directory</h2>
            <p className="text-lg text-gray-600 mb-8">
              Registered members get exclusive access to our searchable alumni directory. 
              Find old classmates, expand your professional network, and stay connected.
            </p>
            <div className="p-8 bg-gray-50 rounded-2xl border border-gray-200">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Directory is Locked</h3>
              <p className="text-gray-500 mb-6">You must be logged in as an approved member to view the directory.</p>
              <Button variant="outline" className="mr-4 border-gray-300 text-gray-700">Log In</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
