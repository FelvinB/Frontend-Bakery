import { cn } from '@/lib/cn';

type Props = {
  title: string;
  value: string | number;
  subtitle?: string;
  tone?: 'amber' | 'rose' | 'emerald' | 'sky';
  className?: string;
};

const tones = {
  amber: 'from-amber-100 to-orange-50 text-amber-900 border-amber-200',
  rose: 'from-rose-100 to-pink-50 text-rose-900 border-rose-200',
  emerald: 'from-emerald-100 to-teal-50 text-emerald-900 border-emerald-200',
  sky: 'from-sky-100 to-cyan-50 text-sky-900 border-sky-200',
};

export default function StatCard({ title, value, subtitle, tone = 'amber', className }: Props) {
  return (
    <div className={cn('rounded-2xl border bg-gradient-to-br p-5 shadow-sm', tones[tone], className)}>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
      {subtitle ? <p className="mt-1 text-xs opacity-70">{subtitle}</p> : null}
    </div>
  );
}
