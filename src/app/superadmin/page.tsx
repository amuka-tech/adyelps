"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminJobs from '@/components/admin/AdminJobs';
import AdminBusinesses from '@/components/admin/AdminBusinesses';
import AdminApprovals from '@/components/admin/AdminApprovals';
import AdminObituaries from '@/components/admin/AdminObituaries';
import AdminCondolences from '@/components/admin/AdminCondolences';
import AdminRates from '@/components/admin/AdminRates';
import AdminProjects from '@/components/admin/AdminProjects';
import AdminNews from '@/components/admin/AdminNews';
import AdminEvents from '@/components/admin/AdminEvents';
import AdminShop from '@/components/admin/AdminShop';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminGovernance from '@/components/admin/AdminGovernance';
import AdminAnalytics from '@/components/admin/AdminAnalytics';

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [error, setError] = useState('');
  
  // App-level state for Badges & Basic Modules
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  
  // Shared state that needs to be passed down
  const [contributions, setContributions] = useState<any[]>([]);
  const [condolences, setCondolences] = useState<any[]>([]);
  const [pendingJobs, setPendingJobs] = useState<any[]>([]);
  const [pendingBusinesses, setPendingBusinesses] = useState<any[]>([]);
  const [activeBusinesses, setActiveBusinesses] = useState<any[]>([]);
  const [rates, setRates] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [shopProducts, setShopProducts] = useState<any[]>([]);
  const [shopOrders, setShopOrders] = useState<any[]>([]);
  const [settingsData, setSettingsData] = useState<any>(null);
  const [polls, setPolls] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/login';
        return;
      }

      let usersQuery = supabase.from('users').select('*');
      if (search) {
        usersQuery = usersQuery.ilike('first_name', `%${search}%`);
      }

      const [
        { data: usersData },
        { count: usersCount },
        { data: logsData },
        { data: condolencesData },
        { data: ratesData },
        { data: contributionsData },
        { data: jobsData },
        { data: activeBizData },
        { data: pendingBizData },
        { data: projectsData },
        { data: settingsRows },
        { data: newsData },
        { data: productsData },
        { data: ordersData },
        { data: pollsData },
        { data: docsData }
      ] = await Promise.all([
        usersQuery,
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('condolences').select('*').eq('status', 'PENDING'),
        supabase.from('deduction_rates').select('*'),
        supabase.from('contributions').select('*').eq('status', 'PENDING'),
        supabase.from('jobs').select('*').eq('status', 'PENDING'),
        supabase.from('businesses').select('*').eq('status', 'ACTIVE'),
        supabase.from('businesses').select('*').eq('status', 'PENDING'),
        supabase.from('projects').select('*'),
        supabase.from('system_settings').select('*'),
        supabase.from('news_articles').select('*'),
        supabase.from('shop_products').select('*'),
        supabase.from('shop_orders').select('*'),
        supabase.from('polls').select('*'),
        supabase.from('documents').select('*')
      ]);

      if (usersData) setUsers(usersData);
      setStats({ total_users: usersCount || 0 });
      if (logsData) setLogs(logsData);
      if (condolencesData) setCondolences(condolencesData);
      if (ratesData) setRates(ratesData);
      if (contributionsData) setContributions(contributionsData);
      if (jobsData) setPendingJobs(jobsData);
      if (projectsData) setProjects(projectsData);
      if (newsData) setNews(newsData);
      if (productsData) setShopProducts(productsData);
      if (ordersData) setShopOrders(ordersData);
      
      setPendingBusinesses(pendingBizData || []);
      setActiveBusinesses(activeBizData || []);

      if (settingsRows) {
        const settingsMap: any = {};
        settingsRows.forEach((s: any) => settingsMap[s.setting_key] = s.setting_value);
        setSettingsData(settingsMap);
      }
      if (pollsData) setPolls(pollsData);
      if (docsData) setDocuments(docsData);
    } catch (err) {
      setError("Network Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  // Handlers needed for components that just render arrays
  const handleRoleChange = async (userId: string, roleId: number) => {
    const supabase = createClient();
    const { error } = await supabase.from('users').update({ role: roleId }).eq('id', userId);
    if (!error) fetchData(); else alert(error.message);
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    const reason = prompt(`Reason for changing status to ${newStatus}?`);
    if (!reason) return;
    const supabase = createClient();
    const { error } = await supabase.from('users').update({ account_status: newStatus }).eq('id', userId);
    if (!error) fetchData(); else alert(error.message);
  };

  const handleVerifyContribution = async (id: number, status: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('contributions').update({ status }).eq('id', id);
    if (!error) fetchData(); else alert(`Error setting status to ${status}`);
  };

  const handleModerateJob = async (id: number, status: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('jobs').update({ status }).eq('id', id);
    if (!error) fetchData(); else alert(`Error moderating job`);
  };

  const handleModerateBusiness = async (id: number, status: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('businesses').update({ status }).eq('id', id);
    if (!error) fetchData(); else alert(`Error moderating business`);
  };

  const handleModerateCondolence = async (id: number, status: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('condolences').update({ status }).eq('id', id);
    if (!error) fetchData(); else alert(`Error moderating condolence`);
  };

  const handleUpdateOrder = async (orderId: number, status: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('shop_orders').update({ status }).eq('id', orderId);
    if (!error) fetchData(); else alert(`Error updating order`);
  };

  if (error) return <div className="h-screen flex items-center justify-center bg-[#f4f7f6] text-red-500 font-bold text-2xl">{error}</div>;
  if (loading) return <div className="h-screen flex items-center justify-center bg-[#f4f7f6] text-gray-500 font-medium">Loading Workspace...</div>;

  const NavItem = ({ id, label, icon, badge }: { id: string, label: string, icon?: React.ReactNode, badge?: number }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center justify-between px-4 py-3 mb-1.5 rounded-2xl transition-all duration-300 font-medium text-sm group ${activeTab === id ? 'bg-maroon text-white shadow-md shadow-maroon/20 translate-x-1' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1'}`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded-lg transition-colors ${activeTab === id ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-white group-hover:shadow-sm'}`}>
          {icon || <div className={`w-2 h-5 rounded-full ${activeTab === id ? 'bg-white' : 'bg-transparent'}`}></div>}
        </div>
        {label}
      </div>
      {badge ? <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === id ? 'bg-white text-maroon' : 'bg-pink text-maroon'}`}>{badge}</span> : null}
    </button>
  );

  return (
    <div className="h-screen w-full flex bg-white lg:bg-[#f4f7f6] text-gray-800 font-sans overflow-hidden relative">

      {/* SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 h-[calc(100vh-2rem)] bg-white m-4 rounded-[2rem] shadow-sm overflow-y-auto hide-scrollbar border border-gray-100">
        <div className="p-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-maroon rounded-full flex items-center justify-center text-white font-bold text-xl">A</div>
            <span className="font-bold text-xl text-gray-900">Adyel Admin</span>
          </div>
        </div>

        <div className="px-4 flex-1">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-4 mt-2">Platform Insights</div>
          <NavItem id="analytics" label="Analytics Dashboard" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>} />

          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-4 mt-6">Governance</div>
          <NavItem id="governance" label="Governance Management" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>} />
          <NavItem id="users" label="Role Management" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>} badge={users.filter(u => u.account_status === 'PENDING').length || undefined} />
          <NavItem id="audit" label="Audit Trail" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>} />
          <NavItem id="settings" label="Global Settings" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>} />

          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-4 mt-6">Welfare</div>
          <NavItem id="approvals" label="Fund Approvals" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>} badge={contributions.length || undefined} />
          <NavItem id="obituaries" label="Obituaries" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>} />
          <NavItem id="condolences" label="Condolence Moderation" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>} badge={condolences.length || undefined} />
          <NavItem id="rates" label="Tax Rates" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"></path></svg>} />

          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-4 mt-6">Network</div>
          <NavItem id="jobs" label="Job Moderation" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>} badge={pendingJobs.length || undefined} />
          <NavItem id="businesses" label="Biz Moderation" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>} badge={pendingBusinesses.length || undefined} />

          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-4 mt-6">Content Management</div>
          <NavItem id="news" label="News Articles" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15"></path></svg>} />
          <NavItem id="events" label="Events & Ticketing" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>} />
          <NavItem id="projects" label="Projects & Updates" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>} />
          <NavItem id="shop_products" label="Shop Inventory" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>} />
          <NavItem id="shop_orders" label="Shop Orders" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>} badge={shopOrders.filter(o => o.status === 'PENDING').length || undefined} />

          <div className="text-xs font-bold text-maroon uppercase tracking-wider mb-3 px-4 mt-8">Quick Links</div>
          <a href="/dashboard/directory" className="w-full flex items-center justify-between px-4 py-2 mb-1 rounded-2xl transition-all font-medium text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900">Alumni Directory</a>
          <a href="/dashboard/welfare" className="w-full flex items-center justify-between px-4 py-2 mb-1 rounded-2xl transition-all font-medium text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900">Welfare Ledger</a>
          <a href="/dashboard/careers" className="w-full flex items-center justify-between px-4 py-2 mb-1 rounded-2xl transition-all font-medium text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900">Career Hub</a>
          <a href="/dashboard/marketplace" className="w-full flex items-center justify-between px-4 py-2 mb-1 rounded-2xl transition-all font-medium text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900">Marketplace</a>
        </div>

        <div className="p-4 mt-auto">
          <div className="bg-gray-900 rounded-3xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
            <h4 className="font-bold mb-2 relative z-10">System Status</h4>
            <p className="text-xs text-gray-400 mb-4 relative z-10">All systems operational.</p>
            <button className="w-full bg-white text-gray-900 py-2 rounded-xl text-sm font-bold shadow-sm" onClick={() => window.location.href = '/'}>Exit to Site</button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 h-screen overflow-y-auto hide-scrollbar px-0 lg:p-8 pb-24 lg:pb-8 relative">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-4 lg:mb-10 sticky top-0 bg-white lg:bg-[#f4f7f6]/80 backdrop-blur-xl z-30 py-3 px-4 lg:px-8 border-b border-gray-100 lg:border-none">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-maroon rounded-full flex items-center justify-center text-white font-bold text-sm">A</div>
            <span className="font-bold text-gray-900 lg:hidden">Admin Panel</span>
            {/* desktop search */}
            <div className="relative w-full max-w-md hidden lg:block ml-4">
              <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input type="text" placeholder="Search data globally..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white/60 focus:bg-white border border-gray-200 rounded-full py-2.5 pl-12 pr-4 shadow-sm text-sm focus:ring-2 focus:ring-maroon/20 outline-none transition-all hover:border-gray-300" />
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 pl-1.5 pr-3 py-1.5 rounded-full border border-gray-100">
            <div className="w-7 h-7 rounded-full bg-maroon text-white flex items-center justify-center font-bold text-xs">S</div>
            <span className="text-sm font-bold text-gray-800 hidden sm:block">System Admin</span>
          </div>
        </header>

        <div className="px-4 lg:px-0">
          {/* TITLE AREA */}
          <div className="mb-4 lg:mb-6">
            <h1 className="text-lg lg:text-3xl font-bold text-gray-900 mb-0.5">Dashboard</h1>
            <p className="text-gray-400 text-xs lg:text-sm">Manage the Adyel Alumni Platform.</p>
          </div>

          {/* KPI CARDS ROW */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-6 mb-4 lg:mb-8">
            <div className="bg-maroon text-white p-3 lg:p-6 rounded-2xl lg:rounded-3xl relative overflow-hidden">
              <p className="text-white/80 text-xs font-medium mb-1">Total Users</p>
              <h2 className="text-2xl lg:text-4xl font-extrabold">{stats?.total_users || 0}</h2>
              <p className="text-[10px] text-green-300 font-bold mt-1">Updated now</p>
            </div>
            
            <div className="bg-gray-50 p-3 lg:p-6 rounded-2xl lg:rounded-3xl border border-gray-100">
              <p className="text-gray-500 text-xs font-medium mb-1">Pending Jobs</p>
              <h2 className="text-2xl lg:text-4xl font-extrabold text-gray-900">{pendingJobs.length}</h2>
              <p className="text-[10px] text-blue-500 font-bold mt-1">Needs moderation</p>
            </div>

            <div className="bg-gray-50 p-3 lg:p-6 rounded-2xl lg:rounded-3xl border border-gray-100">
              <p className="text-gray-500 text-xs font-medium mb-1">Pending Funds</p>
              <h2 className="text-2xl lg:text-4xl font-extrabold text-gray-900">{contributions.length}</h2>
              <p className="text-[10px] text-yellow-500 font-bold mt-1">Awaiting verify</p>
            </div>

            <div className="bg-gray-50 p-3 lg:p-6 rounded-2xl lg:rounded-3xl border border-gray-100">
              <p className="text-gray-500 text-xs font-medium mb-1">Active Biz</p>
              <h2 className="text-2xl lg:text-4xl font-extrabold text-gray-900">{activeBusinesses.length}</h2>
              <p className="text-[10px] text-green-500 font-bold mt-1">In directory</p>
            </div>
          </div>

          {/* DYNAMIC CONTENT AREA */}
          <div className="bg-white lg:bg-white rounded-none lg:rounded-[2rem] p-0 lg:p-8 lg:shadow-sm lg:border lg:border-gray-100 min-h-[400px]">
          {activeTab === 'users' && <AdminUsers users={users} search={search} setSearch={setSearch} handleRoleChange={handleRoleChange} handleStatusChange={handleStatusChange} />}
          {activeTab === 'jobs' && <AdminJobs pendingJobs={pendingJobs} handleModerateJob={handleModerateJob} />}
          {activeTab === 'businesses' && <AdminBusinesses pendingBusinesses={pendingBusinesses} handleModerateBusiness={handleModerateBusiness} />}
          {activeTab === 'approvals' && <AdminApprovals contributions={contributions} handleVerifyContribution={handleVerifyContribution} />}
          {activeTab === 'obituaries' && <AdminObituaries fetchData={fetchData} />}
          {activeTab === 'condolences' && <AdminCondolences condolences={condolences} handleModerateCondolence={handleModerateCondolence} />}
          {activeTab === 'rates' && <AdminRates rates={rates} fetchData={fetchData} />}
          {activeTab === 'projects' && <AdminProjects projects={projects} fetchData={fetchData} />}
          {activeTab === 'news' && <AdminNews news={news} fetchData={fetchData} />}
          {activeTab === 'events' && <AdminEvents fetchData={fetchData} />}
          {activeTab === 'shop_products' && <AdminShop shopProducts={shopProducts} shopOrders={shopOrders} fetchData={fetchData} handleUpdateOrder={handleUpdateOrder} />}
          {activeTab === 'shop_orders' && <AdminShop shopProducts={shopProducts} shopOrders={shopOrders} fetchData={fetchData} handleUpdateOrder={handleUpdateOrder} />}
          {activeTab === 'settings' && <AdminSettings settingsData={settingsData} fetchData={fetchData} />}
          {activeTab === 'governance' && <AdminGovernance polls={polls} documents={documents} fetchData={fetchData} />}
          {activeTab === 'analytics' && <AdminAnalytics />}

          {activeTab === 'audit' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Immutable Audit Trail</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                      <th className="pb-4 font-semibold">Timestamp</th>
                      <th className="pb-4 font-semibold">User</th>
                      <th className="pb-4 font-semibold">Action</th>
                      <th className="pb-4 font-semibold">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {logs.map(log => (
                      <tr key={log.id}>
                        <td className="py-4 text-xs text-gray-500">{new Date(log.created_at).toLocaleString()}</td>
                        <td className="py-4 text-sm text-gray-900 font-bold">{log.first_name ? `${log.first_name} ${log.last_name}` : 'System'}</td>
                        <td className="py-4"><span className="px-3 py-1 bg-gray-100 text-gray-700 font-bold text-xs rounded-full border border-gray-200">{log.action}</span></td>
                        <td className="py-4 text-sm text-gray-600">{log.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        </div>
      </main>

      {/* MOBILE MORE DRAWER */}
      {isMoreOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="flex-1 bg-black/50" onClick={() => setIsMoreOpen(false)} />
          <div className="bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>
            <div className="px-4 pt-2 pb-4">
              <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-sm outline-none mb-4" />
            </div>
            <div className="px-4 pb-safe">
              {/* Group 1: Governance */}
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Governance</p>
              {[['governance','Governance Mgmt'],['users','Role Management'],['audit','Audit Trail'],['settings','Settings']].map(([id,label]) => (
                <button key={id} onClick={() => { setActiveTab(id); setIsMoreOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl mb-1 font-medium text-sm ${activeTab === id ? 'bg-maroon text-white' : 'text-gray-700 hover:bg-gray-50'}`}>{label}</button>
              ))}
              {/* Group 2: Welfare */}
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2 mt-4">Welfare</p>
              {[['approvals','Fund Approvals'],['obituaries','Obituaries'],['condolences','Condolences'],['rates','Tax Rates']].map(([id,label]) => (
                <button key={id} onClick={() => { setActiveTab(id); setIsMoreOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl mb-1 font-medium text-sm ${activeTab === id ? 'bg-maroon text-white' : 'text-gray-700 hover:bg-gray-50'}`}>{label}</button>
              ))}
              {/* Group 3: Network */}
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2 mt-4">Network & Content</p>
              {[['jobs','Job Moderation'],['businesses','Biz Moderation'],['news','News Articles'],['events','Events & Ticketing'],['projects','Projects'],['shop_products','Shop Inventory'],['shop_orders','Shop Orders']].map(([id,label]) => (
                <button key={id} onClick={() => { setActiveTab(id); setIsMoreOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl mb-1 font-medium text-sm ${activeTab === id ? 'bg-maroon text-white' : 'text-gray-700 hover:bg-gray-50'}`}>{label}</button>
              ))}
              <div className="mt-6 pb-6">
                <button onClick={() => window.location.href = '/'} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold text-sm">Exit to Public Site</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAV */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center justify-around px-1 py-2">
        {[['analytics','Dashboard','M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'],['users','Members','M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'],['approvals','Approvals','M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'],['news','Content','M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15']].map(([id, label, path]) => (
        <button key={id} onClick={() => setActiveTab(id)} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors relative ${activeTab === id ? 'text-maroon' : 'text-gray-400'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path}></path></svg>
          <span className="text-[10px] font-semibold">{label}</span>
        </button>
      ))}
        <button onClick={() => setIsMoreOpen(true)} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${isMoreOpen ? 'text-maroon' : 'text-gray-400'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          <span className="text-[10px] font-semibold">More</span>
        </button>
      </nav>
    </div>
  );
}
