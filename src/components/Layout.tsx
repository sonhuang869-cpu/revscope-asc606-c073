import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, FileText, TrendingUp, ShieldCheck, Bell, Settings, ChevronRight } from 'lucide-react'
import { Toaster } from 'sonner'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/contracts', label: 'Contracts', icon: FileText },
  { to: '/recognition', label: 'Recognition', icon: TrendingUp },
  { to: '/compliance', label: 'Compliance', icon: ShieldCheck },
]

export function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0F1E]">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col bg-[#0D1526] border-r border-white/8">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#4F8EF7] flex items-center justify-center flex-shrink-0">
              <TrendingUp size={16} className="text-white" />
            </div>
            <div>
              <span className="text-white font-semibold text-sm tracking-tight">RevScope</span>
              <div className="text-[10px] text-gray-500 leading-tight">ASC 606 Platform</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <div className="text-[10px] text-gray-600 uppercase tracking-widest px-2 mb-3 font-medium">Main</div>
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${
                  isActive
                    ? 'bg-[#1E3A5F] text-[#4F8EF7] font-medium'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? 'text-[#4F8EF7]' : 'text-gray-500 group-hover:text-gray-300'} />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={12} className="text-[#4F8EF7] opacity-60" />}
                </>
              )}
            </NavLink>
          ))}

          <div className="text-[10px] text-gray-600 uppercase tracking-widest px-2 mt-6 mb-3 font-medium">System</div>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-all">
            <Bell size={16} className="text-gray-500" />
            <span>Notifications</span>
            <span className="ml-auto bg-[#4F8EF7] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">3</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-all">
            <Settings size={16} className="text-gray-500" />
            <span>Settings</span>
          </button>
        </nav>

        {/* User profile */}
        <div className="px-3 py-3 border-t border-white/8">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-all">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4F8EF7] to-[#1E3A5F] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              HR
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-200 font-medium truncate">Harry Randhawa</div>
              <div className="text-[10px] text-gray-500 truncate">Sr. Finance Executive</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          style: { background: '#111827', border: '1px solid rgba(255,255,255,0.1)', color: '#e5e7eb' },
        }}
      />
    </div>
  )
}
