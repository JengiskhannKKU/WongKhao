import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import Icon from '@/components/ui/Icon';
import FluidNavBar from '@/components/ui/FluidNavBar';

const navItems = [
  { path: 'home', icon: 'home', label: 'หน้าแรก' },
  { path: 'discover', icon: 'explore', label: 'ค้นหา' },
  { path: 'community', icon: 'group', label: 'ชุมชน' },
  { path: 'profile', icon: 'person', label: 'โปรไฟล์' }
];

export default function Layout({ children, currentPageName }) {
  const hideNav = ['Onboarding', 'Recommendation'].includes(currentPageName);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/20 via-orange-50/10 to-white">
      <main className={!hideNav ? 'pb-20' : ''}>
        {children}
      </main>

      {!hideNav && (
        <FluidNavBar navItems={navItems} currentPageName={currentPageName} />
      )}
    </div>
  );
}