"use client";

import React, { useState } from 'react';

export default function AdminShop({ 
  shopProducts, 
  shopOrders, 
  fetchData,
  handleUpdateOrder 
}: { 
  shopProducts: any[]; 
  shopOrders: any[]; 
  fetchData: () => void;
  handleUpdateOrder: (orderId: number, status: string) => void;
}) {
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', stock_quantity: '0', image_url: '', status: 'ACTIVE' });

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/shop/products', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ ...productForm, price: parseFloat(productForm.price), stock_quantity: parseInt(productForm.stock_quantity) }) 
    });
    if (res.ok) { 
      alert('Product created!'); 
      setProductForm({ name: '', description: '', price: '', stock_quantity: '0', image_url: '', status: 'ACTIVE' }); 
      fetchData(); 
    } else {
      alert((await res.json()).error);
    }
  };

  return (
    <div>
      <div className="mb-12">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Add Official Merchandise</h3>
        <form onSubmit={handleCreateProduct} className="space-y-4 mb-10">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Product Name</label>
              <input required type="text" placeholder="e.g. LTC Polo Shirt" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-maroon/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Price (UGX)</label>
              <input required type="number" placeholder="0" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-maroon/20 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Initial Stock Quantity</label>
              <input required type="number" placeholder="50" value={productForm.stock_quantity} onChange={e => setProductForm({...productForm, stock_quantity: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-maroon/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Image URL</label>
              <input required type="text" placeholder="https://..." value={productForm.image_url} onChange={e => setProductForm({...productForm, image_url: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-maroon/20 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
            <textarea required value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-maroon/20 outline-none" rows={3}></textarea>
          </div>
          <button type="submit" className="bg-maroon text-white font-medium px-6 py-3 rounded-xl hover:bg-maroon-dark transition-colors">Add to Catalog</button>
        </form>

        <h3 className="text-xl font-bold text-gray-900 mb-4">Official Shop Inventory</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shopProducts.map(product => (
            <div key={product.id} className="border border-gray-100 rounded-2xl p-4 bg-white shadow-sm flex gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">No Img</div>}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 line-clamp-1">{product.name}</h4>
                <p className="text-maroon font-bold text-sm mb-1">UGX {Number(product.price).toLocaleString()}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${product.stock_quantity > 10 ? 'bg-green-100 text-green-700' : product.stock_quantity > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {shopProducts.length === 0 && <div className="col-span-full text-center py-10 text-gray-400">No official products added yet.</div>}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-6">Shop Order Fulfillment</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left bg-white rounded-xl shadow-sm border border-gray-100">
            <thead className="bg-gray-50">
              <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 font-semibold">Order ID</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Total Amount</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold text-right">Status & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {shopOrders.map(order => (
                <tr key={order.id}>
                  <td className="p-4 font-bold text-gray-900">#{order.id.toString().padStart(4, '0')}</td>
                  <td className="p-4">
                    <div className="text-sm font-bold text-gray-900">{order.first_name} {order.last_name}</div>
                    <div className="text-xs text-gray-500">{order.email}</div>
                  </td>
                  <td className="p-4 text-maroon font-bold">UGX {Number(order.total_amount).toLocaleString()}</td>
                  <td className="p-4 text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <select value={order.status} onChange={(e) => handleUpdateOrder(order.id, e.target.value)} className={`text-sm rounded-xl p-2 outline-none font-bold border ${order.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : order.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                      <option value="PENDING">PENDING</option>
                      <option value="PAID">PAID</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                </tr>
              ))}
              {shopOrders.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-400">No orders yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
