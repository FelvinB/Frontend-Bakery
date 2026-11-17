import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import ChartCard from '@/components/ChartCard';
import LoadingState from '@/components/LoadingState';
import { api, endpoints } from '@/services/api';

export default function PrescriptivePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get(endpoints.analytics.prescriptive)
      .then((res) => { if (mounted) setData(res); })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);
  const prod = data?.production_recommendations || [];
  const restock = data?.restocking_recommendations || [];
  const promos = data?.promotional_suggestions || [];
  const alerts = data?.low_selling_alerts || [];
  const warnings = data?.shortage_warnings || [];
  return (
    <div>
      <Navbar title="Prescriptive Analytics" subtitle="What should we do? Data-driven recommendations" />
      <div className="space-y-6 p-6">
        {loading ? <LoadingState label="Loading recommendations..." /> : <>
        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard title="Production Recommendations" subtitle="How much to bake based on forecast vs stock">
            <div className="space-y-3">{prod.slice(0,8).map((r:any,i:number)=>(<div key={i} className="rounded-xl border border-amber-100 bg-amber-50 p-4"><p className="font-semibold text-stone-800">{r.product_name}</p><p className="text-sm text-stone-700">Prepare <span className="font-bold text-amber-700">{r.recommended_additional_production}</span> additional pieces (stock {r.current_stock}, predicted daily {r.predicted_daily_demand}).</p><p className="mt-1 text-xs text-stone-500">{r.reason}</p></div>))}{!prod.length && <p className="text-sm text-stone-400">No recommendations available.</p>}</div>
          </ChartCard>
          <ChartCard title="Inventory Restocking" subtitle="Suggested restock quantities">
            <div className="space-y-3">{restock.slice(0,8).map((r:any,i:number)=>(<div key={i} className="rounded-xl border border-sky-100 bg-sky-50 p-4"><p className="font-semibold text-stone-800">{r.product_name}</p><p className="text-sm text-stone-700">Restock <span className="font-bold text-sky-700">{r.recommended_restock_quantity}</span> units. Current stock: {r.current_stock}.</p><p className="mt-1 text-xs text-stone-500">{r.reason}</p></div>))}{!restock.length && <p className="text-sm text-stone-400">No restocking needed.</p>}</div>
          </ChartCard>
          <ChartCard title="Low-Selling Product Alerts" subtitle="Products that may need promotion">
            <div className="space-y-3">{alerts.map((a:any,i:number)=>(<div key={i} className="rounded-xl border border-rose-100 bg-rose-50 p-4"><p className="font-semibold text-stone-800">{a.product_name}</p><p className="text-sm text-stone-700">Total sold: {a.total_sold}. {a.suggestion}</p></div>))}{!alerts.length && <p className="text-sm text-stone-400">No low-selling alerts.</p>}</div>
          </ChartCard>
          <ChartCard title="Promotional Suggestions" subtitle="Actions to improve sales and reduce waste">
            <div className="space-y-3">{promos.map((p:any,i:number)=>(<div key={i} className="rounded-xl border border-emerald-100 bg-emerald-50 p-4"><p className="font-semibold text-stone-800">{p.type} — {p.target}</p><p className="text-sm text-stone-700">{p.suggestion}</p></div>))}{!promos.length && <p className="text-sm text-stone-400">No suggestions yet.</p>}</div>
          </ChartCard>
        </div>
        <ChartCard title="Stock Shortage Warnings" subtitle="Immediate attention items">
          <div className="grid gap-2 md:grid-cols-2">{warnings.map((w:any,i:number)=>(<div key={i} className="rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm font-medium text-rose-700">⚠ {w.message}</div>))}{!warnings.length && <p className="text-sm text-stone-400">No shortage warnings.</p>}</div>
        </ChartCard>
        <ChartCard title="Strategic Insights" subtitle="Overall guidance">
          <ul className="list-disc space-y-2 pl-5 text-sm text-stone-700">
            <li>{data?.insights?.best_seller_focus || 'Increase production of best-selling products to maximize revenue.'}</li>
            <li>{data?.insights?.waste_reduction || 'Align baking quantities with predicted daily demand to reduce leftovers.'}</li>
          </ul>
        </ChartCard>
        </>}
      </div>
    </div>
  );
}
