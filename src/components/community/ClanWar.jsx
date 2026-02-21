import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingDown, Crown } from 'lucide-react';

export default function ClanWar({ provinces }) {
  const sortedProvinces = [...(provinces || [])].sort((a, b) => 
    (b.total_sodium_reduced || 0) - (a.total_sodium_reduced || 0)
  );

  const topThree = sortedProvinces.slice(0, 3);

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-5 border-2 border-amber-200">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-6 h-6 text-amber-600" />
        <h2 className="text-xl font-bold text-slate-800">ศึกชิงแชมป์จังหวัด</h2>
      </div>

      <p className="text-sm text-slate-600 mb-4">สัปดาห์นี้ จังหวัดไหนลดเค็มรวมกันได้มากที่สุด?</p>

      <div className="space-y-3">
        {topThree.map((province, index) => (
          <motion.div
            key={province.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-2xl p-4 flex items-center gap-3 ${
              index === 0 ? 'ring-2 ring-amber-500 shadow-lg' : 'shadow-sm'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              index === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
              index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400' :
              'bg-gradient-to-br from-amber-600 to-amber-700'
            }`}>
              {index === 0 ? (
                <Crown className="w-6 h-6 text-white" />
              ) : (
                <span className="text-xl font-bold text-white">{index + 1}</span>
              )}
            </div>

            <div className="flex-1">
              <h4 className="font-bold text-slate-800">{province.province}</h4>
              <p className="text-xs text-slate-500">{province.participant_count || 0} คนร่วมลุย</p>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 text-emerald-600">
                <TrendingDown className="w-4 h-4" />
                <span className="font-bold">{province.total_sodium_reduced || 0}</span>
              </div>
              <p className="text-xs text-slate-500">mg โซเดียม</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}