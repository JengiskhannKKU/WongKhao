import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import Icon from '@/components/ui/Icon';

const regions = [
  { value: 'north', label: 'ภาคเหนือ', image: 'https://images.unsplash.com/photo-1671073454416-a037f3211e80?w=300&h=200&fit=crop&q=80' },
  { value: 'northeast', label: 'ภาคอีสาน', image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=300&h=200&fit=crop&q=80' },
  { value: 'central', label: 'ภาคกลาง', image: 'https://images.unsplash.com/photo-1582468546235-9bf31e5bc4a1?w=300&h=200&fit=crop&q=80' },
  { value: 'south', label: 'ภาคใต้', image: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=300&h=200&fit=crop&q=80' },
];

const healthGoals = [
  // พื้นฐาน
  { value: 'reduce_sodium', label: 'ลดโซเดียม', icon: 'water_drop', color: 'bg-blue-100 text-blue-700' },
  { value: 'lose_weight', label: 'ลดน้ำหนัก', icon: 'local_fire_department', color: 'bg-orange-100 text-orange-700' },
  { value: 'eat_clean', label: 'กินคลีน', icon: 'eco', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'heart_health', label: 'ดูแลหัวใจ', icon: 'favorite', color: 'bg-rose-100 text-rose-700' },

  // กลุ่มควบคุมโรค/ค่าเลือด
  { value: 'control_sugar', label: 'ควบคุมน้ำตาล', icon: 'bloodtype', color: 'bg-red-100 text-red-700' },
  { value: 'reduce_cholesterol', label: 'ลดไขมันในเลือด', icon: 'monitor_heart', color: 'bg-pink-100 text-pink-700' },
  { value: 'kidney_care', label: 'ดูแลไต', icon: 'medical_services', color: 'bg-purple-100 text-purple-700' },

  // กลุ่ม Body Composition
  { value: 'build_muscle', label: 'เพิ่มกล้ามเนื้อ', icon: 'fitness_center', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'maintain_weight', label: 'รักษาน้ำหนัก', icon: 'balance', color: 'bg-teal-100 text-teal-700' },

  // กลุ่ม Gut & Energy
  { value: 'gut_health', label: 'ดูแลลำไส้', icon: 'coronavirus', color: 'bg-lime-100 text-lime-700' },
  { value: 'boost_energy', label: 'เพิ่มพลังงาน', icon: 'bolt', color: 'bg-yellow-100 text-yellow-700' },

  // กลุ่ม Specific Nutrition
  { value: 'high_protein', label: 'เพิ่มโปรตีน', icon: 'set_meal', color: 'bg-amber-100 text-amber-700' },
  { value: 'calcium', label: 'เสริมแคลเซียม', icon: 'accessibility_new', color: 'bg-cyan-100 text-cyan-700' },
];

const spiceLevels = [
  { value: 1, label: 'ไม่เผ็ด' },
  { value: 2, label: 'เผ็ดน้อย' },
  { value: 3, label: 'เผ็ดกลาง' },
  { value: 4, label: 'เผ็ดมาก' },
  { value: 5, label: 'เผ็ดสุดๆ 🔥' },
];

const activityLevels = [
  { value: 'sedentary', label: 'นั่งทำงานเป็นส่วนใหญ่', desc: 'แทบไม่ได้ออกกำลังกาย', multiplier: 1.2 },
  { value: 'light', label: 'ออกกำลังกายน้อย', desc: '1-3 วัน/สัปดาห์', multiplier: 1.375 },
  { value: 'moderate', label: 'ออกกำลังกายปานกลาง', desc: '3-5 วัน/สัปดาห์', multiplier: 1.55 },
  { value: 'active', label: 'ออกกำลังกายหนัก', desc: '6-7 วัน/สัปดาห์', multiplier: 1.725 },
];

const genders = [
  { value: 'male', label: 'ชาย' },
  { value: 'female', label: 'หญิง' },
  { value: 'other', label: 'อื่นๆ' }
];

// --- Health Profile Constants ---
const primaryGoals = [
  { value: 'lose_weight', label: 'ลดน้ำหนัก', icon: 'trending_down', color: 'bg-orange-100 text-orange-700' },
  { value: 'build_muscle', label: 'เพิ่มกล้ามเนื้อ', icon: 'fitness_center', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'maintain_weight', label: 'รักษาน้ำหนัก', icon: 'balance', color: 'bg-teal-100 text-teal-700' },
  { value: 'stay_healthy', label: 'ดูแลสุขภาพทั่วไป', icon: 'spa', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'control_disease', label: 'ควบคุมโรค', icon: 'medical_services', color: 'bg-rose-100 text-rose-700' },
  { value: 'boost_energy', label: 'เพิ่มพลังงาน', icon: 'bolt', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'maternity_health', label: 'สุขภาพแม่และเด็ก', icon: 'pregnant_woman', color: 'bg-pink-100 text-pink-700' },
];

const chronicDiseaseOptions = [
  { value: 'diabetes_1', label: 'เบาหวานประเภท 1' },
  { value: 'diabetes_2', label: 'เบาหวานประเภท 2' },
  { value: 'hypertension', label: 'ความดันโลหิตสูง' },
  { value: 'dyslipidemia', label: 'ไขมันในเลือดสูง' },
  { value: 'kidney_disease', label: 'โรคไต' },
  { value: 'heart_disease', label: 'โรคหัวใจ' },
  { value: 'thyroid', label: 'ภาวะไทรอยด์' },
  { value: 'pcos', label: 'PCOS' },
  { value: 'gout', label: 'โรคเก๊าท์' },
];

const allergyOptions = [
  { value: 'peanuts', label: 'ถั่วลิสง' },
  { value: 'seafood', label: 'อาหารทะเล' },
  { value: 'milk', label: 'นม' },
  { value: 'eggs', label: 'ไข่' },
  { value: 'gluten', label: 'กลูเตน' },
  { value: 'soy', label: 'ถั่วเหลือง' },
];

const religiousOptions = [
  { value: 'halal', label: 'ฮาลาล' },
  { value: 'vegetarian', label: 'มังสวิรัติ' },
  { value: 'vegan', label: 'วีแกน' },
  { value: 'jay', label: 'เจ' },
];

// Helper: calculate BMR (Mifflin-St Jeor)
function calcBMR(weight, height, age, gender) {
  const w = parseFloat(weight);
  const h = parseFloat(height);
  const a = parseFloat(age);
  if (!w || !h || !a || w <= 0 || h <= 0 || a <= 0) return 0;
  if (gender === 'male') return Math.round(10 * w + 6.25 * h - 5 * a + 5);
  if (gender === 'female') return Math.round(10 * w + 6.25 * h - 5 * a - 161);
  return Math.round(10 * w + 6.25 * h - 5 * a - 78); // average for 'other'
}

// Helper: calculate TDEE (Total Daily Energy Expenditure)
function calcTDEE(bmr, activityLevel) {
  const act = activityLevels.find(a => a.value === activityLevel);
  if (!bmr || !act) return 0;
  return Math.round(bmr * act.multiplier);
}

// Helper: calculate age from birthday string
function calcAge(birthday) {
  if (!birthday) return '';
  const birth = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : '';
}

export default function ProfileForm({ onSubmit }) {
  const [step, setStep] = useState(0);
  const [customAllergy, setCustomAllergy] = useState('');
  const [formData, setFormData] = useState({
    // Basic Info
    full_name: '',
    email: '',
    birthday: '',
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

    // --- Health Profile fields ---
    // Body metrics (extra)
    waist_cm: '',
    body_fat_pct: '',
    // Health goals (expanded)
    primary_goal: '',
    target_weight_kg: '',
    daily_calorie_target: '',
    // Chronic diseases
    chronic_diseases: [],
    // Allergies & restrictions
    food_allergies: [],
    religious_restrictions: [],
    medications_affecting_diet: '',
  });

  // Auto-calculate age from birthday
  const computedAge = useMemo(() => calcAge(formData.birthday), [formData.birthday]);

  // Keep age in sync with birthday
  useEffect(() => {
    if (computedAge !== '') {
      setFormData(prev => ({ ...prev, age: String(computedAge) }));
    }
  }, [computedAge]);

  // Auto-calculate BMI, BMR, TDEE
  const bmi = useMemo(() => {
    const h = parseFloat(formData.height_cm) / 100;
    const w = parseFloat(formData.weight_kg);
    if (h > 0 && w > 0) return parseFloat((w / (h * h)).toFixed(1));
    return 0;
  }, [formData.height_cm, formData.weight_kg]);

  const bmr = useMemo(() =>
    calcBMR(formData.weight_kg, formData.height_cm, formData.age, formData.gender),
    [formData.weight_kg, formData.height_cm, formData.age, formData.gender]
  );

  const tdee = useMemo(() =>
    calcTDEE(bmr, formData.activity_level),
    [bmr, formData.activity_level]
  );

  const toggleHealthGoal = (goal) => {
    setFormData(prev => ({
      ...prev,
      health_goals: prev.health_goals.includes(goal)
        ? prev.health_goals.filter(g => g !== goal)
        : [...prev.health_goals, goal]
    }));
  };

  const toggleArrayField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const addCustomAllergy = () => {
    const trimmed = customAllergy.trim();
    if (trimmed && !formData.food_allergies.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        food_allergies: [...prev.food_allergies, trimmed]
      }));
    }
    setCustomAllergy('');
  };

  const handleSubmit = () => {
    const goalText = formData.health_goals.join(', ');

    const finalData = {
      ...formData,
      bmi,
      bmr,
      age: computedAge !== '' ? computedAge : (formData.age ? parseInt(formData.age) : null),
      goal: goalText || 'healthy',
      // Serialize arrays as JSON strings for the DB
      chronic_diseases: JSON.stringify(formData.chronic_diseases),
      food_allergies: JSON.stringify(formData.food_allergies),
      religious_restrictions: JSON.stringify(formData.religious_restrictions),
      // Auto-fill calorie target if not set manually
      daily_calorie_target: formData.daily_calorie_target ? parseInt(formData.daily_calorie_target) : tdee,
      target_weight_kg: formData.target_weight_kg ? parseFloat(formData.target_weight_kg) : null,
      waist_cm: formData.waist_cm ? parseFloat(formData.waist_cm) : null,
      body_fat_pct: formData.body_fat_pct ? parseFloat(formData.body_fat_pct) : null,
    };

    onSubmit(finalData);
  };

  const canProceed = () => {
    if (step === 0) return formData.full_name.trim() !== '' && formData.birthday !== '' && computedAge !== '';
    if (step === 1) return computedAge !== '' && formData.gender !== '' && formData.height_cm !== '' && formData.weight_kg !== '';
    if (step === 2) return formData.activity_level !== '';
    if (step === 3) return formData.health_goals.length > 0;
    if (step === 8) return formData.region !== ''; // Region is now the last step
    // Steps 4-7 are all optional / have defaults or no strict validation needed to proceed
    return true;
  };

  // --- Stat Badge Component ---
  const StatBadge = ({ icon, label, value, unit, color = 'emerald' }) => (
    <div className={`flex items-center gap-3 p-3 rounded-2xl bg-${color}-50 border border-${color}-100`}>
      <div className={`w-10 h-10 rounded-xl bg-${color}-100 flex items-center justify-center`}>
        <Icon name={icon} className={`w-5 h-5 text-${color}-600`} />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className={`text-lg font-bold text-${color}-700`}>{value} <span className="text-sm font-normal">{unit}</span></p>
      </div>
    </div>
  );

  const steps = [
    // Step 0: Basic Info
    <motion.div key="basic" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <h2 className="text-2xl font-bold text-emerald-700">ข้อมูลพื้นฐานของคุณ</h2>
      <p className="text-slate-500 text-sm mt-2 leading-relaxed">ระบุชื่อและอีเมลให้ WongKhao ปรับค่าทางโภชนาการให้เหมาะกับความต้องการของคุณ</p>
      <div className="space-y-4 mt-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 px-1">ชื่อเล่น</label>
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
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 px-1">วันเกิด</label>
          <input
            type="date"
            value={formData.birthday}
            onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:bg-white focus:outline-none transition-colors text-slate-700 placeholder-slate-400"
          />
          {computedAge !== '' && (
            <p className="text-sm text-emerald-600 mt-2 px-1 font-medium">
              🎂 อายุ {computedAge} ปี
            </p>
          )}
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
        {computedAge !== '' && (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Icon name="cake" className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">อายุ (คำนวณจากวันเกิด)</p>
              <p className="text-lg font-bold text-emerald-700">{computedAge} <span className="text-sm font-normal">ปี</span></p>
            </div>
          </div>
        )}
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
        {/* BMI Display */}
        {bmi > 0 && (() => {
          let bmiColor, bmiLabel, bmiIcon;
          if (bmi < 18.5) { bmiColor = 'blue'; bmiLabel = 'น้ำหนักต่ำกว่าเกณฑ์'; bmiIcon = 'trending_down'; }
          else if (bmi < 25) { bmiColor = 'emerald'; bmiLabel = 'น้ำหนักปกติ'; bmiIcon = 'check_circle'; }
          else if (bmi < 30) { bmiColor = 'amber'; bmiLabel = 'น้ำหนักเกิน'; bmiIcon = 'warning'; }
          else { bmiColor = 'rose'; bmiLabel = 'อ้วน'; bmiIcon = 'error'; }
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-3 p-4 rounded-2xl bg-${bmiColor}-50 border border-${bmiColor}-100`}
            >
              <div className={`w-11 h-11 rounded-xl bg-${bmiColor}-100 flex items-center justify-center`}>
                <Icon name={bmiIcon} className={`w-6 h-6 text-${bmiColor}-600`} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">ค่าดัชนีมวลกาย (BMI)</p>
                <p className={`text-xl font-bold text-${bmiColor}-700`}>{bmi}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold bg-${bmiColor}-100 text-${bmiColor}-700`}>
                {bmiLabel}
              </span>
            </motion.div>
          );
        })()}
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

    // Step 3: Health Goals (Moved up)
    <motion.div key="goals" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <h2 className="text-2xl font-bold text-emerald-700">เป้าหมายสุขภาพ</h2>
      <p className="text-slate-500 text-sm mt-2 leading-relaxed">เลือกได้มากกว่า 1 ข้อ</p>

      {/* Scrollable container for the many goals */}
      <div className="space-y-3 mt-6 max-h-[45vh] overflow-y-auto pr-2 no-scrollbar">
        <div className="grid grid-cols-1 gap-3 pb-4">
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
                <div className={`w-12 h-12 rounded-xl ${goal.color} flex items-center justify-center shrink-0`}>
                  <Icon name={goal.icon} className="w-6 h-6" />
                </div>
                <span className={`font-bold text-lg text-left ${selected ? 'text-emerald-700' : 'text-slate-700'}`}>{goal.label}</span>
                {selected && <span className="ml-auto text-emerald-600 text-xl font-bold shrink-0">✓</span>}
              </button>
            );
          })}
        </div>
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



    // =====================================================
    // Step 7: เป้าหมายสุขภาพ (Primary Goal & Targets)
    // =====================================================
    <motion.div key="health-goal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <h2 className="text-2xl font-bold text-emerald-700">เป้าหมายหลักของคุณ</h2>
      <p className="text-slate-500 text-sm mt-2 leading-relaxed">เลือกเป้าหมายที่ต้องการมากที่สุด</p>

      <div className="space-y-3 mt-4">
        {primaryGoals.map(goal => {
          const selected = formData.primary_goal === goal.value;
          return (
            <button
              key={goal.value}
              onClick={() => setFormData(prev => ({ ...prev, primary_goal: goal.value }))}
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

      <div className="space-y-4 mt-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 px-1">เป้าหมายน้ำหนัก (กก.)</label>
          <input
            type="number"
            step="0.1"
            value={formData.target_weight_kg}
            onChange={(e) => setFormData({ ...formData, target_weight_kg: e.target.value })}
            placeholder="เช่น 65"
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:bg-white focus:outline-none text-slate-700 placeholder-slate-400"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 px-1">เป้าหมายแคลอรีต่อวัน</label>
          <input
            type="number"
            value={formData.daily_calorie_target}
            onChange={(e) => setFormData({ ...formData, daily_calorie_target: e.target.value })}
            placeholder={tdee ? `แนะนำ ${tdee} kcal` : 'คำนวณอัตโนมัติ'}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:bg-white focus:outline-none text-slate-700 placeholder-slate-400"
          />
          {tdee > 0 && (
            <p className="text-xs text-slate-400 mt-1 px-1">
              คำนวณจาก BMR × ระดับกิจกรรม = <span className="font-semibold text-emerald-600">{tdee} kcal/วัน</span> (ว่างไว้เพื่อใช้ค่านี้)
            </p>
          )}
        </div>
      </div>
    </motion.div>,

    // =====================================================
    // Step 8: โรคประจำตัว (Chronic Diseases)
    // =====================================================
    <motion.div key="diseases" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <h2 className="text-2xl font-bold text-emerald-700">โรคประจำตัว</h2>
      <p className="text-slate-500 text-sm mt-2 leading-relaxed">เลือกโรคประจำตัวที่มี เพื่อให้เราแนะนำอาหารที่เหมาะสม (ไม่บังคับ)</p>

      <div className="flex flex-wrap gap-2 mt-4">
        {chronicDiseaseOptions.map(d => {
          const selected = formData.chronic_diseases.includes(d.value);
          return (
            <button
              key={d.value}
              onClick={() => toggleArrayField('chronic_diseases', d.value)}
              className={`px-4 py-2.5 rounded-full border text-sm font-medium transition-all ${selected
                ? 'border-rose-400 bg-rose-50 text-rose-700 shadow-sm'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
            >
              {selected && <span className="mr-1">✓</span>}
              {d.label}
            </button>
          );
        })}
      </div>

      {formData.chronic_diseases.length > 0 && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-2xl">
          <p className="text-sm text-amber-700">
            <span className="font-bold">📋 เลือกแล้ว:</span> {formData.chronic_diseases.map(d => chronicDiseaseOptions.find(o => o.value === d)?.label).join(', ')}
          </p>
        </div>
      )}
    </motion.div>,

    // =====================================================
    // Step 9: อาหารที่แพ้/ข้อจำกัด (Allergies & Restrictions)
    // =====================================================
    <motion.div key="allergies" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
      <h2 className="text-2xl font-bold text-emerald-700">อาหารที่แพ้ / ข้อจำกัด</h2>
      <p className="text-slate-500 text-sm mt-2 leading-relaxed">ช่วยให้เราหลีกเลี่ยงเมนูที่ไม่เหมาะกับคุณ (ไม่บังคับ)</p>

      {/* Food allergies */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2 px-1">อาหารที่แพ้</label>
        <div className="flex flex-wrap gap-2">
          {allergyOptions.map(a => {
            const selected = formData.food_allergies.includes(a.value);
            return (
              <button
                key={a.value}
                onClick={() => toggleArrayField('food_allergies', a.value)}
                className={`px-4 py-2.5 rounded-full border text-sm font-medium transition-all ${selected
                  ? 'border-orange-400 bg-orange-50 text-orange-700 shadow-sm'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
              >
                {selected && <span className="mr-1">✓</span>}
                {a.label}
              </button>
            );
          })}
        </div>
        {/* Custom allergy input */}
        <div className="flex gap-2 mt-3">
          <input
            type="text"
            value={customAllergy}
            onChange={(e) => setCustomAllergy(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomAllergy()}
            placeholder="พิมพ์เพิ่มเติม..."
            className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:bg-white focus:outline-none text-sm text-slate-700 placeholder-slate-400"
          />
          <button
            onClick={addCustomAllergy}
            className="px-4 py-3 bg-emerald-100 text-emerald-700 rounded-2xl text-sm font-bold hover:bg-emerald-200 transition-colors"
          >
            เพิ่ม
          </button>
        </div>
        {/* Show custom allergies */}
        {formData.food_allergies.filter(a => !allergyOptions.find(o => o.value === a)).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.food_allergies.filter(a => !allergyOptions.find(o => o.value === a)).map(a => (
              <span key={a} className="px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 text-sm font-medium border border-orange-200 flex items-center gap-1">
                {a}
                <button onClick={() => toggleArrayField('food_allergies', a)} className="ml-1 text-orange-400 hover:text-orange-700">✕</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Religious restrictions */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2 px-1">ข้อจำกัดทางศาสนา / ไลฟ์สไตล์</label>
        <div className="flex flex-wrap gap-2">
          {religiousOptions.map(r => {
            const selected = formData.religious_restrictions.includes(r.value);
            return (
              <button
                key={r.value}
                onClick={() => toggleArrayField('religious_restrictions', r.value)}
                className={`px-4 py-2.5 rounded-full border text-sm font-medium transition-all ${selected
                  ? 'border-purple-400 bg-purple-50 text-purple-700 shadow-sm'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
              >
                {selected && <span className="mr-1">✓</span>}
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Medications */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2 px-1">ยาที่ใช้อยู่ที่กระทบการกิน</label>
        <input
          type="text"
          value={formData.medications_affecting_diet}
          onChange={(e) => setFormData({ ...formData, medications_affecting_diet: e.target.value })}
          placeholder="เช่น Warfarin (ห้ามกินผักสีเขียวเยอะ)"
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:bg-white focus:outline-none text-slate-700 placeholder-slate-400 text-sm"
        />
      </div>
    </motion.div>,

    // Step 9: Region (Moved to end)
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
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">

      <div className="flex-1 px-4 py-6 flex flex-col items-center">
        {/* White Card Container */}
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 w-full max-w-sm p-6 relative">

          {/* Progress Bar */}
          <div className="flex gap-1 mb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? 'bg-emerald-500' : 'bg-slate-100'}`}
              />
            ))}
          </div>

          {/* Step label */}
          <p className="text-xs text-slate-400 text-right mb-2">{step + 1} / {steps.length}</p>

          {/* Current Step Content */}
          <div className="min-h-[320px] max-h-[55vh] overflow-y-auto pr-1">
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