import React from 'react';
import Image from 'next/image';

export const metadata = {
  title: 'About Us | Adyel Alumni',
  description: 'Learn about the history of Adyel Adyel and the mission of our Alumni Network.',
};

export default function AboutPage() {
  

  return (
    <div className="flex flex-col w-full">
      {/* Page Header */}
      <section className="bg-maroon py-20 text-white text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
        <p className="text-xl text-pink max-w-2xl mx-auto px-4">
          Preserving our shared heritage and uniting former pupils.
        </p>
      </section>

      {/* History Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-4 border-skyblue inline-block pb-2">Our Story</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              After years of personal and academic growth, career milestones, and life experiences, the Old Boys and Old Girls (OBs & OGs) of Adyel Primary School have come together to form a strong Alumni network. Our goal is to reconnect, support one another, and give back to our beloved alma mater and community in ways that matter.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              This initiative is fueled by gratitude, responsibility, and a deep desire to uplift others—a true reflection of the strong foundation and values that Adyel Primary School instilled in us during our early school days.
            </p>
          </div>
        </div>
      </section>

      {/* The Alumni Association */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">The Alumni Network</h2>
            <p className="text-lg text-gray-700">
              Formed to unite former students, our network serves as a bridge between the past and the future.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-skyblue/20 rounded-full flex items-center justify-center text-darkblue mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              </div>
              <h3 className="text-2xl font-bold text-maroon mb-4">Our Vision</h3>
              <p className="text-gray-600">
                A united and compassionate community that transforms lives through education, social support, and community-driven development.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-pink/20 rounded-full flex items-center justify-center text-maroon mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
              <h3 className="text-2xl font-bold text-maroon mb-4">Our Mission</h3>
              <p className="text-gray-600">
                To mobilize all members of the Adyel, partnering with stakeholders to promote education, dignity, and community wellbeing through sustainable initiatives and school support programs.
              </p>
            </div>
          </div>
        </div>
      </section>

      
    </div>
  );
}
