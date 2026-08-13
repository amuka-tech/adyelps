import React from 'react';
import { Button } from '@/components/Button';

export const metadata = {
  title: 'Alumni Spotlight | LTC Alumni',
  description: 'Highlighting the success stories and achievements of distinguished LTC former pupils.',
};

export default function SpotlightPage() {
  const spotlights = [
    {
      name: "Dr. Florence Acen",
      class: "Class of 1988",
      field: "Medicine",
      story: "Dr. Acen is currently the Head Surgeon at Mulago National Referral Hospital. She attributes her passion for science and helping others to the strong foundation laid at LTC. Recently, she led a team that successfully separated conjoined twins, making national headlines.",
      quote: "LTC taught me that with discipline and focus, no dream is too big. The teachers believed in me before I believed in myself.",
      img: "FA"
    },
    {
      name: "Hon. James Oweka",
      class: "Class of 1992",
      field: "Public Service",
      story: "A dedicated public servant, Hon. Oweka serves as a Member of Parliament representing his home district. He has been instrumental in passing legislation that improves primary healthcare funding and rural electrification.",
      quote: "Leadership is about service, a value instilled in us during our time as prefects at LTC.",
      img: "JO"
    },
    {
      name: "Grace Kiconco",
      class: "Class of 2001",
      field: "Business & Entrepreneurship",
      story: "Grace is the founder and CEO of 'TechAgri,' a startup that uses mobile technology to connect rural farmers directly to markets. Her company recently secured $2M in seed funding and operates in three East African countries.",
      quote: "The diverse community at LTC prepared me to work with people from all walks of life.",
      img: "GK"
    }
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Page Header */}
      <section className="bg-white py-20 text-center border-b border-gray-200">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-maroon">Alumni Spotlight</h1>
        <p className="text-xl max-w-2xl mx-auto px-4 text-gray-600">
          Where are they now? Inspiring stories from our distinguished former pupils.
        </p>
      </section>

      {/* Spotlight Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="space-y-16">
            {spotlights.map((person, idx) => (
              <div key={idx} className={`flex flex-col ${idx % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 md:gap-12 items-center bg-white p-8 md:p-12 rounded-3xl shadow-lg border border-gray-100`}>
                <div className="w-full md:w-1/3">
                  <div className="aspect-square bg-skyblue/20 rounded-2xl flex items-center justify-center text-4xl font-bold text-darkblue relative overflow-hidden shadow-inner">
                    {/* Placeholder image */}
                    {person.img} Image
                    <div className="absolute inset-0 border-4 border-white/50 rounded-2xl"></div>
                  </div>
                </div>
                
                <div className="w-full md:w-2/3">
                  <div className="inline-block bg-pink/20 text-maroon font-semibold px-3 py-1 rounded-full text-sm mb-4">
                    {person.field}
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-1">{person.name}</h2>
                  <p className="text-maroon font-medium mb-6">{person.class}</p>
                  
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {person.story}
                  </p>
                  
                  <blockquote className="border-l-4 border-pink pl-4 italic text-gray-600 text-lg">
                    "{person.quote}"
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nominate Call to Action */}
      <section className="py-20 bg-maroon text-white text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold mb-6">Know an Inspiring LTC Alumnus?</h2>
          <p className="text-lg mb-8 text-pink/90">
            We are always looking for more success stories to feature in our Spotlight and inspire current pupils. Nominate a former classmate today!
          </p>
          <Button variant="secondary" size="lg">Nominate an Alumnus</Button>
        </div>
      </section>
    </div>
  );
}
