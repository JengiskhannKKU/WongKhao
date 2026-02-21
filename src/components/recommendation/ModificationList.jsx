import React from 'react';
import { Check, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ModificationList({ modifications = [] }) {
  const defaultMods = [
    'ลดน้ำปลาจาก 2 ช้อน → 1 ช้อน',
    'ใช้น้ำปลาลดโซเดียม',
    'เพิ่มมะเขือเทศเพื่อเพิ่มโพแทสเซียม',
    'ลดผงชูรส 100%',
    'เพิ่มผักสดเป็น 2 เท่า'
  ];
  
  const items = modifications.length > 0 ? modifications : defaultMods;
  
  return (
    <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-5 border border-slate-100">
      <div className="flex items-center gap-2 mb-4">
        <Info className="w-5 h-5 text-teal-600" />
        <h3 className="text-base font-bold text-slate-800">สูตรปรับใหม่</h3>
      </div>
      
      <div className="space-y-2">
        {items.map((mod, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-3 p-2 rounded-lg hover:bg-white transition-colors"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-emerald-600" />
            </div>
            <p className="text-sm text-slate-700">{mod}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}