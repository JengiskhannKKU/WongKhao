import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from '@/components/ui/Icon';

const levelColors = {
  1: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'ง่าย', ring: 'ring-emerald-200' },
  2: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'ปานกลาง', ring: 'ring-amber-200' },
  3: { bg: 'bg-red-100', text: 'text-red-700', label: 'ยาก', ring: 'ring-red-200' },
};

export default function ChallengeCard({ challenge, onJoin, isJoined, progress }) {
  const [joining, setJoining] = useState(false);
  const level = levelColors[challenge.level] || levelColors[1];

  const daysLeft = challenge.end_date
    ? Math.max(0, Math.ceil((new Date(challenge.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : challenge.duration_days || 7;

  const handleJoin = async () => {
    setJoining(true);
    await onJoin?.(challenge.id);
    setTimeout(() => setJoining(false), 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-3xl overflow-hidden shadow-sm border ${isJoined ? 'border-teal-200 ring-1 ring-teal-100' : 'border-slate-100'}`}
    >
      {/* Header gradient strip */}
      <div className={`h-1.5 ${challenge.level === 3 ? 'bg-gradient-to-r from-red-400 to-orange-400' :
        challenge.level === 2 ? 'bg-gradient-to-r from-amber-400 to-yellow-400' :
          'bg-gradient-to-r from-emerald-400 to-teal-400'
        }`} />

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 flex items-center justify-center text-2xl flex-shrink-0">
            {challenge.icon || '🏆'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${level.bg} ${level.text}`}>
                {level.label}
              </span>
              {isJoined && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-700">
                  เข้าร่วมแล้ว
                </span>
              )}
            </div>
            <h3 className="font-bold text-slate-800 text-base leading-tight">{challenge.title}</h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{challenge.description}</p>
          </div>
        </div>

        {/* Progress bar (if joined) */}
        {isJoined && progress != null && (
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">ความคืบหน้า</span>
              <span className="font-bold text-teal-700">{progress}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Icon name="group" className="w-3.5 h-3.5" />
              {challenge.participant_count || 0} คน
            </span>
            <span className="flex items-center gap-1">
              <Icon name="schedule" className="w-3.5 h-3.5" />
              {daysLeft} วัน
            </span>
            <span className="flex items-center gap-1">
              <Icon name="star" className="w-3.5 h-3.5 text-amber-500" />
              {challenge.reward_points || 0} pt
            </span>
          </div>

          {!isJoined ? (
            <button
              onClick={handleJoin}
              disabled={joining}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-all active:scale-95"
            >
              <Icon name="bolt" className="w-3 h-3" />
              เข้าร่วม
            </button>
          ) : (
            <div className="flex items-center gap-1 text-xs text-teal-600 font-medium">
              ดูรายละเอียด
              <Icon name="chevron_right" className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
