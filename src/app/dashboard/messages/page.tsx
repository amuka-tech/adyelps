"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function InboxPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInbox() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const userId = session.user.id;
        const { data } = await supabase.from('messages').select('*').or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
        if (data) {
          const groups: any = {};
          for (const m of data) {
            const contactId = m.sender_id === userId ? m.receiver_id : m.sender_id;
            if (!groups[contactId] || new Date(m.created_at) > new Date(groups[contactId].last_message_date)) {
              groups[contactId] = {
                contact_id: contactId,
                first_name: 'Member', last_name: String(contactId),
                last_message: m.content,
                last_message_date: m.created_at,
                unread_count: m.receiver_id === userId && !m.read_at ? 1 : 0
              };
            }
          }
          setConversations(Object.values(groups).sort((a: any, b: any) => new Date(b.last_message_date).getTime() - new Date(a.last_message_date).getTime()));
        }
      } catch (err) {
        console.error('Failed to fetch inbox', err);
      } finally {
        setLoading(false);
      }
    }
    fetchInbox();
  }, []);

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
      {/* LEFT PANE - INBOX LIST */}
      <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/50">
        <div className="p-4 border-b border-gray-100 bg-white">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Messages</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400 font-medium">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400 font-medium">No messages yet.<br/><Link href="/dashboard/directory" className="text-maroon hover:underline mt-2 inline-block">Find alumni to connect with.</Link></div>
          ) : (
            conversations.map((conv) => (
              <Link href={`/dashboard/messages/${conv.contact_id}`} key={conv.contact_id} className="block border-b border-gray-100 hover:bg-white transition-colors">
                <div className="p-4 flex gap-4 items-center">
                  <div className="w-12 h-12 bg-maroon text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {conv.first_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-gray-900 truncate">{conv.first_name} {conv.last_name}</h3>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {new Date(conv.last_message_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${conv.unread_count > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                      {conv.last_message}
                    </p>
                  </div>
                  {conv.unread_count > 0 && (
                    <div className="bg-maroon text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {conv.unread_count}
                    </div>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANE - EMPTY STATE */}
      <div className="w-2/3 flex flex-col items-center justify-center bg-white/50">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 tracking-tight mb-2">Your Messages</h3>
        <p className="text-gray-500 font-medium">Select a conversation or start a new one from the Directory.</p>
        <Link href="/dashboard/directory" className="mt-6 px-6 py-2.5 bg-maroon text-white rounded-xl font-bold shadow-md hover:bg-maroon-600 transition-colors">
          Browse Directory
        </Link>
      </div>
    </div>
  );
}
