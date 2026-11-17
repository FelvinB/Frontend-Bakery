import { cn } from '@/lib/cn';

export function BarList({ data, labelKey, valueKey, color = 'bg-amber-500' }: { data: any[]; labelKey: string; valueKey: string; color?: string }) {
  const max = Math.max(1, ...data.map((d) => Number(d[valueKey] || 0)));
  return (
    <div className="space-y-3">
      {data.map((item, i) => {
        const val = Number(item[valueKey] || 0);
        return (
          <div key={i}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-stone-700 truncate pr-3">{String(item[labelKey])}</span>
              <span className="text-stone-500">{val.toLocaleString()}</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-stone-100">
              <div className={cn('h-2.5 rounded-full', color)} style={{ width: `${(val / max) * 100}%` }} />
            </div>
          </div>
        );
      })}
      {!data.length && <p className="text-sm text-stone-400">No data available.</p>}
    </div>
  );
}

export function MiniBars({ data, labelKey, valueKey }: { data: any[]; labelKey: string; valueKey: string }) {
  const max = Math.max(1, ...data.map((d) => Number(d[valueKey] || 0)));
  const formatLabel = (raw: any) => {
    const s = String(raw ?? '');
    const date = s.includes('T') ? s.split('T')[0] : s.slice(0, 10);
    const parts = date.split('-');
    if (parts.length === 3) return `${parts[1]}/${parts[2]}`;
    return s.slice(5, 10) || s;
  };

  return (
    <div className="w-full">
      {data.length ? (
        <div className="flex h-56 items-end gap-2 overflow-x-auto pb-1">
          {data.map((item, i) => {
            const val = Number(item[valueKey] || 0);
            const height = max > 0 ? (val / max) * 100 : 0;
            return (
              <div key={i} className="flex min-w-[42px] flex-1 flex-col items-center justify-end gap-1">
                <span className="text-[10px] font-medium text-stone-500">₱{val.toLocaleString()}</span>
                <div className="flex h-36 w-full items-end rounded-md bg-stone-100 p-1">
                  <div
                    className="w-full rounded-md bg-gradient-to-t from-amber-500 to-orange-300 transition-all"
                    style={{ height: `${val > 0 ? Math.max(8, height) : 2}%` }}
                    title={`${String(item[labelKey]).slice(0, 10)}: ₱${val.toLocaleString()}`}
                  />
                </div>
                <span className="w-full text-center text-[10px] text-stone-500">{formatLabel(item[labelKey])}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-stone-400">No data available.</p>
      )}
    </div>
  );
}

export function LineTrend({ data, labelKey, valueKey, color = '#f59e0b' }: { data: any[]; labelKey: string; valueKey: string; color?: string }) {
  const rows = [...(data || [])].sort((a, b) => String(a[labelKey] ?? '').localeCompare(String(b[labelKey] ?? '')));
  const vals = rows.map((d) => Number(d[valueKey] || 0));
  const max = Math.max(1, ...vals);
  const min = Math.min(0, ...vals);
  const w = 600; const h = 180; const pad = 24;
  const formatLabel = (raw: any) => {
    const s = String(raw ?? '');
    const date = s.includes('T') ? s.split('T')[0] : s.slice(0, 10);
    const parts = date.split('-');
    if (parts.length === 3) return `${parts[1]}/${parts[2]}`;
    return s.slice(5, 10) || s;
  };
  const point = (i: number, value: number) => {
    const x = rows.length === 1 ? w / 2 : pad + (i * (w - pad * 2)) / (rows.length - 1);
    const y = h - pad - ((value - min) / Math.max(1, max - min)) * (h - pad * 2);
    return { x, y };
  };
  const pts = rows.map((d, i) => {
    const p = point(i, Number(d[valueKey] || 0));
    return `${p.x},${p.y}`;
  }).join(' ');

  return (
    <div>
      {rows.length ? (
        <>
          <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
            <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="#e7e5e4" strokeWidth="1" />
            <polyline fill="none" stroke={color} strokeWidth="3" points={pts} strokeLinejoin="round" strokeLinecap="round" />
            {rows.map((d, i) => {
              const val = Number(d[valueKey] || 0);
              const p = point(i, val);
              return <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color}><title>{`${String(d[labelKey]).slice(0, 10)}: ₱${val.toLocaleString()}`}</title></circle>;
            })}
          </svg>
          <div className="mt-1 flex justify-between text-[10px] text-stone-400">
            {rows.map((d, i) => (i === 0 || i === rows.length - 1 || i % Math.ceil(rows.length / 6 || 1) === 0)
              ? <span key={i}>{formatLabel(d[labelKey])}</span>
              : null)}
          </div>
        </>
      ) : (
        <p className="text-sm text-stone-400">No data available.</p>
      )}
    </div>
  );
}
