"use client";

import React, { useState, useEffect } from 'react';

export default function GovernancePage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('polls');

  const [polls, setPolls] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [votingOn, setVotingOn] = useState<string | null>(null);

  useEffect(() => {
    fetchPolls();
    fetchDocuments();
    setLoading(false);
  }, []);

  const fetchPolls = async () => {
    try {
      const res = await fetch('/api/governance/polls');
      if (res.ok) setPolls((await res.json()).polls);
    } catch(e) {}
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/governance/documents');
      if (res.ok) setDocuments((await res.json()).documents);
    } catch(e) {}
  };

  const handleVote = async (pollId: string, optionId: string) => {
    if (!confirm("Are you sure? You cannot change your vote after casting it.")) return;
    
    setVotingOn(pollId);
    try {
      const res = await fetch(`/api/governance/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poll_option_id: optionId })
      });
      
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchPolls(); // Refresh tallies
      } else {
        alert(data.error || "Failed to cast vote");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setVotingOn(null);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Governance Portal</h1>
        <p className="text-gray-500 text-sm">Participate in transparent elections, constitutional amendments, and review financial audits.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col p-2">
            <button 
              onClick={() => setActiveTab('polls')}
              className={`w-full text-left px-6 py-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'polls' ? 'bg-maroon text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              Voting & Elections
            </button>
            <button 
              onClick={() => setActiveTab('documents')}
              className={`w-full text-left px-6 py-4 rounded-2xl font-bold text-sm transition-all mt-1 ${activeTab === 'documents' ? 'bg-maroon text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              Document Vault
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {loading ? (
            <div className="text-center py-20 text-gray-500">Loading portal...</div>
          ) : activeTab === 'polls' ? (
            <div className="space-y-6">
              {polls.length > 0 ? polls.map(poll => (
                <div key={poll.id} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex relative">
                  <div className={`w-2 ${poll.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <div className="p-8 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-[10px] font-bold text-maroon bg-pink px-3 py-1 rounded-full tracking-wider uppercase">{poll.poll_type}</span>
                          {poll.status === 'ACTIVE' ? (
                            <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full flex items-center tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                              LIVE
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full tracking-wider">CLOSED</span>
                          )}
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{poll.title}</h2>
                      </div>
                    </div>
                    
                    <p className="text-gray-500 text-sm mb-8 leading-relaxed">{poll.description}</p>
                    
                    <div className="space-y-3">
                      {poll.options.map((opt: any) => {
                        const percent = poll.total_votes > 0 ? Math.round((opt.vote_count / poll.total_votes) * 100) : 0;
                        return (
                          <div key={opt.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 relative overflow-hidden group hover:border-maroon/20 transition-colors">
                            <div className="absolute left-0 top-0 bottom-0 bg-maroon/10 transition-all duration-1000 ease-out" style={{ width: `${percent}%` }}></div>
                            <div className="relative flex justify-between items-center z-10">
                              <span className="font-bold text-gray-800 text-sm">{opt.option_text}</span>
                              <div className="flex items-center space-x-4">
                                <span className="text-xs font-bold text-gray-400 bg-white px-3 py-1.5 rounded-xl shadow-sm">{opt.vote_count} votes ({percent}%)</span>
                                {poll.status === 'ACTIVE' && (
                                  <button 
                                    className="bg-white text-maroon font-bold text-xs px-4 py-1.5 rounded-xl border border-gray-200 hover:border-maroon shadow-sm transition-all disabled:opacity-50"
                                    onClick={() => handleVote(poll.id, opt.id)}
                                    disabled={votingOn === poll.id}
                                  >
                                    Vote
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-xs text-gray-400 font-medium">Total Votes Cast: <strong className="text-gray-900">{poll.total_votes}</strong></span>
                      <span className="text-xs text-gray-400 font-medium">Deadline: {new Date(poll.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No active polls</h3>
                  <p className="text-gray-500 text-sm">There are currently no elections or amendments up for a vote.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Document Vault</h2>
                <p className="text-sm text-gray-500 mt-1">Securely review financial audits and constitutional documents.</p>
              </div>
              
              {documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map(doc => (
                    <a key={doc.id} href={doc.file_url} target="_blank" rel="noreferrer" className="flex items-center p-4 border border-gray-100 rounded-2xl hover:border-maroon hover:shadow-md transition-all group bg-gray-50 hover:bg-white">
                      <div className="w-12 h-12 bg-white text-maroon rounded-xl flex items-center justify-center mr-4 group-hover:bg-maroon group-hover:text-white transition-colors shadow-sm border border-gray-100">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-sm text-gray-900 group-hover:text-maroon transition-colors line-clamp-1">{doc.title}</h3>
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                          <span className="bg-gray-200 px-2 py-0.5 rounded uppercase tracking-wider text-[10px] font-bold mr-2">{doc.doc_type.replace('_', ' ')}</span>
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-sm">No documents have been uploaded to the vault yet.</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
