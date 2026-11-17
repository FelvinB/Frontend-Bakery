import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export default function ChartCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-2xl border border-amber-100 bg-white/80 p-5 shadow-sm backdrop-blur', className)}>
      <div className="mb-4">
        <h3 className="text-base font-semibold text-stone-800">{title}</h3>
        {subtitle ? <p className="text-sm text-stone-500">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}
