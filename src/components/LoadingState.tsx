import { cn } from '@/lib/cn';

export default function LoadingState({ label = 'Loading data...', className }: { label?: string; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-2xl border border-amber-100 bg-white/70 p-8 text-stone-600', className)}>
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-500" />
      <p className="mt-3 text-sm font-medium">{label}</p>
      <p className="mt-1 text-xs text-stone-400">Fetching latest records from the server</p>
    </div>
  );
}
