import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Compass, User, Users } from 'lucide-react';

const navItems = [
  { name: 'Home', label: 'หน้าแรก', icon: Home },
  { name: 'Discover', label: 'ค้นหา', icon: Compass },
  { name: 'Community', label: 'วงข้าว', icon: Users },
  { name: 'Profile', label: 'โปรไฟล์', icon: User }
];

export default function Layout({ children, currentPageName }) {
  const hideNav = ['Onboarding', 'Recommendation', 'Login', 'Register'].includes(currentPageName);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/20 via-orange-50/10 to-white">
      <main className={!hideNav ? 'pb-20' : ''}>
        {children}
      </main>

      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-100 z-50 safe-area-bottom">
          <div className="max-w-sm mx-auto flex justify-around py-1.5">
            {navItems.map((item) => {
              const isActive = currentPageName === item.name;
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.name)}
                  className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'text-teal-700'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <item.icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}