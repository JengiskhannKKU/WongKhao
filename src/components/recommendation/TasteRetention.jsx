import React from 'react';
import { motion } from 'framer-motion';

export default function TasteRetention({ percentage = 85 }) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-5 flex items-center gap-4">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="45"
            stroke="#e2e8f0"
            strokeWidth="6"
            fill="none"
          />
          <motion.circle
            cx="48"
            cy="48"
            r="45"
            stroke="url(#gradient)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              strokeDasharray: circumference
            }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-slate-800">{percentage}%</span>
        </div>
      </div>
      
      <div>
        <h4 className="font-bold text-slate-800 mb-1 text-lg">รสชาติคงเดิม</h4>
        <p className="text-sm text-slate-600">ความอร่อยแทบไม่ต่าง</p>
        <div className="mt-2 inline-flex items-center gap-1 bg-violet-100 px-2 py-1 rounded-full">
          <span className="text-xs font-medium text-violet-700">✨ รับรอง!</span>
        </div>
      </div>
    </div>
  );
}