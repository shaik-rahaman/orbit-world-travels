'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MODULES } from '@/constants';
import {
  FileText as FileTextIcon,
  Stamp as PassportIcon,
  Plane as PlaneIcon,
  Building as BuildingIcon,
  Shield as ShieldIcon,
  Users as UsersIcon,
  BarChart3 as BarChartIcon,
  Menu as MenuIcon,
  X as XIcon,
  LogOut as LogOutIcon,
  Settings as SettingsIcon,
  Bell as BellIcon,
  Search as SearchIcon,
} from 'lucide-react';
import { useUIStore, useAuthStore } from '@/store';
import { useRouter, usePathname } from 'next/navigation';
import { Toast } from '@/components/shared/Toast';

const IconComponent = ({ name }: { name: string }) => {
  const iconProps = { size: 20, strokeWidth: 2 };
  switch (name) {
    case 'FileText':
      return <FileTextIcon {...iconProps} />;
    case 'Passport':
      return <PassportIcon {...iconProps} />;
    case 'Plane':
      return <PlaneIcon {...iconProps} />;
    case 'Building':
      return <BuildingIcon {...iconProps} />;
    case 'Shield':
      return <ShieldIcon {...iconProps} />;
    case 'Users':
      return <UsersIcon {...iconProps} />;
    case 'BarChart3':
      return <BarChartIcon {...iconProps} />;
    default:
      return null;
  }
};

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const pathname = usePathname();

  return (
    <aside
      className={`fixed left-0 top-16 bottom-0 bg-gradient-to-b from-indigo-900 to-indigo-950 text-white p-4 transition-all duration-300 overflow-y-auto flex flex-col items-stretch ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
      style={{ zIndex: 40 }}
      aria-expanded={sidebarOpen}
    >
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 flex-shrink-0 ${sidebarOpen ? 'block' : 'hidden'}`}>
            <Image
              src="/logo.svg"
              alt="Orbit World Travels Logo"
              width={32}
              height={32}
              className="w-full h-full"
              priority
            />
          </div>
          <h2 className={`text-lg font-bold ${sidebarOpen ? 'pl-2' : 'sr-only'}`}>Orbit World Travels</h2>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-800 rounded-md"
          title={sidebarOpen ? 'Collapse' : 'Expand'}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <XIcon size={18} /> : <MenuIcon size={18} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1">
        {MODULES.map((module) => {
          const active = pathname?.startsWith(module.path);
          return (
            <Link
              key={module.id}
              href={module.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                active 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' 
                  : 'text-indigo-100 hover:bg-indigo-800 hover:text-white'
              }`}
              title={!sidebarOpen ? module.name : undefined}
            >
              <div className="flex items-center justify-center w-6">
                <IconComponent name={module.icon} />
              </div>
              {sidebarOpen && <span className="truncate">{module.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-800">
        {sidebarOpen && (
          <div className="text-sm text-gray-400 px-3 pb-3">Workspace tools</div>
        )}
        <div className="px-2">
          <Link 
            href="/settings" 
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
              pathname === '/settings'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-indigo-100 hover:bg-indigo-800 hover:text-white'
            }`}
            title={!sidebarOpen ? 'Settings' : undefined}
          >
            <SettingsIcon size={18} />
            {sidebarOpen && <span>Settings</span>}
          </Link>
        </div>
      </div>
    </aside>
  );
}

export function Topbar() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [toasts, setToasts] = React.useState<Array<{ message: string; type: 'info' | 'success' | 'error' }>>([]);
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToasts([...toasts, { message, type }]);
  };

  const removeToast = (index: number) => {
    setToasts(toasts.filter((_, i) => i !== index));
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    console.log('[Search] Input value changed:', { query, timestamp: new Date().toISOString() });
  };

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      console.log('[Search] Submitted:', { query: searchQuery, timestamp: new Date().toISOString() });
      // Note: Currently the search functionality is integrated with the chatbot
      // When user types and presses Enter, they can use the chatbot panel for global search
      showToast('💬 Use the Chatbot panel (bottom right) for advanced search across all modules', 'info');
      setSearchQuery(''); // Clear search after submission
    }
  };

  const handleNotificationClick = () => {
    console.log('[Notifications] Bell icon clicked');
    showToast('📬 No new notifications at this time', 'info');
  };

  const handleBrandClick = () => {
    router.push('/dashboard');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 border-b border-indigo-800 px-6 py-3 flex items-center justify-between shadow-lg" style={{ zIndex: 50 }}>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-indigo-800 rounded-lg transition-colors text-white"
          >
            {sidebarOpen ? <XIcon size={22} /> : <MenuIcon size={22} />}
          </button>
          <button 
            onClick={handleBrandClick}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            title="Go to Dashboard"
          >
            <Image
              src="/logo.svg"
              alt="Orbit World Travels Logo"
              width={28}
              height={28}
              className="w-7 h-7"
              priority
            />
            <h1 className="text-lg font-semibold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent cursor-pointer">Orbit World Travels</h1>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-white border border-indigo-300 rounded-lg hover:border-indigo-600 hover:shadow-md transition-all">
            <SearchIcon size={18} className="text-indigo-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              onKeyDown={handleSearchSubmit}
              placeholder="Search via Chatbot (bottom right)..."
              className="bg-transparent outline-none text-sm w-64 text-gray-800 placeholder-gray-400"
              aria-label="Global search"
            />
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleNotificationClick}
              className="p-2 hover:bg-indigo-800 rounded-lg relative text-white transition-colors" 
              title="Notifications"
              aria-label="Notifications"
            >
              <BellIcon size={20} />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-600 rounded-full" />
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-indigo-800">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-white">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-indigo-200">{user?.role}</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-indigo-800 rounded-lg text-white transition-colors"
                title="Logout"
                aria-label="Logout"
              >
                <LogOutIcon size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Toast Container */}
      <div className="fixed bottom-0 right-0 p-6 z-50 pointer-events-none">
        {toasts.map((toast, index) => (
          <div key={index} className="pointer-events-auto mb-3">
            <Toast
              message={toast.message}
              type={toast.type}
              duration={3000}
              onClose={() => removeToast(index)}
            />
          </div>
        ))}
      </div>
    </>
  );
}
