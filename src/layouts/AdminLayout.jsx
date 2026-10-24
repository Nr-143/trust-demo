import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import AdminSidebar from '../components/common/AdminSidebar';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#FAF8F2]">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-stone-200 px-4 sm:px-6 h-14 flex items-center justify-between lg:hidden shadow-xs">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-stone-600 hover:text-primary-dark cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <span className="ml-3 text-xs font-bold text-primary-dark">Admin Console</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
            Demo
          </span>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
