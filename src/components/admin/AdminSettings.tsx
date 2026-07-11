"use client";

import React, { useState, useEffect } from 'react';

export default function AdminSettings({ settingsData, fetchData }: { settingsData: any, fetchData: () => void }) {
  const [settingsForm, setSettingsForm] = useState({
    momo_tax_rate: '1.5',
    currency: 'UGX',
    platform_fee: '2.0',
    smtp_server: '',
    smtp_port: '',
    smtp_user: '',
    smtp_password: '',
    sms_gateway_key: '',
    flutterwave_key: '',
    paystack_key: ''
  });

  useEffect(() => {
    if (settingsData) {
      setSettingsForm({
        momo_tax_rate: settingsData.momo_tax_rate || '1.5',
        currency: settingsData.currency || 'UGX',
        platform_fee: settingsData.platform_fee || '2.0',
        smtp_server: settingsData.smtp_server || '',
        smtp_port: settingsData.smtp_port || '',
        smtp_user: settingsData.smtp_user || '',
        smtp_password: settingsData.smtp_password || '',
        sms_gateway_key: settingsData.sms_gateway_key || '',
        flutterwave_key: settingsData.flutterwave_key || '',
        paystack_key: settingsData.paystack_key || ''
      });
    }
  }, [settingsData]);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    for (const [key, value] of Object.entries(settingsForm)) {
      await fetch('/api/superadmin/settings', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ key, value }) 
      });
    }
    alert('Settings updated successfully!');
    fetchData();
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6">Global Settings</h3>
      <form onSubmit={handleUpdateSettings} className="space-y-6 max-w-3xl">
        
        <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl space-y-4">
          <h4 className="font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">Financial Settings</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Mobile Money Tax Rate (%)</label>
              <input required type="number" step="0.1" value={settingsForm.momo_tax_rate} onChange={e => setSettingsForm({...settingsForm, momo_tax_rate: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Platform Fee (%)</label>
              <input required type="number" step="0.1" value={settingsForm.platform_fee} onChange={e => setSettingsForm({...settingsForm, platform_fee: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Default Currency</label>
            <input required type="text" value={settingsForm.currency} onChange={e => setSettingsForm({...settingsForm, currency: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon outline-none uppercase" />
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl space-y-4">
          <h4 className="font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">Communication Gateways</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">SMTP Server</label>
              <input type="text" placeholder="smtp.mailgun.org" value={settingsForm.smtp_server} onChange={e => setSettingsForm({...settingsForm, smtp_server: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">SMTP Port</label>
              <input type="text" placeholder="587" value={settingsForm.smtp_port} onChange={e => setSettingsForm({...settingsForm, smtp_port: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">SMTP User</label>
              <input type="text" placeholder="postmaster@domain.com" value={settingsForm.smtp_user} onChange={e => setSettingsForm({...settingsForm, smtp_user: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">SMTP Password</label>
              <input type="password" placeholder="••••••••" value={settingsForm.smtp_password} onChange={e => setSettingsForm({...settingsForm, smtp_password: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">SMS Gateway API Key</label>
            <input type="password" placeholder="sk_live_..." value={settingsForm.sms_gateway_key} onChange={e => setSettingsForm({...settingsForm, sms_gateway_key: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon outline-none" />
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl space-y-4">
          <h4 className="font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">Payment Processors</h4>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Flutterwave Secret Key</label>
            <input type="password" placeholder="FLWSECK_..." value={settingsForm.flutterwave_key} onChange={e => setSettingsForm({...settingsForm, flutterwave_key: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Paystack Secret Key</label>
            <input type="password" placeholder="sk_live_..." value={settingsForm.paystack_key} onChange={e => setSettingsForm({...settingsForm, paystack_key: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-maroon outline-none" />
          </div>
        </div>

        <button type="submit" className="w-full bg-maroon text-white font-medium px-6 py-4 rounded-xl hover:bg-maroon-dark transition-colors shadow-md shadow-maroon/20">Save All Configurations</button>
      </form>
    </div>
  );
}
