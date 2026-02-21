import React from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, Leaf, Users, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ActionButtons({ onAdjust, onOrder }) {
  const adjustments = [
    { id: 'more_sodium', label: 'ลดเค็มมากขึ้น', icon: Minus },
    { id: 'more_protein', label: 'เพิ่มโปรตีน', icon: Plus },
    { id: 'clean', label: 'ทำแบบคลีน 100%', icon: Leaf },
    { id: 'family', label: 'เวอร์ชันครอบครัว', icon: Users }
  ];
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {adjustments.map((adj, index) => (
          <motion.button
            key={adj.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onAdjust?.(adj.id)}
            className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all text-left"
          >
            <adj.icon className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-700">{adj.label}</span>
          </motion.button>
        ))}
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button 
          onClick={onOrder}
          className="w-full h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl shadow-lg shadow-emerald-200"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          สั่งวัตถุดิบทั้งหมด
        </Button>
        <p className="text-center text-xs text-slate-500 mt-2">
          ประมาณราคา ฿120 - ฿150
        </p>
      </motion.div>
    </div>
  );
}