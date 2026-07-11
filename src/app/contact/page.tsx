import React from 'react';
import { Button } from '@/components/Button';
import { Card, CardContent } from '@/components/Card';

export const metadata = {
  title: 'Contact Us | Adyel Alumni',
  description: 'Get in touch with the Adyel Alumni Association executive committee.',
};

export default function ContactPage() {
  return (
    <div className="flex flex-col w-full">
      {/* Page Header */}
      <section className="bg-white py-20 text-center border-b border-gray-200">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-maroon">Contact Us</h1>
        <p className="text-xl max-w-2xl mx-auto px-4 text-gray-600">
          Have a question or want to get involved? We'd love to hear from you.
        </p>
      </section>

      <section className="py-16 bg-gray-50 flex-1">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
            
            {/* Contact Info */}
            <div className="w-full lg:w-1/3">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-pink/20 rounded-full flex items-center justify-center text-maroon mt-1 mr-4 flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Address</h3>
                    <p className="text-gray-600 text-sm mt-1">Adyel Day and Boarding Primary School<br />Lira City, Uganda</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-skyblue/20 rounded-full flex items-center justify-center text-darkblue mt-1 mr-4 flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Email</h3>
                    <p className="text-gray-600 text-sm mt-1">info@adyelalumni.org<br />exec@adyelalumni.org</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-maroon/10 rounded-full flex items-center justify-center text-maroon mt-1 mr-4 flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Phone</h3>
                    <p className="text-gray-600 text-sm mt-1">+256 700 000000<br />+256 770 000000</p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Follow Us</h2>
              <div className="flex space-x-4">
                <a href="#" className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-maroon shadow-sm hover:shadow-md hover:bg-maroon hover:text-white transition-all">
                  <span className="font-bold">f</span>
                </a>
                <a href="#" className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-maroon shadow-sm hover:shadow-md hover:bg-maroon hover:text-white transition-all">
                  <span className="font-bold">X</span>
                </a>
                <a href="#" className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-maroon shadow-sm hover:shadow-md hover:bg-maroon hover:text-white transition-all">
                  <span className="font-bold">W</span>
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="w-full lg:w-2/3">
              <Card className="shadow-lg border-0 h-full">
                <CardContent className="p-8 md:p-10">
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name</label>
                        <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-maroon focus:border-maroon bg-gray-50" placeholder="John Doe" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Your Email</label>
                        <input type="email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-maroon focus:border-maroon bg-gray-50" placeholder="john@example.com" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                      <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-maroon focus:border-maroon bg-gray-50" placeholder="How can we help you?" />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                      <textarea rows={6} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-maroon focus:border-maroon bg-gray-50" placeholder="Type your message here..."></textarea>
                    </div>

                    <Button size="lg" className="w-full md:w-auto shadow-md">Send Message</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            
          </div>
        </div>
      </section>
    </div>
  );
}
