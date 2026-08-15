import React, { useState } from 'react';
import { Card, CardContent } from '@/components/Card';
import { Button } from '@/components/Button';
import { createClient } from '@/utils/supabase/client';

export default function AdminGovernance({ polls, documents, fetchData }: { polls: any[], documents: any[], fetchData: () => void }) {
  const [activeTab, setActiveTab] = useState<'polls' | 'documents'>('polls');
  
  // Poll State
  const [pollTitle, setPollTitle] = useState('');
  const [pollDesc, setPollDesc] = useState('');
  const [pollType, setPollType] = useState('ELECTION');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [loadingPoll, setLoadingPoll] = useState(false);

  // Document State
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('CONSTITUTION');
  const [docUrl, setDocUrl] = useState('');
  const [loadingDoc, setLoadingDoc] = useState(false);

  const handleAddOption = () => setOptions([...options, '']);
  const handleOptionChange = (idx: number, val: string) => {
    const newOptions = [...options];
    newOptions[idx] = val;
    setOptions(newOptions);
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPoll(true);
    const validOptions = options.filter(o => o.trim() !== '');
    if (validOptions.length < 2) {
      alert("At least 2 options required.");
      setLoadingPoll(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.from('polls').insert({
        title: pollTitle,
        description: pollDesc,
        poll_type: pollType,
        start_date: startDate,
        end_date: endDate,
        options: validOptions
      });
      if (!error) {
        alert("Poll created successfully!");
        setPollTitle(''); setPollDesc(''); setOptions(['', '']);
        fetchData();
      } else {
        alert(error.message);
      }
    } catch (err) {
      alert("Network Error");
    } finally {
      setLoadingPoll(false);
    }
  };

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingDoc(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('documents').insert({
        title: docTitle,
        doc_type: docType,
        file_url: docUrl
      });
      if (!error) {
        alert("Document added successfully!");
        setDocTitle(''); setDocUrl('');
        fetchData();
      } else {
        alert(error.message);
      }
    } catch (err) {
      alert("Network Error");
    } finally {
      setLoadingDoc(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Governance Management</h3>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${activeTab === 'polls' ? 'bg-white shadow-sm text-maroon' : 'text-gray-500 hover:text-gray-900'}`}
            onClick={() => setActiveTab('polls')}
          >
            Polls & Elections
          </button>
          <button 
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${activeTab === 'documents' ? 'bg-white shadow-sm text-maroon' : 'text-gray-500 hover:text-gray-900'}`}
            onClick={() => setActiveTab('documents')}
          >
            Document Vault
          </button>
        </div>
      </div>

      {activeTab === 'polls' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Create New Poll</h4>
            <form onSubmit={handleCreatePoll} className="space-y-4 bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Title</label>
                <input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-maroon focus:border-maroon bg-white" value={pollTitle} onChange={e => setPollTitle(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Description</label>
                <textarea required rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-maroon focus:border-maroon bg-white" value={pollDesc} onChange={e => setPollDesc(e.target.value)}></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Type</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-maroon bg-white" value={pollType} onChange={e => setPollType(e.target.value)}>
                    <option value="ELECTION">Election</option>
                    <option value="GENERAL_POLL">General Poll</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Start Date</label>
                  <input required type="datetime-local" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-maroon bg-white" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">End Date</label>
                  <input required type="datetime-local" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-maroon bg-white" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200 mt-4">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Poll Options</label>
                {options.map((opt, idx) => (
                  <div key={idx} className="mb-2">
                    <input type="text" required placeholder={`Option ${idx + 1}`} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-maroon bg-white" value={opt} onChange={e => handleOptionChange(idx, e.target.value)} />
                  </div>
                ))}
                <button type="button" onClick={handleAddOption} className="text-sm font-bold text-maroon hover:underline mt-1">+ Add Option</button>
              </div>

              <Button type="submit" className="w-full mt-4 bg-maroon text-white" disabled={loadingPoll}>
                {loadingPoll ? 'Creating...' : 'Launch Poll'}
              </Button>
            </form>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Active Polls</h4>
            <div className="space-y-4">
              {polls.length === 0 ? <p className="text-gray-500 text-sm">No polls found.</p> : polls.map((poll: any) => (
                <div key={poll.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-bold text-gray-900">{poll.title}</h5>
                    <span className="text-[10px] uppercase font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-md">{poll.poll_type}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{new Date(poll.end_date) > new Date() ? 'Active until ' : 'Ended on '} {new Date(poll.end_date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Upload Document</h4>
            <form onSubmit={handleUploadDoc} className="space-y-4 bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Document Title</label>
                <input required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-maroon focus:border-maroon bg-white" value={docTitle} onChange={e => setDocTitle(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Type</label>
                <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-maroon bg-white" value={docType} onChange={e => setDocType(e.target.value)}>
                  <option value="CONSTITUTION">Constitution</option>
                  <option value="MINUTES">Meeting Minutes</option>
                  <option value="FINANCIAL">Financial Report</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">File URL (e.g., Google Drive Link)</label>
                <input required type="url" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-maroon bg-white" value={docUrl} onChange={e => setDocUrl(e.target.value)} />
              </div>
              <Button type="submit" className="w-full mt-4 bg-maroon text-white" disabled={loadingDoc}>
                {loadingDoc ? 'Uploading...' : 'Save to Vault'}
              </Button>
            </form>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Document Vault</h4>
            <div className="space-y-4">
              {documents.length === 0 ? <p className="text-gray-500 text-sm">No documents found.</p> : documents.map((doc: any) => (
                <div key={doc.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-gray-900 text-sm mb-1">{doc.title}</h5>
                    <span className="text-[10px] uppercase font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">{doc.doc_type}</span>
                  </div>
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-maroon hover:underline text-sm font-bold">View</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
