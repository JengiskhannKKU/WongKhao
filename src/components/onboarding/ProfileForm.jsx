import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Heart, Flame, Leaf, Droplets } from 'lucide-react';

const regions = [
  { value: 'north', label: 'ภาคเหนือ', emoji: '🏔️' },
  { value: 'northeast', label: 'ภาคอีสาน', emoji: '🌾' },
  { value: 'central', label: 'ภาคกลาง', emoji: '🏛️' },
  { value: 'south', label: 'ภาคใต้', emoji: '🏖️' },
];

const healthGoals = [
  { value: 'reduce_sodium', label: 'ลดโซเดียม', icon: Droplets, color: 'bg-blue-100 text-blue-700' },
  { value: 'lose_weight', label: 'ลดน้ำหนัก', icon: Flame, color: 'bg-orange-100 text-orange-700' },
  { value: 'eat_clean', label: 'กินคลีน', icon: Leaf, color: 'bg-emerald-100 text-emerald-700' },
  { value: 'heart_health', label: 'ดูแลหัวใจ', icon: Heart, color: 'bg-rose-100 text-rose-700' },
];

const spiceLevels = [
  { value: 1, label: 'ไม่เผ็ด' },
  { value: 2, label: 'เผ็ดน้อย' },
  { value: 3, label: 'เผ็ดกลาง' },
  { value: 4, label: 'เผ็ดมาก' },
  { value: 5, label: 'เผ็ดสุดๆ 🔥' },
];

export default function ProfileForm({ onSubmit }) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    region: '',
    health_goals: [],
    spice_level: 3,
    sodium_target: 15,
  });

  const toggleHealthGoal = (goal) => {
    setFormData(prev => ({
      ...prev,
      health_goals: prev.health_goals.includes(goal)
        ? prev.health_goals.filter(g => g !== goal)
        : [...prev.health_goals, goal]
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const canProceed = () => {
    if (step === 0) return formData.region !== '';
    if (step === 1) return formData.health_goals.length > 0;
    return true;
  };

  const steps = [
    // Step 0: Region
    <motion.div key="region" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-800">คุณอยู่ภาคไหน?</h2>
      <p className="text-slate-600 text-sm">เราจะแนะนำเมนูท้องถิ่นที่เหมาะกับคุณ</p>
      <div className="grid grid-cols-2 gap-3 mt-6">
        {regions.map(r => (
          <button
            key={r.value}
            onClick={() => setFormData(prev => ({ ...prev, region: r.value }))}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${formData.region === r.value
                ? 'border-teal-500 bg-teal-50'
                : 'border-slate-100 bg-white hover:border-slate-200'
              }`}
          >
            <span className="text-2xl">{r.emoji}</span>
            <p className="font-semibold text-slate-800 mt-2">{r.label}</p>
          </button>
        ))}
      </div>
    </motion.div>,

    // Step 1: Health Goals
    <motion.div key="goals" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-800">เป้าหมายสุขภาพ</h2>
      <p className="text-slate-600 text-sm">เลือกได้มากกว่า 1 ข้อ</p>
      <div className="space-y-3 mt-6">
        {healthGoals.map(goal => {
          const Icon = goal.icon;
          const selected = formData.health_goals.includes(goal.value);
          return (
            <button
              key={goal.value}
              onClick={() => toggleHealthGoal(goal.value)}
              className={`w-full p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${selected
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
            >
              <div className={`w-10 h-10 rounded-xl ${goal.color} flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="font-medium text-slate-800">{goal.label}</span>
              {selected && <span className="ml-auto text-teal-600">✓</span>}
            </button>
          );
        })}
      </div>
    </motion.div>,

    // Step 2: Spice Level
    <motion.div key="spice" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-800">ระดับความเผ็ด</h2>
      <p className="text-slate-600 text-sm">คุณทนเผ็ดได้แค่ไหน?</p>
      <div className="space-y-3 mt-6">
        {spiceLevels.map(level => (
          <button
            key={level.value}
            onClick={() => setFormData(prev => ({ ...prev, spice_level: level.value }))}
            className={`w-full p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${formData.spice_level === level.value
                ? 'border-teal-500 bg-teal-50'
                : 'border-slate-100 bg-white hover:border-slate-200'
              }`}
          >
            <div className="flex gap-0.5">
              {Array.from({ length: level.value }).map((_, i) => (
                <span key={i} className="text-lg">🌶️</span>
              ))}
            </div>
            <span className="font-medium text-slate-800">{level.label}</span>
          </button>
        ))}
      </div>
    </motion.div>,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-teal-50/40">
      <div className="max-w-sm mx-auto px-4 py-8">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-teal-600' : 'bg-slate-200'
                }`}
            />
          ))}
        </div>

        {/* Current Step */}
        {steps[step]}

        {/* Navigation */}
        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-700 font-medium"
            >
              ย้อนกลับ
            </button>
          )}
          <button
            onClick={() => {
              if (step < steps.length - 1) {
                setStep(s => s + 1);
              } else {
                handleSubmit();
              }
            }}
            disabled={!canProceed()}
            className={`flex-1 py-3 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all ${canProceed()
                ? 'bg-teal-600 text-white hover:bg-teal-700'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
          >
            {step < steps.length - 1 ? 'ถัดไป' : 'เริ่มต้นใช้งาน'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}