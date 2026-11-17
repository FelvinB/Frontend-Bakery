import { Outlet } from 'react-router';
import Sidebar from '@/components/Sidebar';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#fff7ed,_#fff_40%,_#fef3c7)] text-stone-900">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
