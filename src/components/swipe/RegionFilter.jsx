import React from 'react';
import { motion } from 'framer-motion';

const regions = [
  { id: 'all', label: 'ทั้งหมด', emoji: '🇹🇭' },
  { id: 'north', label: 'เหนือ', emoji: '🏔️' },
  { id: 'northeast', label: 'อีสาน', emoji: '🌾' },
  { id: 'central', label: 'กลาง', emoji: '🏛️' },
  { id: 'south', label: 'ใต้', emoji: '🏝️' }
];

export default function RegionFilter({ selected, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {regions.map((region) => (
        <motion.button
          key={region.id}
          onClick={() => onSelect(region.id)}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap transition-all ${selected === region.id
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
              : 'bg-transparent text-slate-500 border border-slate-200 hover:border-emerald-300'
            }`}
        >
          <span>{region.emoji}</span>
          <span className="text-sm font-medium">{region.label}</span>
        </motion.button>
      ))}
    </div>
  );
}