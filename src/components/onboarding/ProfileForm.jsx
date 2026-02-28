import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from '@/components/ui/Icon';

const regions = [
  { value: 'north', label: 'ภาคเหนือ', image: 'https://images.unsplash.com/photo-1552632230-10901fd5fb8b?w=300&h=200&fit=crop&q=80' },
  { value: 'northeast', label: 'ภาคอีสาน', image: 'https://images.unsplash.com/photo-1628867389140-5e608027aeb8?w=300&h=200&fit=crop&q=80' },
  { value: 'central', label: 'ภาคกลาง', image: 'https://images.unsplash.com/photo-1582468546235-9bf31e5bc4a1?w=300&h=200&fit=crop&q=80' },
  { value: 'south', label: 'ภาคใต้', image: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=300&h=200&fit=crop&q=80' },
];

const healthGoals = [
  { value: 'reduce_sodium', label: 'ลดโซเดียม', icon: 'water_drop', color: 'bg-blue-100 text-blue-700' },
  { value: 'lose_weight', label: 'ลดน้ำหนัก', icon: 'local_fire_department', color: 'bg-orange-100 text-orange-700' },
  { value: 'eat_clean', label: 'กินคลีน', icon: 'eco', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'heart_health', label: 'ดูแลหัวใจ', icon: 'favorite', color: 'bg-rose-100 text-rose-700' },
];

const spiceLevels = [
  { value: 1, label: 'ไม่เผ็ด' },
  { value: 2, label: 'เผ็ดน้อย' },
  { value: 3, label: 'เผ็ดกลาง' },
  { value: 4, label: 'เผ็ดมาก' },
  { value: 5, label: 'เผ็ดสุดๆ 🔥' },
];

const activityLevels = [
  { value: 'sedentary', label: 'นั่งทำงานเป็นส่วนใหญ่', desc: 'แทบไม่ได้ออกกำลังกาย' },
  { value: 'light', label: 'ออกกำลังกายน้อย', desc: '1-3 วัน/สัปดาห์' },
  { value: 'moderate', label: 'ออกกำลังกายปานกลาง', desc: '3-5 วัน/สัปดาห์' },
  { value: 'active', label: 'ออกกำลังกายหนัก', desc: '6-7 วัน/สัปดาห์' }
];

const genders = [
  { value: 'male', label: 'ชาย' },
  { value: 'female', label: 'หญิง' },
  { value: 'other', label: 'อื่นๆ / ไม่ระบุ' }
];

export default function ProfileForm({ onSubmit }) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    // Basic Info
    full_name: '',
    email: '',
    // Demographics & Metrics
    age: '',
    gender: '',
    height_cm: '',
    weight_kg: '',
    // Activity & Goals
    activity_level: '',
    region: '',
    health_goals: [], // will act as 'goal'
    spice_level: 3,
    sodium_target: 15,
    // Defaults & App State
    language: 'th',
    subscription_tier: 'free',
    is_premium: false,
    monthly_scans: 0,
    monthly_chat_messages: 0,
    bmi: 0,
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
    // Calculate BMI before submit
    const h = parseFloat(formData.height_cm) / 100;
    const w = parseFloat(formData.weight_kg);
    let bmi = 0;
    if (h > 0 && w > 0) {
      bmi = parseFloat((w / (h * h)).toFixed(1));
    }

    // Map health_goals to single 'goal' text based on user request (or just join them)
    const goalText = formData.health_goals.join(', ');

    const finalData = {
      ...formData,
      bmi,
      goal: goalText || 'healthy'
    };

    onSubmit(finalData);
  };

  const canProceed = () => {
    if (step === 0) return formData.full_name.trim() !== '';
    if (step === 1) return formData.age && formData.gender && formData.height_cm && formData.weight_kg;
    if (step === 2) return formData.activity_level !== '';
    if (step === 3) return formData.region !== '';
    if (step === 4) return formData.health_goals.length > 0;
    return true; // Step 5 (Spice) has default
  };

  const steps = [
    // Step 0: Basic Info
    <motion.div key="basic" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <h2 className="text-2xl font-bold text-emerald-700">ข้อมูลพื้นฐานของคุณ</h2>
      <p className="text-slate-500 text-sm mt-2 leading-relaxed">ระบุชื่อและอีเมลให้ WongKhao ปรับค่าทางโภชนาการให้เหมาะกับความต้องการของคุณ</p>
      <div className="space-y-4 mt-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 px-1">ชื่อ - นามสกุล หรือชื่อเล่น</label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="ชื่อของคุณ..."
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:bg-white focus:outline-none transition-colors text-slate-700 placeholder-slate-400"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 px-1">อีเมล (ถ้ามี)</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="example@email.com"
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:bg-white focus:outline-none transition-colors text-slate-700 placeholder-slate-400"
          />
        </div>
      </div>
    </motion.div>,

    // Step 1: Demographics & Metrics
    <motion.div key="demo" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <h2 className="text-2xl font-bold text-emerald-700">ข้อมูลร่างกาย</h2>
      <p className="text-slate-500 text-sm mt-2 leading-relaxed">เพื่อการคำนวณที่แม่นยำ</p>
      <div className="space-y-4 mt-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 px-1">เพศ</label>
          <div className="flex gap-2">
            {genders.map(g => (
              <button
                key={g.value}
                onClick={() => setFormData({ ...formData, gender: g.value })}
                className={`flex-1 py-3 px-2 rounded-2xl border transition-colors ${formData.gender === g.value ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold' : 'border-slate-200 bg-slate-50 text-slate-500'}`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-bold text-slate-700 mb-2 px-1">อายุ (ปี)</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:bg-white focus:outline-none text-slate-700 placeholder-slate-400"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-bold text-slate-700 mb-2 px-1">ส่วนสูง (ซม.)</label>
            <input
              type="number"
              value={formData.height_cm}
              onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:bg-white focus:outline-none text-slate-700 placeholder-slate-400"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-bold text-slate-700 mb-2 px-1">น้ำหนัก (กก.)</label>
            <input
              type="number"
              value={formData.weight_kg}
              onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:bg-white focus:outline-none text-slate-700 placeholder-slate-400"
            />
          </div>
        </div>
      </div>
    </motion.div>,

    // Step 2: Activity Level
    <motion.div key="activity" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <h2 className="text-2xl font-bold text-emerald-700">กิจกรรมประจำวัน</h2>
      <p className="text-slate-500 text-sm mt-2 leading-relaxed">ช่วยให้เรากะปริมาณพลังงานได้</p>
      <div className="space-y-3 mt-6">
        {activityLevels.map(act => (
          <button
            key={act.value}
            onClick={() => setFormData({ ...formData, activity_level: act.value })}
            className={`w-full p-4 rounded-2xl border flex flex-col items-start gap-1 transition-all ${formData.activity_level === act.value
              ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
              : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
          >
            <span className="font-bold text-lg">{act.label}</span>
            <span className={`text-sm ${formData.activity_level === act.value ? 'text-emerald-600' : 'text-slate-500'}`}>{act.desc}</span>
          </button>
        ))}
      </div>
    </motion.div>,

    // Step 3: Region
    <motion.div key="region" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <h2 className="text-2xl font-bold text-emerald-700">คุณอยู่ภาคไหน?</h2>
      <p className="text-slate-500 text-sm mt-2 leading-relaxed">เราจะแนะนำเมนูท้องถิ่นที่เหมาะกับคุณ</p>
      <div className="grid grid-cols-2 gap-4 mt-6">
        {regions.map(r => (
          <button
            key={r.value}
            onClick={() => setFormData(prev => ({ ...prev, region: r.value }))}
            className={`p-3 rounded-2xl border text-center transition-all overflow-hidden ${formData.region === r.value
              ? 'border-emerald-500 bg-emerald-50 shadow-sm ring-2 ring-emerald-100'
              : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
          >
            <div className="w-full aspect-video rounded-xl overflow-hidden mb-3">
              <img src={r.image} alt={r.label} className="w-full h-full object-cover" />
            </div>
            <p className={`font-bold text-lg ${formData.region === r.value ? 'text-emerald-700' : 'text-slate-700'}`}>{r.label}</p>
          </button>
        ))}
      </div>
    </motion.div>,

    // Step 4: Health Goals
    <motion.div key="goals" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <h2 className="text-2xl font-bold text-emerald-700">เป้าหมายสุขภาพ</h2>
      <p className="text-slate-500 text-sm mt-2 leading-relaxed">เลือกได้มากกว่า 1 ข้อ</p>
      <div className="space-y-3 mt-6">
        {healthGoals.map(goal => {
          const selected = formData.health_goals.includes(goal.value);
          return (
            <button
              key={goal.value}
              onClick={() => toggleHealthGoal(goal.value)}
              className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-all ${selected
                ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
            >
              <div className={`w-12 h-12 rounded-xl ${goal.color} flex items-center justify-center`}>
                <Icon name={goal.icon} className="w-6 h-6" />
              </div>
              <span className={`font-bold text-lg ${selected ? 'text-emerald-700' : 'text-slate-700'}`}>{goal.label}</span>
              {selected && <span className="ml-auto text-emerald-600 text-xl font-bold">✓</span>}
            </button>
          );
        })}
      </div>
    </motion.div>,

    // Step 5: Spice Level
    <motion.div key="spice" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <h2 className="text-2xl font-bold text-emerald-700">ระดับความเผ็ด</h2>
      <p className="text-slate-500 text-sm mt-2 leading-relaxed">คุณทนเผ็ดได้แค่ไหน?</p>
      <div className="space-y-3 mt-6">
        {spiceLevels.map(level => (
          <button
            key={level.value}
            onClick={() => setFormData(prev => ({ ...prev, spice_level: level.value }))}
            className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-all ${formData.spice_level === level.value
              ? 'border-emerald-500 bg-emerald-50 shadow-sm'
              : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
          >
            <div className="flex gap-1 w-24">
              {Array.from({ length: level.value }).map((_, i) => (
                <span key={i} className="text-xl">🌶️</span>
              ))}
            </div>
            <span className={`font-bold text-lg ${formData.spice_level === level.value ? 'text-emerald-700' : 'text-slate-700'}`}>{level.label}</span>
          </button>
        ))}
      </div>
    </motion.div>,
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Banner (Emerald theme) */}
      <div className="bg-emerald-500 py-4 flex justify-center items-center shadow-sm">
        <div className="flex items-center gap-2 text-white font-black text-2xl">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-sm">
            <Icon name="restaurant_menu" className="w-6 h-6" />
          </div>
          <span>WongKhao</span>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 flex flex-col items-center">
        {/* White Card Container */}
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 w-full max-w-sm p-6 relative">

          {/* Progress Bar (Optional, but good for UX) */}
          <div className="flex gap-1.5 mb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? 'bg-emerald-500' : 'bg-slate-100'}`}
              />
            ))}
          </div>

          {/* Current Step Content */}
          <div className="min-h-[320px]">
            {steps[step]}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => {
                if (step < steps.length - 1) {
                  setStep(s => s + 1);
                } else {
                  handleSubmit();
                }
              }}
              disabled={!canProceed()}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${canProceed()
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 hover:bg-emerald-700'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
            >
              {step < steps.length - 1 ? 'ถัดไป' : 'เริ่มต้นใช้งาน'}
            </button>

            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="w-full py-2 text-slate-500 font-medium hover:text-slate-700"
              >
                ย้อนกลับ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}