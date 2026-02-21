import React from 'react';
import { motion } from 'framer-motion';
import { X, Heart, Bookmark, ChefHat } from 'lucide-react';

export default function SwipeActions({ onAction }) {
  const buttons = [
    {
      id: 'dislike',
      icon: X,
      color: 'bg-rose-500',
      shadow: 'shadow-rose-200',
      size: 'w-14 h-14'
    },
    {
      id: 'save',
      icon: Bookmark,
      color: 'bg-amber-500',
      shadow: 'shadow-amber-200',
      size: 'w-12 h-12'
    },
    {
      id: 'swap',
      icon: ChefHat,
      color: 'bg-violet-500',
      shadow: 'shadow-violet-200',
      size: 'w-12 h-12'
    },
    {
      id: 'like',
      icon: Heart,
      color: 'bg-emerald-600',
      shadow: 'shadow-emerald-200',
      size: 'w-14 h-14'
    }
  ];

  return (
    <div className="flex items-center justify-center gap-4">
      {buttons.map((btn) => (
        <motion.button
          key={btn.id}
          onClick={() => onAction(btn.id)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`${btn.size} ${btn.color} ${btn.shadow} rounded-full shadow-lg flex items-center justify-center text-white`}
        >
          <btn.icon className={btn.size === 'w-14 h-14' ? 'w-6 h-6' : 'w-5 h-5'} />
        </motion.button>
      ))}
    </div>
  );
}