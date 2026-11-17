import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import ChartCard from '@/components/ChartCard';
import LoadingState from '@/components/LoadingState';
import { api, endpoints } from '@/services/api';

export default function MarketingPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => { setLoading(true); try { setRows(await api.get<any[]>(endpoints.marketing)); } catch { setRows([]); } finally { setLoading(false); } };
  useEffect(()=>{load();},[]);
  return (
    <div>
      <Navbar title="Marketing" subtitle="Promotions and campaign performance" />
      <div className="p-6">
        <ChartCard title="Marketing Campaigns" subtitle={`${rows.length} campaigns`}>
          {loading ? <LoadingState label="Loading marketing campaigns..." /> : (
          <div className="overflow-auto"><table className="min-w-full text-sm"><thead className="text-left text-stone-500"><tr><th className="py-2">Campaign</th><th>Type</th><th>Discount</th><th>Date</th><th>Sales Generated</th></tr></thead>
          <tbody>{rows.map(r=> (<tr key={r.marketing_id} className="border-t border-stone-100"><td className="py-2 font-medium text-stone-800">{r.campaign_name}</td><td>{r.promotion_type}</td><td>{Number(r.discount_percentage)}%</td><td>{String(r.campaign_date).slice(0,10)}</td><td>₱{Number(r.sales_generated).toLocaleString()}</td></tr>))}
          {!rows.length && <tr><td colSpan={5} className="py-6 text-center text-stone-400">No marketing records found.</td></tr>}</tbody></table></div>)}
        </ChartCard>
      </div>
    </div>
  );
}
