import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import ChartCard from '@/components/ChartCard';
import LoadingState from '@/components/LoadingState';
import { api, endpoints } from '@/services/api';
import { cn } from '@/lib/cn';

export default function InventoryPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => { setLoading(true); try { setRows(await api.get<any[]>(endpoints.inventory)); } catch { setRows([]); } finally { setLoading(false); } };
  useEffect(()=>{load();},[]);
  return (
    <div>
      <Navbar title="Inventory" subtitle="Monitor stock levels and restocking needs" />
      <div className="p-6">
        <ChartCard title="Inventory Status" subtitle="Current stock versus reorder levels">
          {loading ? <LoadingState label="Loading inventory..." /> : (
          <div className="overflow-auto"><table className="min-w-full text-sm"><thead className="text-left text-stone-500"><tr><th className="py-2">Product</th><th>Category</th><th>Stock</th><th>Reorder Level</th><th>Restock Qty</th><th>Status</th><th>Last Updated</th></tr></thead>
          <tbody>{rows.map(r=> { const low = Number(r.stock_quantity) <= Number(r.reorder_level); return (
            <tr key={r.inventory_id} className="border-t border-stone-100">
              <td className="py-2 font-medium text-stone-800">{r.product?.product_name||r.product_id}</td><td>{r.product?.category}</td><td>{r.stock_quantity}</td><td>{r.reorder_level}</td><td>{r.restock_quantity}</td>
              <td><span className={cn('rounded-full px-2 py-1 text-xs font-semibold', low ? 'bg-rose-100 text-rose-700':'bg-emerald-100 text-emerald-700')}>{low ? 'Low Stock / Restock' : 'Healthy'}</span></td>
              <td>{r.last_updated ? String(r.last_updated).slice(0,10) : '-'}</td>
            </tr> );})}
          {!rows.length && <tr><td colSpan={7} className="py-6 text-center text-stone-400">No inventory records found.</td></tr>}</tbody></table></div>)}
        </ChartCard>
      </div>
    </div>
  );
}
