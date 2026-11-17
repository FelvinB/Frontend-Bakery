import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import ChartCard from '@/components/ChartCard';
import LoadingState from '@/components/LoadingState';
import { api, endpoints } from '@/services/api';

export default function CustomersPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ customer_name: '', customer_type: 'Walk-in', contact_number: '', address: '' });
  const load = async () => {
    setLoading(true);
    try { setRows(await api.get<any[]>(endpoints.customers)); } catch { setRows([]); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name) return;
    await api.post(endpoints.customers, form);
    setForm({ customer_name: '', customer_type: 'Walk-in', contact_number: '', address: '' });
    load();
  };
  const remove = async (id: number) => { await api.del(`${endpoints.customers}/${id}`); load(); };
  return (
    <div>
      <Navbar title="Customers" subtitle="Manage customer records and types" />
      <div className="grid gap-6 p-6 xl:grid-cols-[360px_1fr]">
        <ChartCard title="Add Customer" subtitle="Store customer information">
          <form onSubmit={submit} className="space-y-3">
            {['customer_name','contact_number','address'].map((k) => (
              <input key={k} value={(form as any)[k]} onChange={(e)=>setForm({...form,[k]:e.target.value})} placeholder={k.replace('_',' ')} className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none" />
            ))}
            <select value={form.customer_type} onChange={(e)=>setForm({...form,customer_type:e.target.value})} className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm">
              {['Walk-in','Regular','Bulk Order','Online'].map(t=> <option key={t}>{t}</option>)}
            </select>
            <button className="w-full rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600">Save Customer</button>
          </form>
        </ChartCard>
        <ChartCard title="Customer List" subtitle={`${rows.length} records`}>
          {loading ? <LoadingState label="Loading customers..." /> : (
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-stone-500"><tr><th className="py-2">ID</th><th>Name</th><th>Type</th><th>Contact</th><th>Address</th><th></th></tr></thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.customer_id} className="border-t border-stone-100">
                    <td className="py-2">{r.customer_id}</td><td className="font-medium text-stone-800">{r.customer_name}</td><td>{r.customer_type}</td><td>{r.contact_number}</td><td>{r.address}</td>
                    <td><button onClick={()=>remove(r.customer_id)} className="text-rose-600 hover:underline">Delete</button></td>
                  </tr>
                ))}
                {!rows.length && <tr><td colSpan={6} className="py-6 text-center text-stone-400">No records found. Start API and seed data.</td></tr>}
              </tbody>
            </table>
          </div>)}
        </ChartCard>
      </div>
    </div>
  );
}
