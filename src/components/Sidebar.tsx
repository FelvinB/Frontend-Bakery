import { NavLink } from 'react-router';
import { cn } from '@/lib/cn';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/customers', label: 'Customers' },
  { to: '/products', label: 'Products' },
  { to: '/sales', label: 'Sales' },
  { to: '/inventory', label: 'Inventory' },
  { to: '/marketing', label: 'Marketing' },
  { to: '/analytics/descriptive', label: 'Descriptive' },
  { to: '/analytics/predictive', label: 'Predictive' },
  { to: '/analytics/prescriptive', label: 'Prescriptive' },
];

export default function Sidebar() {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-amber-100 bg-[#fffaf3]">
      <div className="border-b border-amber-100 px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Tita's Bakery</p>
        <h1 className="mt-1 text-lg font-bold text-stone-800">Sales & Inventory</h1>
        <p className="text-xs text-stone-500">Management and Analytics</p>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              cn(
                'block rounded-xl px-3 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-stone-700 hover:bg-amber-100 hover:text-stone-900'
              )
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-amber-100 p-4 text-xs text-stone-500">
        Fresh insights for smarter baking decisions.
      </div>
    </aside>
  );
}
