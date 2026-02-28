import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import Icon from '@/components/ui/Icon';
import FluidNavBar from '@/components/ui/FluidNavBar';
import { useAuth } from '@/lib/AuthContext';
import { Home, Compass, User, Users, LogOut } from 'lucide-react';
const navItems = [
  { path: 'home', icon: 'home', label: 'หน้าแรก' },
  { path: 'discover', icon: 'search', label: 'ค้นหา' },
  { path: 'create', icon: 'add', label: '', isAction: true }, // The center button
  { path: 'notifications', icon: 'notifications', label: 'การแจ้งเตือน' },
  { path: 'profile', icon: 'person', label: 'ฉัน' }
];

export default function Layout({ children, currentPageName }) {
  const hideNav = ['Onboarding', 'Recommendation', 'Login', 'Register'].includes(currentPageName);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(createPageUrl('Login'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/20 via-orange-50/10 to-white">
      <main className={!hideNav ? 'pb-20' : ''}>
        {children}
      </main>

      {!hideNav && (
        <>
          <FluidNavBar navItems={navItems} currentPageName={currentPageName} />
          {/* Temporary logout button until integrated into profile */}
          <button
            onClick={handleLogout}
            className="fixed top-4 right-4 z-50 p-2 bg-white/80 backdrop-blur-lg rounded-full text-rose-500 shadow-sm border border-slate-100"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
}