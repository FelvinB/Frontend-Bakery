import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import StatCard from '@/components/StatCard';
import ChartCard from '@/components/ChartCard';
import LoadingState from '@/components/LoadingState';
import { api, endpoints } from '@/services/api';
import { BarList, MiniBars, LineTrend } from '@/components/SimpleCharts';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get(endpoints.analytics.dashboard)
      .then((res) => { if (mounted) setData(res); })
      .catch((e) => { if (mounted) setError(e.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const kpis = data?.kpis || {};
  return (
    <div>
      <Navbar title="Dashboard" subtitle="Overview of bakery performance, demand, and recommendations" />
      <div className="space-y-6 p-6">
        {loading && <LoadingState label="Loading dashboard analytics..." />}
        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">Unable to load dashboard data: {error}. Showing layout; start Laravel API and seed database to see live analytics.</div>}
        {!loading && <><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard title="Total Revenue" value={`₱${Number(kpis.total_revenue || 0).toLocaleString()}`} tone="amber" />
          <StatCard title="Products Sold" value={Number(kpis.total_products_sold || 0).toLocaleString()} tone="emerald" />
          <StatCard title="Customers" value={Number(kpis.total_customers || 0).toLocaleString()} tone="sky" />
          <StatCard title="Products" value={Number(kpis.total_products || 0).toLocaleString()} tone="amber" />
          <StatCard title="Low Stock Items" value={Number(kpis.low_stock_items || 0).toLocaleString()} tone="rose" subtitle="Need attention" />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard title="Daily Sales" subtitle="Recent daily revenue trend">
            <MiniBars
              data={[...(data?.daily_sales || [])]
                .sort((a: any, b: any) => String(a.sale_date).localeCompare(String(b.sale_date)))
                .slice(-12)}
              labelKey="sale_date"
              valueKey="total"
            />
          </ChartCard>
          <ChartCard title="Best-Selling Products" subtitle="Top products by quantity sold">
            <BarList data={(data?.best_selling || []).map((x: any) => ({ name: x.product?.product_name || `#${x.product_id}`, total: x.total_sold }))} labelKey="name" valueKey="total" />
          </ChartCard>
          <ChartCard title="Sales by Category" subtitle="Category contribution">
            <BarList data={(data?.category_sales || []).map((x: any) => ({ name: x.category, total: x.total }))} labelKey="name" valueKey="total" color="bg-emerald-500" />
          </ChartCard>
          <ChartCard title="Future Sales Forecast" subtitle="Predicted revenue for upcoming days">
            <LineTrend data={data?.future_sales || []} labelKey="sale_date" valueKey="predicted" />
          </ChartCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard title="Stock Shortage Warnings" subtitle="Products at risk based on predicted demand">
            <div className="space-y-2">
              {(data?.shortage_warnings || []).slice(0, 6).map((w: any, i: number) => (
                <div key={i} className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">{w.message}</div>
              ))}
              {!data?.shortage_warnings?.length && <p className="text-sm text-stone-400">No shortage warnings right now.</p>}
            </div>
          </ChartCard>
          <ChartCard title="Production Recommendations" subtitle="Suggested additional production">
            <div className="space-y-2">
              {(data?.production_recommendations || []).slice(0, 6).map((r: any, i: number) => (
                <div key={i} className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-stone-700">
                  <span className="font-semibold text-stone-900">{r.product_name}</span>: prepare <span className="font-semibold text-amber-700">{r.recommended_additional_production}</span> more. <span className="text-stone-500">{r.reason}</span>
                </div>
              ))}
              {!data?.production_recommendations?.length && <p className="text-sm text-stone-400">No production actions recommended.</p>}
            </div>
          </ChartCard>
        </div></>}
      </div>
    </div>
  );
}
