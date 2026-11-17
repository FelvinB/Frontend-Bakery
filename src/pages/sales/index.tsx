import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import ChartCard from '@/components/ChartCard';
import LoadingState from '@/components/LoadingState';
import { api, endpoints } from '@/services/api';

export default function SalesPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState({ customer_id: '', product_id: '', quantity: '1', unit_price: '', sale_date: new Date().toISOString().slice(0,10) });
  const load = async () => {
    setLoading(true);
    try {
      const [s,c,p] = await Promise.all([api.get<any[]>(endpoints.sales), api.get<any[]>(endpoints.customers), api.get<any[]>(endpoints.products)]);
      setRows(s); setCustomers(c); setProducts(p);
    } catch { setRows([]); }
    finally { setLoading(false); }
  };
  useEffect(()=>{load();},[]);
  useEffect(()=>{ const p = products.find(x=>String(x.product_id)===form.product_id); if(p) setForm(f=>({...f, unit_price: String(p.price)})); },[form.product_id, products]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(form.quantity||0), price = Number(form.unit_price||0);
    await api.post(endpoints.sales, { ...form, customer_id:Number(form.customer_id), product_id:Number(form.product_id), quantity: qty, unit_price: price, total_amount: qty*price });
    setForm({ ...form, product_id:'', quantity:'1' }); load();
  };
  return (
    <div>
      <Navbar title="Sales" subtitle="Record and monitor sales transactions" />
      <div className="grid gap-6 p-6 xl:grid-cols-[360px_1fr]">
        <ChartCard title="Record Sale" subtitle="New transaction">
          <form onSubmit={submit} className="space-y-3">
            <select value={form.customer_id} onChange={e=>setForm({...form,customer_id:e.target.value})} className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"><option value="">Select customer</option>{customers.map(c=> <option key={c.customer_id} value={c.customer_id}>{c.customer_name}</option>)}</select>
            <select value={form.product_id} onChange={e=>setForm({...form,product_id:e.target.value})} className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm"><option value="">Select product</option>{products.map(p=> <option key={p.product_id} value={p.product_id}>{p.product_name}</option>)}</select>
            <div className="grid grid-cols-2 gap-2"><input value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} placeholder="Qty" className="rounded-xl border border-stone-200 px-3 py-2 text-sm" /><input value={form.unit_price} onChange={e=>setForm({...form,unit_price:e.target.value})} placeholder="Unit price" className="rounded-xl border border-stone-200 px-3 py-2 text-sm" /></div>
            <input type="date" value={form.sale_date} onChange={e=>setForm({...form,sale_date:e.target.value})} className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm" />
            <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Total: ₱{(Number(form.quantity||0)*Number(form.unit_price||0)).toFixed(2)}</div>
            <button className="w-full rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600">Save Sale</button>
          </form>
        </ChartCard>
        <ChartCard title="Sales Transactions" subtitle={`${rows.length} transactions`}>
          {loading ? <LoadingState label="Loading sales transactions..." /> : (
          <div className="overflow-auto"><table className="min-w-full text-sm"><thead className="text-left text-stone-500"><tr><th className="py-2">Date</th><th>Customer</th><th>Product</th><th>Qty</th><th>Total</th></tr></thead>
          <tbody>{rows.map(r=> (<tr key={r.sale_id} className="border-t border-stone-100"><td className="py-2">{String(r.sale_date).slice(0,10)}</td><td>{r.customer?.customer_name||r.customer_id}</td><td>{r.product?.product_name||r.product_id}</td><td>{r.quantity}</td><td className="font-medium">₱{Number(r.total_amount).toFixed(2)}</td></tr>))}
          {!rows.length && <tr><td colSpan={5} className="py-6 text-center text-stone-400">No sales records found.</td></tr>}</tbody></table></div>)}
        </ChartCard>
      </div>
    </div>
  );
}
