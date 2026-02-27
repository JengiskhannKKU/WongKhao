import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

export default function MenuCard({ menu, onSwipe }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const dislikeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 100) {
      onSwipe({ action: 'like', source: 'drag' });
    } else if (info.offset.x < -100) {
      onSwipe({ action: 'dislike', source: 'drag' });
    }
  };

  const sodiumColors = {
    low: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-red-100 text-red-700',
  };

  const sodiumLabels = {
    low: 'โซเดียมต่ำ',
    medium: 'โซเดียมปานกลาง',
    high: 'โซเดียมสูง',
  };

  return (
    <motion.div
      className="absolute w-full h-full cursor-grab active:cursor-grabbing"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      {/* Swipe indicators */}
      <motion.div
        className="absolute top-6 right-6 z-10 bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-lg border-2 border-white shadow-lg"
        style={{ opacity: likeOpacity, rotate: -12 }}
      >
        ชอบ ✓
      </motion.div>
      <motion.div
        className="absolute top-6 left-6 z-10 bg-red-500 text-white px-4 py-2 rounded-xl font-bold text-lg border-2 border-white shadow-lg"
        style={{ opacity: dislikeOpacity, rotate: 12 }}
      >
        ✗ ไม่สน
      </motion.div>

      <div className="w-full h-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Image */}
        <div className="relative flex-1 min-h-0">
          <img
            src={menu.image_url}
            alt={menu.name_th}
            className="w-full h-full object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Menu name overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h2 className="text-2xl font-bold text-white mb-1">{menu.name_th}</h2>
            <p className="text-white/80 text-sm">{menu.name_en}</p>
          </div>
        </div>

        {/* Info section */}
        <div className="p-4 space-y-3">
          {/* Tags row */}
          <div className="flex flex-wrap gap-2">
            {menu.sodium_level && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${sodiumColors[menu.sodium_level]}`}>
                {sodiumLabels[menu.sodium_level]}
              </span>
            )}
            {menu.health_score && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                สุขภาพ {menu.health_score}/100
              </span>
            )}
            {menu.spice_level && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                {'🌶️'.repeat(Math.min(menu.spice_level, 5))}
              </span>
            )}
          </div>

          {/* Nutrition */}
          <div className="flex justify-between text-center">
            <div>
              <p className="text-lg font-bold text-slate-800">{menu.calories}</p>
              <p className="text-xs text-slate-500">แคล</p>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">{menu.protein}g</p>
              <p className="text-xs text-slate-500">โปรตีน</p>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">{menu.carbs}g</p>
              <p className="text-xs text-slate-500">คาร์บ</p>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">{menu.fat}g</p>
              <p className="text-xs text-slate-500">ไขมัน</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
