import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from '@/components/ui/Icon';
import { Badge } from '@/components/ui/badge';

const regionLabels = {
  north: 'ภาคเหนือ',
  northeast: 'ภาคอีสาน',
  central: 'ภาคกลาง',
  south: 'ภาคใต้'
};

const cheerIcons = [
  { emoji: '🍗', label: 'โปรตีนเยี่ยม' },
  { emoji: '🌶️', label: 'เผ็ดมันส์' },
  { emoji: '🥬', label: 'สุขภาพดี' },
  { emoji: '💪', label: 'เจ็งมาก' }
];

export default function PostCard({ post, onCheer }) {
  const [showCheers, setShowCheers] = useState(false);
  const [cheered, setCheered] = useState(false);

  const handleCheer = async (cheerType) => {
    setCheered(true);
    setShowCheers(false);
    onCheer?.(post.id, cheerType);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 mb-4"
    >
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center">
          <span className="text-lg">{post.created_by?.[0]?.toUpperCase() || '👤'}</span>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-800">{post.created_by || 'Anonymous'}</p>
          <p className="text-xs text-slate-500">{post.province || regionLabels[post.region]}</p>
        </div>
        {post.challenge_id && (
          <Badge variant="default" className="bg-amber-100 text-amber-700 border-0">
            <Icon name="emoji_events" className="w-3 h-3 mr-1" />
            Challenge
          </Badge>
        )}
      </div>

      {/* Image with Overlay */}
      <div className="relative">
        <img
          src={post.image_url}
          alt={post.menu_name}
          className="w-full aspect-square object-cover"
        />

        {/* Stats Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h3 className="text-white font-bold text-lg mb-2">{post.menu_name}</h3>
          <div className="flex gap-2">
            {post.sodium_reduced && (
              <div className="bg-emerald-500/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                <Icon name="trending_down" className="w-3 h-3 text-white" />
                <span className="text-xs font-semibold text-white">-{post.sodium_reduced}% เค็ม</span>
              </div>
            )}
            {post.calories_reduced && (
              <div className="bg-orange-500/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                <Icon name="local_fire_department" className="w-3 h-3 text-white" />
                <span className="text-xs font-semibold text-white">-{post.calories_reduced}% แคล</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {post.caption && (
          <p className="text-slate-700 text-sm mb-3">{post.caption}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 relative">
          <button
            onClick={() => setShowCheers(!showCheers)}
            className={`flex items-center gap-1 ${cheered ? 'text-rose-500' : 'text-slate-500'}`}
          >
            <Icon name="favorite" className={`w-5 h-5 ${cheered ? 'text-rose-500' : ''}`} filled={cheered} />
            <span className="text-sm font-medium">{post.cheer_count || 0}</span>
          </button>

          {/* Cheer Options */}
          {showCheers && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute left-0 top-8 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 flex gap-2 z-10"
            >
              {cheerIcons.map((cheer) => (
                <button
                  key={cheer.emoji}
                  onClick={() => handleCheer(cheer.emoji)}
                  className="w-12 h-12 rounded-xl hover:bg-slate-50 flex items-center justify-center text-2xl transition-all hover:scale-110"
                  title={cheer.label}
                >
                  {cheer.emoji}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}