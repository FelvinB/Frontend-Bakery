import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import ChartCard from '@/components/ChartCard';
import LoadingState from '@/components/LoadingState';
import { api, endpoints } from '@/services/api';

export default function ProductsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ product_name: '', category: 'Bread', price: '', cost: '', description: '' });
  const load = async () => { setLoading(true); try { setRows(await api.get<any[]>(endpoints.products)); } catch { setRows([]); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post(endpoints.products, { ...form, price: Number(form.price||0), cost: Number(form.cost||0) });
    setForm({ product_name: '', category: 'Bread', price: '', cost: '', description: '' });
    load();
  };
  const remove = async (id: number) => { await api.del(`${endpoints.products}/${id}`); load(); };
  return (
    <div>
      <Navbar title="Products" subtitle="Manage bakery products, pricing, and categories" />
      <div className="grid gap-6 p-6 xl:grid-cols-[360px_1fr]">
        <ChartCard title="Add Product" subtitle="Product information">
          <form onSubmit={submit} className="space-y-3">
            <input value={form.product_name} onChange={(e)=>setForm({...form,product_name:e.target.value})} placeholder="Product name" className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm" />
            <select value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})} className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm">{['Bread','Cake','Cookies','Pastry'].map(c=> <option key={c}>{c}</option>)}</select>
            <div className="grid grid-cols-2 gap-2">
              <input value={form.price} onChange={(e)=>setForm({...form,price:e.target.value})} placeholder="Price" className="rounded-xl border border-stone-200 px-3 py-2 text-sm" />
              <input value={form.cost} onChange={(e)=>setForm({...form,cost:e.target.value})} placeholder="Cost" className="rounded-xl border border-stone-200 px-3 py-2 text-sm" />
            </div>
            <input value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} placeholder="Description" className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm" />
            <button className="w-full rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600">Save Product</button>
          </form>
        </ChartCard>
        <ChartCard title="Product List" subtitle={`${rows.length} products`}>
          {loading ? <LoadingState label="Loading products..." /> : (
          <div className="overflow-auto">
            <table className="min-w-full text-sm"><thead className="text-left text-stone-500"><tr><th className="py-2">ID</th><th>Name</th><th>Category</th><th>Price</th><th>Cost</th><th>Stock</th><th></th></tr></thead>
            <tbody>{rows.map(r => (<tr key={r.product_id} className="border-t border-stone-100"><td className="py-2">{r.product_id}</td><td className="font-medium text-stone-800">{r.product_name}</td><td>{r.category}</td><td>₱{Number(r.price).toFixed(2)}</td><td>₱{Number(r.cost).toFixed(2)}</td><td>{r.inventory?.stock_quantity ?? '-'}</td><td><button onClick={()=>remove(r.product_id)} className="text-rose-600 hover:underline">Delete</button></td></tr>))}
            {!rows.length && <tr><td colSpan={7} className="py-6 text-center text-stone-400">No products found.</td></tr>}</tbody></table>
          </div>)}
        </ChartCard>
      </div>
    </div>
  );
}
