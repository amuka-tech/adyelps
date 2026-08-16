"use client";

import React, { useState, useEffect } from 'react';
import { showToast } from '@/lib/toast';
import { createClient } from '@/utils/supabase/client';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState<any>(null);
  const [preferences, setPreferences] = useState({
    email_enabled: true,
    sms_enabled: false,
    in_app_enabled: true,
    marketing_emails: false
  });
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          window.location.href = '/login';
          return;
        }

        const { data: userRes, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (userError) throw userError;
        setUser(userRes);

        const { data: prefsRes } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (prefsRes) {
          setPreferences(prefsRes);
        }
      } catch (error) {
        console.error("Failed to fetch session", error);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-8 h-8 border-4 border-maroon border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Account Settings</h1>
        <p className="text-gray-500 text-sm">Manage your profile, membership, and notification preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col p-2">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-6 py-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'profile' ? 'bg-maroon text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              Profile Information
            </button>
            <button 
              onClick={() => setActiveTab('subscription')}
              className={`w-full text-left px-6 py-4 rounded-2xl font-bold text-sm transition-all mt-1 ${activeTab === 'subscription' ? 'bg-maroon text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              Membership & Billing
            </button>
            <button 
              onClick={() => setActiveTab('privacy')}
              className={`w-full text-left px-6 py-4 rounded-2xl font-bold text-sm transition-all mt-1 ${activeTab === 'privacy' ? 'bg-maroon text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              Privacy Settings
            </button>
            <button 
              onClick={() => setActiveTab('notifications')}
              className={`w-full text-left px-6 py-4 rounded-2xl font-bold text-sm transition-all mt-1 ${activeTab === 'notifications' ? 'bg-maroon text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              Notifications
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          
          {activeTab === 'profile' && (
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                <p className="text-sm text-gray-500 mt-1">Update your personal details and how you appear in the directory.</p>
              </div>
              <div className="p-8 space-y-8">
                {/* Avatar Upload */}
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-3xl font-bold text-maroon uppercase border-4 border-white shadow-md">
                    {initials}
                  </div>
                  <div>
                    <button onClick={() => showToast()} className="bg-white border border-gray-200 text-gray-700 hover:border-maroon hover:text-maroon font-bold text-xs px-4 py-2 rounded-xl transition-colors shadow-sm mb-2">Upload New Photo</button>
                    <p className="text-xs text-gray-400 font-medium">JPG, GIF or PNG. Max size of 800K</p>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">First Name</label>
                    <input type="text" defaultValue={user.first_name} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon focus:border-maroon bg-gray-50 focus:bg-white transition-colors outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Last Name</label>
                    <input type="text" defaultValue={user.last_name} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon focus:border-maroon bg-gray-50 focus:bg-white transition-colors outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                    <input type="email" defaultValue={user.email} className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-100 text-gray-500 outline-none cursor-not-allowed" readOnly />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
                    <input type="tel" defaultValue={user.phone} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon focus:border-maroon bg-gray-50 focus:bg-white transition-colors outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Class Year</label>
                    <input type="text" defaultValue={user.classYear} className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-100 text-gray-500 outline-none cursor-not-allowed" readOnly />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Profession</label>
                    <input type="text" defaultValue={user.profession} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon focus:border-maroon bg-gray-50 focus:bg-white transition-colors outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Current Location</label>
                    <input type="text" defaultValue="Kampala, UG" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon focus:border-maroon bg-gray-50 focus:bg-white transition-colors outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bio</label>
                    <textarea rows={4} defaultValue="Passionate about building scalable web applications and mentoring young tech enthusiasts." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon focus:border-maroon bg-gray-50 focus:bg-white transition-colors outline-none resize-none"></textarea>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button onClick={() => showToast()} className="bg-maroon text-white font-bold px-8 py-3 rounded-xl shadow-md shadow-maroon/20 hover:bg-maroon-dark transition-all">Save Changes</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="space-y-6">
              <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="text-xl font-bold text-gray-900">Current Subscription</h2>
                </div>
                <div className="p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-6 border-2 border-maroon rounded-2xl bg-pink/20 mb-8 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-maroon/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
                    <div className="relative z-10">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-2xl font-bold text-maroon">Ordinary Member</h3>
                        <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Active</span>
                      </div>
                      <p className="text-gray-600 font-medium">UGX 50,000 / year</p>
                      <p className="text-gray-500 text-sm mt-4">Next billing date: <strong className="text-gray-900">December 31, 2026</strong></p>
                    </div>
                    <div className="mt-6 md:mt-0 flex flex-col space-y-3 relative z-10">
                      <button onClick={() => showToast()} className="bg-maroon text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-maroon/20 hover:bg-maroon-dark transition-all">Renew Now</button>
                      <button onClick={() => showToast()} className="bg-white text-gray-600 font-bold px-6 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-all text-xs">Cancel Auto-renewal</button>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-4">Upgrade Membership</h3>
                  <div className="border border-gray-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between bg-gray-50 group hover:bg-white hover:border-maroon/30 transition-colors">
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-maroon transition-colors">Life Member</h4>
                      <p className="text-sm font-medium text-gray-600 mb-2">UGX 1,000,000 <span className="text-gray-400 font-normal">(One-time payment)</span></p>
                      <p className="text-xs text-gray-500 max-w-sm leading-relaxed">Upgrade to unlock lifetime recognition, VIP seating, and a special lapel pin.</p>
                    </div>
                    <button onClick={() => showToast()} className="mt-6 md:mt-0 bg-white border border-gray-200 text-gray-700 hover:border-maroon hover:text-maroon font-bold text-sm px-6 py-3 rounded-xl transition-colors shadow-sm flex-shrink-0">
                      Upgrade to Life
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="text-xl font-bold text-gray-900">Payment History</h2>
                </div>
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50/50 text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                      <tr>
                        <th className="px-8 py-4">Date</th>
                        <th className="px-8 py-4">Description</th>
                        <th className="px-8 py-4">Amount</th>
                        <th className="px-8 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-8 py-5 text-sm font-medium text-gray-600">Jan 01, 2026</td>
                        <td className="px-8 py-5 font-bold text-gray-900">Ordinary Member Renewal</td>
                        <td className="px-8 py-5 text-sm font-medium text-gray-600">UGX 50,000</td>
                        <td className="px-8 py-5">
                          <span className="bg-green-50 text-green-700 border border-green-100 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Paid</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-xl font-bold text-gray-900">Privacy Settings</h2>
                <p className="text-sm text-gray-500 mt-1">Control who can see your contact info in the Alumni Directory.</p>
              </div>
              <div className="p-8">
                
                <h3 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-xs">Directory Contact Visibility</h3>
                <div className="space-y-4">
                  <label className="flex items-start p-4 border border-gray-200 rounded-2xl cursor-pointer group hover:border-maroon/30 hover:bg-gray-50 transition-all">
                    <input 
                      type="radio" 
                      name="visibility" 
                      className="mt-1 mr-4 w-5 h-5 text-maroon focus:ring-maroon accent-maroon" 
                      checked={!user.hide_contact_info} 
                      onChange={async () => {
                        setUser({...user, hide_contact_info: 0});
                        const supabase = createClient();
                        await supabase.from('users').update({ hide_contact_info: false }).eq('id', user.id);
                      }} 
                    />
                    <div>
                      <span className="block font-bold text-gray-900 group-hover:text-maroon transition-colors mb-1">Show Contact Info</span>
                      <span className="block text-sm text-gray-500 leading-relaxed">Your email and phone number will be visible to other registered members in the directory.</span>
                    </div>
                  </label>
                  
                  <label className="flex items-start p-4 border border-gray-200 rounded-2xl cursor-pointer group hover:border-maroon/30 hover:bg-gray-50 transition-all">
                    <input 
                      type="radio" 
                      name="visibility" 
                      className="mt-1 mr-4 w-5 h-5 text-maroon focus:ring-maroon accent-maroon" 
                      checked={!!user.hide_contact_info} 
                      onChange={async () => {
                        setUser({...user, hide_contact_info: 1});
                        const supabase = createClient();
                        await supabase.from('users').update({ hide_contact_info: true }).eq('id', user.id);
                      }} 
                    />
                    <div>
                      <div className="flex items-center mb-1">
                        <span className="block font-bold text-gray-900 group-hover:text-maroon transition-colors">Hide Contact Info</span>
                        <span className="ml-3 bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Secure Relay</span>
                      </div>
                      <span className="block text-sm text-gray-500 leading-relaxed">Your email and phone number will be hidden. Members can only contact you via the Secure Email Relay system.</span>
                    </div>
                  </label>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-maroon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                  Notification Preferences
                </h2>
                <p className="text-sm text-gray-500 mt-1">Choose how you want to be notified about activity on the platform.</p>
              </div>
              
              <div className="p-0">
                <div className="divide-y divide-gray-100">
                  
                  {/* Email Notifications */}
                  <div className="p-6 flex items-start justify-between hover:bg-gray-50/30 transition-colors">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1">Email Notifications</h3>
                      <p className="text-sm text-gray-500">Receive emails for direct messages, mentions, and urgent alerts.</p>
                    </div>
                    <button 
                      onClick={() => setPreferences(p => ({ ...p, email_enabled: !p.email_enabled }))}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-maroon focus:ring-offset-2 ${preferences.email_enabled ? 'bg-maroon' : 'bg-gray-200'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${preferences.email_enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* SMS Notifications */}
                  <div className="p-6 flex items-start justify-between hover:bg-gray-50/30 transition-colors">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1">SMS Notifications</h3>
                      <p className="text-sm text-gray-500">Get text messages for event updates and critical welfare announcements.</p>
                    </div>
                    <button 
                      onClick={() => setPreferences(p => ({ ...p, sms_enabled: !p.sms_enabled }))}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-maroon focus:ring-offset-2 ${preferences.sms_enabled ? 'bg-maroon' : 'bg-gray-200'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${preferences.sms_enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* In-App Notifications */}
                  <div className="p-6 flex items-start justify-between hover:bg-gray-50/30 transition-colors">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1">In-App Notifications</h3>
                      <p className="text-sm text-gray-500">Show notification badges and popups inside the application.</p>
                    </div>
                    <button 
                      onClick={() => setPreferences(p => ({ ...p, in_app_enabled: !p.in_app_enabled }))}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-maroon focus:ring-offset-2 ${preferences.in_app_enabled ? 'bg-maroon' : 'bg-gray-200'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${preferences.in_app_enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Marketing Emails */}
                  <div className="p-6 flex items-start justify-between hover:bg-gray-50/30 transition-colors">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1">Newsletters & Marketing</h3>
                      <p className="text-sm text-gray-500">Receive monthly newsletters, promotions, and alumni highlights.</p>
                    </div>
                    <button 
                      onClick={() => setPreferences(p => ({ ...p, marketing_emails: !p.marketing_emails }))}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-maroon focus:ring-offset-2 ${preferences.marketing_emails ? 'bg-maroon' : 'bg-gray-200'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${preferences.marketing_emails ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                </div>
                
                <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-green-600">{savedMessage}</span>
                  <button 
                    disabled={savingPrefs}
                    onClick={async () => {
                      setSavingPrefs(true);
                      setSavedMessage('');
                      try {
                        const supabase = createClient();
                        const { error } = await supabase.from('user_preferences').upsert({
                          user_id: user.id,
                          ...preferences
                        }, { onConflict: 'user_id' });
                        if (!error) {
                          setSavedMessage('Preferences updated successfully!');
                          setTimeout(() => setSavedMessage(''), 3000);
                        }
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setSavingPrefs(false);
                      }
                    }}
                    className="bg-maroon text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-maroon/20 hover:bg-maroon-dark transition-all disabled:opacity-50"
                  >
                    {savingPrefs ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
