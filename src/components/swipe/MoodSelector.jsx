import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Flame, Salad, Droplets, X } from 'lucide-react';

const moods = [
  { id: 'comfort', label: 'สบาย ๆ', icon: Sparkles, color: 'bg-blue-500' },
  { id: 'spicy', label: 'เผ็ดจัด', icon: Flame, color: 'bg-orange-500' },
  { id: 'healthy', label: 'ควบคุมน้ำหนัก', icon: Salad, color: 'bg-emerald-500' },
  { id: 'low_sodium', label: 'ลดเค็ม', icon: Droplets, color: 'bg-cyan-500' }
];

export default function MoodSelector({ isOpen, onClose, onSelect, selectedMood }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-white rounded-t-3xl p-6 pb-10"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-800">วันนี้อยากกินแบบไหน?</h3>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {moods.map((mood) => (
                <motion.button
                  key={mood.id}
                  onClick={() => {
                    onSelect(mood.id);
                    onClose();
                  }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    selectedMood === mood.id
                      ? 'border-slate-800 bg-slate-50'
                      : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <div className={`w-12 h-12 ${mood.color} rounded-xl flex items-center justify-center mb-3 mx-auto`}>
                    <mood.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-medium text-slate-700">{mood.label}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}