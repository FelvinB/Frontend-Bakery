import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import StatCard from '@/components/StatCard';
import ChartCard from '@/components/ChartCard';
import LoadingState from '@/components/LoadingState';
import { api, endpoints } from '@/services/api';
import { BarList, MiniBars, LineTrend } from '@/components/SimpleCharts';

export default function DescriptivePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get(endpoints.analytics.descriptive)
      .then((res) => { if (mounted) setData(res); })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);
  const k = data?.kpis || {};
  return (
    <div>
      <Navbar title="Descriptive Analytics" subtitle="What happened? Historical sales and inventory performance" />
      <div className="space-y-6 p-6">
        {loading ? <LoadingState label="Loading descriptive analytics..." /> : <>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard title="Total Revenue" value={`₱${Number(k.total_revenue||0).toLocaleString()}`} />
          <StatCard title="Products Sold" value={Number(k.total_products_sold||0).toLocaleString()} tone="emerald" />
          <StatCard title="Total Customers" value={Number(k.total_customers||0).toLocaleString()} tone="sky" />
          <StatCard title="Total Products" value={Number(k.total_products||0).toLocaleString()} tone="amber" />
          <StatCard title="Low Stock Items" value={Number(k.low_stock_items||0).toLocaleString()} tone="rose" />
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard title="Daily Sales Trend" subtitle="Revenue by day"><LineTrend data={[...(data?.daily_sales||[])].sort((a:any,b:any)=>String(a.sale_date).localeCompare(String(b.sale_date)))} labelKey="sale_date" valueKey="total" /></ChartCard>
          <ChartCard title="Monthly Sales" subtitle="Revenue by month"><MiniBars data={data?.monthly_sales||[]} labelKey="month" valueKey="total" /></ChartCard>
          <ChartCard title="Best-Selling Products" subtitle="Highest quantity sold"><BarList data={(data?.best_selling||[]).map((x:any)=>({name:x.product?.product_name||x.product_id,total:x.total_sold}))} labelKey="name" valueKey="total" /></ChartCard>
          <ChartCard title="Lowest-Selling Products" subtitle="Products needing attention"><BarList data={(data?.lowest_selling||[]).map((x:any)=>({name:x.product?.product_name||x.product_id,total:x.total_sold}))} labelKey="name" valueKey="total" color="bg-rose-400" /></ChartCard>
          <ChartCard title="Sales by Category" subtitle="Performance per product category"><BarList data={(data?.category_sales||[]).map((x:any)=>({name:x.category,total:x.total}))} labelKey="name" valueKey="total" color="bg-emerald-500" /></ChartCard>
          <ChartCard title="Inventory Monitoring" subtitle="Stock levels by product"><BarList data={(data?.inventory_status||[]).slice(0,10).map((x:any)=>({name:x.product?.product_name||x.product_id,total:x.stock_quantity}))} labelKey="name" valueKey="total" color="bg-sky-500" /></ChartCard>
        </div>
        </>}
      </div>
    </div>
  );
}
