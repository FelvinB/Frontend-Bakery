import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import StatCard from '@/components/StatCard';
import ChartCard from '@/components/ChartCard';
import LoadingState from '@/components/LoadingState';
import { api, endpoints } from '@/services/api';
import { BarList, LineTrend } from '@/components/SimpleCharts';

export default function PredictivePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get(endpoints.analytics.predictive)
      .then((res) => { if (mounted) setData(res); })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);
  const forecasts = data?.product_forecasts || [];
  const shortages = data?.potential_shortages || [];
  return (
    <div>
      <Navbar title="Predictive Analytics" subtitle="What might happen? Forecasts using 3-day moving average" />
      <div className="space-y-6 p-6">
        {loading ? <LoadingState label="Loading predictive forecasts..." /> : <>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Predicted Weekly Revenue" value={`₱${Number(data?.predicted_weekly_revenue||0).toLocaleString()}`} tone="emerald" subtitle="Next 7 days estimate" />
          <StatCard title="Products Forecasted" value={forecasts.length} tone="sky" />
          <StatCard title="Potential Shortages" value={shortages.length} tone="rose" subtitle="Demand may exceed stock" />
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard title="Future Revenue Forecast" subtitle="Predicted daily sales for upcoming week"><LineTrend data={data?.future_sales||[]} labelKey="sale_date" valueKey="predicted" color="#10b981" /></ChartCard>
          <ChartCard title="Product Demand Forecast" subtitle="Predicted daily demand (top items)"><BarList data={forecasts.slice(0,10).map((x:any)=>({name:x.product_name,total:x.predicted_daily_demand}))} labelKey="name" valueKey="total" color="bg-emerald-500" /></ChartCard>
        </div>
        <ChartCard title="Demand & Stock Analysis" subtitle="Predicted daily demand vs current stock">
          <div className="overflow-auto"><table className="min-w-full text-sm"><thead className="text-left text-stone-500"><tr><th className="py-2">Product</th><th>Recent Sales (3 days)</th><th>Predicted Daily</th><th>Predicted Weekly</th><th>Current Stock</th><th>Est. Daily Revenue</th><th>Status</th></tr></thead>
          <tbody>{forecasts.slice(0,15).map((f:any)=>(
            <tr key={f.product_id} className="border-t border-stone-100"><td className="py-2 font-medium">{f.product_name}</td><td>{(f.recent_sales||[]).join(', ') || '—'}</td><td>{f.predicted_daily_demand}</td><td>{f.predicted_weekly_demand}</td><td>{f.current_stock}</td><td>₱{Number(f.estimated_daily_revenue).toLocaleString()}</td><td className={f.potential_shortage?'text-rose-600 font-semibold':'text-emerald-600'}>{f.potential_shortage?'Potential Shortage':'Sufficient'}</td></tr>
          ))}{!forecasts.length && <tr><td colSpan={7} className="py-6 text-center text-stone-400">No forecast data. Seed sales history.</td></tr>}</tbody></table></div>
        </ChartCard>
        </>}
      </div>
    </div>
  );
}
