import React from 'react';
import Icon from '@/components/ui/Icon';

export default function ProgressHeader({ streakDays = 3, sodiumReduction = 15, targetText = 'ลดโซเดียม 15%' }) {
  return (
    <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-3xl p-4 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Icon name="local_fire_department" className="w-6 h-6 text-orange-300" />
          </div>
          <div>
            <p className="text-2xl font-bold">{streakDays}</p>
            <p className="text-xs text-white/80">วันติดต่อกัน</p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 justify-end mb-1">
            <Icon name="trending_down" className="w-4 h-4 text-emerald-300" />
            <span className="text-xl font-bold">-{sodiumReduction}%</span>
          </div>
          <p className="text-xs text-white/80">โซเดียม</p>
        </div>
      </div>
    </div>
  );
}