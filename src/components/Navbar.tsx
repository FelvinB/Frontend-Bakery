export default function Navbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="flex items-center justify-between border-b border-amber-100 bg-white/70 px-6 py-4 backdrop-blur">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">{title}</h2>
        {subtitle ? <p className="text-sm text-stone-500">{subtitle}</p> : null}
      </div>
      <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">Tita's Bakery System</div>
    </header>
  );
}
