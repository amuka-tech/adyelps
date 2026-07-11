import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/Card';
import { showToast } from '@/lib/toast';

export default function AdminAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/admin/analytics');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="p-20 text-center text-gray-500 font-medium">Loading platform analytics...</div>;
  }

  if (!data) {
    return <div className="p-20 text-center text-red-500 font-medium">Failed to load analytics data.</div>;
  }

  const { userMetrics, engagementMetrics, financialMetrics, recentActivity } = data;

  // Calculate percentages for the revenue breakdown bar
  const totalRev = financialMetrics.totalRevenue || 1; // Prevent division by zero
  const shopPct = (financialMetrics.breakdown.shop / totalRev) * 100;
  const eventsPct = (financialMetrics.breakdown.events / totalRev) * 100;
  const welfarePct = (financialMetrics.breakdown.welfare / totalRev) * 100;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-gray-100 shadow-sm bg-gradient-to-br from-white to-blue-50/50">
          <CardContent className="p-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total Users</h3>
            <div className="flex items-end justify-between">
              <span className="text-4xl font-extrabold text-gray-900">{userMetrics.totalUsers}</span>
              <div className="flex items-center text-green-500 text-sm font-bold mb-1">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
                Active
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2 font-medium">{userMetrics.pendingUsers} awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm bg-gradient-to-br from-white to-green-50/50">
          <CardContent className="p-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total Revenue</h3>
            <div className="flex items-end justify-between">
              <span className="text-4xl font-extrabold text-green-600">
                <span className="text-xl mr-1">UGX</span>
                {financialMetrics.totalRevenue.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2 font-medium">From events, shop, and welfare</p>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm bg-gradient-to-br from-white to-purple-50/50">
          <CardContent className="p-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Platform Engagement</h3>
            <div className="flex items-end justify-between">
              <span className="text-4xl font-extrabold text-purple-600">{engagementMetrics.totalMessages}</span>
              <div className="flex items-center text-gray-500 text-sm font-bold mb-1">
                Messages Sent
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2 font-medium">{engagementMetrics.totalEvents} Events • {engagementMetrics.totalBusinesses} Businesses</p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Breakdown */}
      <Card className="border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">Revenue Breakdown</h2>
        </div>
        <CardContent className="p-8">
          {financialMetrics.totalRevenue === 0 ? (
             <div className="text-center py-8 text-gray-500">No revenue data available yet.</div>
          ) : (
            <>
              {/* Progress Bar */}
              <div className="h-6 w-full flex rounded-full overflow-hidden mb-8 shadow-inner">
                <div style={{ width: `${shopPct}%` }} className="bg-[#FFCC00] hover:opacity-90 transition-opacity cursor-pointer"></div>
                <div style={{ width: `${eventsPct}%` }} className="bg-maroon hover:opacity-90 transition-opacity cursor-pointer"></div>
                <div style={{ width: `${welfarePct}%` }} className="bg-blue-500 hover:opacity-90 transition-opacity cursor-pointer"></div>
              </div>
              
              {/* Legend */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start">
                  <div className="w-4 h-4 rounded-full bg-[#FFCC00] mt-1 mr-3 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-1">Adyel Shop</p>
                    <p className="text-2xl font-extrabold text-gray-900">UGX {financialMetrics.breakdown.shop.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">{shopPct.toFixed(1)}% of total</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-4 h-4 rounded-full bg-maroon mt-1 mr-3 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-1">Event Ticketing</p>
                    <p className="text-2xl font-extrabold text-gray-900">UGX {financialMetrics.breakdown.events.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">{eventsPct.toFixed(1)}% of total</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-4 h-4 rounded-full bg-blue-500 mt-1 mr-3 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-1">Welfare Fund</p>
                    <p className="text-2xl font-extrabold text-gray-900">UGX {financialMetrics.breakdown.welfare.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">{welfarePct.toFixed(1)}% of total</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
          <button onClick={() => showToast()} className="text-maroon text-sm font-bold hover:underline">View All</button>
        </div>
        <div className="p-0 overflow-x-auto">
          {recentActivity.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No recent transactions.</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentActivity.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-500">#{tx.id}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      {tx.type === 'SHOP_ORDER' ? 'Shop Purchase' : 
                       tx.type === 'EVENT_TICKET' ? 'Event Ticket' : 'Welfare Contrib.'}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">UGX {parseFloat(tx.amount).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        tx.status === 'SUCCESS' ? 'bg-green-50 text-green-700 border border-green-100' : 
                        tx.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' : 
                        'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(tx.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

    </div>
  );
}
