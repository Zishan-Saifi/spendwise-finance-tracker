import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Target, 
  Tags, 
  User, 
  LogOut, 
  Wallet, 
  Menu, 
  X,
  Sun,
  Moon
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Budgets', path: '/budgets', icon: Target },
    { name: 'Categories', path: '/categories', icon: Tags },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  // Reusable Rotating Theme Toggle Button
  const ThemeToggleButton = () => (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle dark mode"
      className="p-2 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-800/80 hover:bg-slate-100 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center shrink-0 cursor-pointer shadow-xs"
    >
      <div className="relative w-4.5 h-4.5 flex items-center justify-center">
        <Sun
          size={18}
          className={`text-amber-500 absolute transition-all duration-500 transform ${
            isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`}
        />
        <Moon
          size={18}
          className={`text-indigo-400 absolute transition-all duration-500 transform ${
            isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
          }`}
        />
      </div>
    </button>
  );

  const NavLinks = () => (
    <nav className="space-y-1.5">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-800/60 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            <span>{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 flex flex-col md:flex-row transition-colors duration-200">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-neutral-900 border-b border-slate-100 dark:border-neutral-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-xs">
            <Wallet size={18} />
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-white">SpendWise</span>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity"
        />
      )}

      {/* Mobile Slide-over Drawer */}
      <aside
        className={`md:hidden fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-neutral-900 z-50 flex flex-col justify-between p-5 border-r border-slate-100 dark:border-neutral-800 transform transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-neutral-800 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white">
                <Wallet size={18} />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">SpendWise</span>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800"
            >
              <X size={20} />
            </button>
          </div>
          <NavLinks />
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-neutral-800 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-semibold shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-neutral-400 truncate">
                {user?.name || 'Account'}
              </span>
            </div>
            <ThemeToggleButton />
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors w-full"
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Desktop Sidebar (hidden on mobile, visible on md+) */}
      <aside className="hidden md:flex w-64 bg-white dark:bg-neutral-900 border-r border-slate-100 dark:border-neutral-800 flex-col justify-between p-6 shrink-0 sticky top-0 h-screen transition-colors duration-200">
        <div>
          <div className="flex items-center gap-2.5 pb-6 mb-6 border-b border-slate-100 dark:border-neutral-800">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-xs">
              <Wallet size={20} />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">SpendWise</span>
          </div>
          <NavLinks />
        </div>

        {/* Desktop Footer: User info + Rotating Theme Toggle + Logout */}
        <div className="pt-4 border-t border-slate-100 dark:border-neutral-800 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-bold shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-neutral-300 truncate max-w-[120px]">
                {user?.name || 'Account'}
              </span>
            </div>
            <ThemeToggleButton />
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors w-full cursor-pointer"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Sidebar;