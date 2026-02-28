import React from 'react';
import { motion } from 'framer-motion';
import Icon from '@/components/ui/Icon';

export default function SwipeActions({ onAction }) {
  const buttons = [
    {
      id: 'dislike',
      icon: 'close',
      label: 'ไม่สน',
      color: 'bg-rose-500',
      shadow: 'shadow-rose-200',
      size: 'w-14 h-14'
    },
    {
      id: 'save',
      icon: 'bookmark',
      label: 'บันทึก',
      color: 'bg-amber-500',
      shadow: 'shadow-amber-200',
      size: 'w-12 h-12'
    },
    {
      id: 'swap',
      icon: 'restaurant_menu',
      label: 'ดูสูตร',
      color: 'bg-violet-500',
      shadow: 'shadow-violet-200',
      size: 'w-12 h-12'
    },
    {
      id: 'like',
      icon: 'favorite',
      label: 'ชอบ',
      color: 'bg-emerald-600',
      shadow: 'shadow-emerald-200',
      size: 'w-14 h-14'
    }
  ];

  return (
    <div className="flex items-end justify-center gap-3">
      {buttons.map((btn) => (
        <div key={btn.id} className="flex flex-col items-center gap-1">
          <motion.button
            onClick={() => onAction(btn.id)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`${btn.size} ${btn.color} ${btn.shadow} rounded-full shadow-lg flex items-center justify-center text-white`}
          >
            <Icon name={btn.icon} className={btn.size === 'w-14 h-14' ? 'w-6 h-6' : 'w-5 h-5'} />
          </motion.button>
          <span className="text-[11px] font-semibold text-slate-600">{btn.label}</span>
        </div>
      ))}
    </div>
  );
}
