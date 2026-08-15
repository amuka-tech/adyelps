"use client";

import React, { useEffect, useState, useRef, use } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function ConversationPage({ params }: { params: Promise<{ userId: string }> }) {
  const resolvedParams = use(params);
  const [messages, setMessages] = useState<any[]>([]);
  const [contact, setContact] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [meId, setMeId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChat = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const me = session.user.id;
      setMeId(me);

      const [msgRes, contactRes] = await Promise.all([
        supabase.from('messages')
          .select('*')
          .or(`and(sender_id.eq.${me},receiver_id.eq.${resolvedParams.userId}),and(sender_id.eq.${resolvedParams.userId},receiver_id.eq.${me})`)
          .order('created_at', { ascending: true }),
        supabase.from('users').select('*').eq('id', resolvedParams.userId).single()
      ]);

      if (msgRes.data) setMessages(msgRes.data);
      if (contactRes.data) setContact(contactRes.data);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      await supabase.from('messages').update({ read_at: new Date().toISOString() })
        .eq('sender_id', resolvedParams.userId).eq('receiver_id', session.user.id).is('read_at', null);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchChat();
    markAsRead();
    
    // Poll every 5 seconds
    const interval = setInterval(() => {
      fetchChat();
    }, 5000);
    return () => clearInterval(interval);
  }, [resolvedParams.userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.from('messages').insert({
        sender_id: session.user.id,
        receiver_id: resolvedParams.userId,
        content: newMessage
      });

      if (!error) {
        setNewMessage('');
        fetchChat(); // Refresh instantly
      }
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
      
      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/messages" className="text-gray-400 hover:text-maroon transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </Link>
            {contact ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-maroon text-white rounded-full flex items-center justify-center font-bold">
                  {contact.first_name[0]}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 leading-none">{contact.first_name} {contact.last_name}</h2>
                  <p className="text-xs text-gray-500 font-medium mt-1">{contact.profession}</p>
                </div>
              </div>
            ) : (
              <div className="h-10 flex items-center">Loading contact...</div>
            )}
          </div>
        </div>
        
        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
          {loading ? (
            <div className="text-center text-gray-400 font-medium mt-10">Loading conversation...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-400 font-medium mt-10">
              No messages yet. Say hello! 👋
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMine = msg.sender_id === meId;
              return (
                <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${isMine ? 'bg-maroon text-white rounded-tr-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'}`}>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                    <div className={`text-[10px] mt-1.5 font-medium ${isMine ? 'text-maroon-200' : 'text-gray-400'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <input 
              type="text" 
              placeholder="Type your message..." 
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-6 py-3.5 focus:outline-none focus:ring-2 focus:ring-maroon/20 focus:border-maroon transition-all"
            />
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="w-12 h-12 bg-maroon rounded-full flex items-center justify-center text-white shadow-md hover:bg-maroon-600 disabled:opacity-50 transition-all flex-shrink-0"
            >
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
