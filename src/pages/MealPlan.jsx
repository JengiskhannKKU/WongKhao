import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/Icon';

// Mockup Data
const MENUS = {
  khao_pad: {
    name: 'ข้าวผัด',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
    sodium: 600, cal: 350, sugar: 3, fat: 12, protein: 10, carbs: 48,
    recipe: ['ข้าวสวย', 'ไข่ไก่ 2 ฟอง', 'กระเทียม', 'น้ำมันพืช', 'ซีอิ๊วขาว', 'ต้นหอม'],
    steps: ['ตั้งกระทะใส่น้ำมัน เจียวกระเทียมจนหอม', 'ใส่ข้าวสวยลงผัดให้เม็ดข้าวแตก', 'ตอกไข่ลงผัดรวม ปรุงรสด้วยซีอิ๊วขาว', 'ตักใส่จาน โรยต้นหอม'],
  },
  som_tam: {
    name: 'ส้มตำ',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
    sodium: 800, cal: 120, sugar: 8, fat: 2, protein: 4, carbs: 20,
    recipe: ['มะละกอดิบ', 'มะเขือเทศ', 'ถั่วฝักยาว', 'กุ้งแห้ง', 'น้ำปลา', 'น้ำตาลปี๊บ', 'มะนาว', 'พริก'],
    steps: ['โขลกพริกและกระเทียมพอแตก', 'ใส่มะละกอ ถั่วฝักยาว ตำเบาๆ', 'ปรุงรสด้วยน้ำปลา น้ำตาล มะนาว', 'ใส่มะเขือเทศ กุ้งแห้ง คลุกเคล้าให้เข้ากัน'],
  },
  pla_tod: {
    name: 'ปลาทอด',
    image: 'https://images.unsplash.com/photo-1519984388953-d2406bc725e1?w=800&q=80',
    sodium: 450, cal: 220, sugar: 1, fat: 12, protein: 24, carbs: 4,
    recipe: ['ปลา', 'กระเทียม', 'น้ำมัน', 'ซีอิ๊วขาว', 'พริกไทยป่น'],
    steps: ['หมักปลาด้วยซีอิ๊ว พริกไทย กระเทียม 15 นาที', 'ตั้งกระทะใส่น้ำมันให้ร้อน', 'ทอดปลาไฟกลางจนเหลืองกรอบทั้งสองด้าน', 'ตักขึ้น พักให้สะเด็ดน้ำมัน'],
  },
  tom_yum: {
    name: 'ต้มยำกุ้ง',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80',
    sodium: 1200, cal: 180, sugar: 5, fat: 6, protein: 18, carbs: 12,
    recipe: ['กุ้ง', 'ตะไคร้', 'ใบมะกรูด', 'ข่า', 'เห็ด', 'น้ำปลา', 'มะนาว', 'พริก', 'น้ำพริกเผา'],
    steps: ['ต้มน้ำให้เดือด ใส่ตะไคร้ ข่า ใบมะกรูด', 'ใส่กุ้งและเห็ด ต้มจนสุก', 'ปรุงรสด้วยน้ำพริกเผา น้ำปลา มะนาว', 'ใส่พริก ชิมรสให้เปรี้ยว เค็ม เผ็ด'],
  },
  kaeng_khiao: {
    name: 'แกงเขียวหวาน',
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80',
    sodium: 950, cal: 280, sugar: 6, fat: 18, protein: 20, carbs: 14,
    recipe: ['ไก่', 'น้ำพริกแกงเขียวหวาน', 'กะทิ', 'มะเขือ', 'ใบโหระพา', 'น้ำปลา'],
    steps: ['ผัดน้ำพริกแกงกับกะทิจนหอม', 'ใส่ไก่ผัดจนสุก', 'เติมกะทิและน้ำ ใส่มะเขือต้มจนนุ่ม', 'ปรุงรสด้วยน้ำปลา น้ำตาล โรยใบโหระพา'],
  },
};

const MEAL_SLOTS = [
  { key: 'breakfast', label: 'มื้อเช้า',    icon: 'wb_sunny',    bg: 'bg-amber-100',   text: 'text-amber-700',   border: 'border-l-amber-400',   overlay: 'bg-amber-400'   },
  { key: 'lunch',     label: 'มื้อกลางวัน', icon: 'light_mode',  bg: 'bg-sky-100',     text: 'text-sky-700',     border: 'border-l-sky-400',     overlay: 'bg-sky-400'     },
  { key: 'dinner',    label: 'มื้อเย็น',    icon: 'nights_stay', bg: 'bg-violet-100',  text: 'text-violet-700',  border: 'border-l-violet-400',  overlay: 'bg-violet-400'  },
];

const WEEK_DAYS = [
  { day: 'จ.',  label: 'จันทร์',    breakfast: MENUS.khao_pad,    lunch: MENUS.som_tam,     dinner: MENUS.pla_tod     },
  { day: 'อ.',  label: 'อังคาร',   breakfast: MENUS.tom_yum,     lunch: MENUS.kaeng_khiao, dinner: MENUS.som_tam     },
  { day: 'พ.',  label: 'พุธ',      breakfast: MENUS.khao_pad,    lunch: MENUS.pla_tod,     dinner: MENUS.tom_yum     },
  { day: 'พฤ.', label: 'พฤหัสบดี', breakfast: MENUS.som_tam,     lunch: MENUS.khao_pad,    dinner: MENUS.kaeng_khiao },
  { day: 'ศ.',  label: 'ศุกร์',    breakfast: MENUS.pla_tod,     lunch: MENUS.tom_yum,     dinner: MENUS.khao_pad    },
  { day: 'ส.',  label: 'เสาร์',    breakfast: MENUS.kaeng_khiao, lunch: MENUS.som_tam,     dinner: MENUS.pla_tod     },
  { day: 'อา.', label: 'อาทิตย์',  breakfast: MENUS.tom_yum,     lunch: MENUS.khao_pad,    dinner: MENUS.som_tam     },
];


function sumDay(d, key) {
  return d.breakfast[key] + d.lunch[key] + d.dinner[key];
}

function sodiumLevel(mg) {
  if (mg >= 4000) return { label: 'สูง',  color: 'text-red-500'    };
  if (mg >= 2500) return { label: 'กลาง', color: 'text-amber-500'  };
  return                 { label: 'ต่ำ',  color: 'text-emerald-600'};
}


// 0=Mon…6=Sun (getDay: 0=Sun,1=Mon…6=Sat)
const todayWeekIndex = (new Date().getDay() + 6) % 7;
const DAY_PLAN = WEEK_DAYS[todayWeekIndex];

const todayTotals = {
  sodium:  sumDay(DAY_PLAN, 'sodium'),
  cal:     sumDay(DAY_PLAN, 'cal'),
  sugar:   sumDay(DAY_PLAN, 'sugar'),
  fat:     sumDay(DAY_PLAN, 'fat'),
  protein: sumDay(DAY_PLAN, 'protein'),
  carbs:   sumDay(DAY_PLAN, 'carbs'),
};

const dateLabel = new Date().toLocaleDateString('th-TH', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
});


const NUTRIENTS = [
  { key: 'cal',     label: 'แคลอรี่',       unit: 'kcal', bg: 'bg-orange-50',  text: 'text-orange-600' },
  { key: 'protein', label: 'โปรตีน',        unit: 'g',    bg: 'bg-blue-50',    text: 'text-blue-600'   },
  { key: 'carbs',   label: 'คาร์บ',         unit: 'g',    bg: 'bg-purple-50',  text: 'text-purple-600' },
  { key: 'fat',     label: 'ไขมัน',         unit: 'g',    bg: 'bg-yellow-50',  text: 'text-yellow-600' },
  { key: 'sugar',   label: 'น้ำตาล',        unit: 'g',    bg: 'bg-pink-50',    text: 'text-pink-600'   },
  { key: 'sodium',  label: 'โซเดียม',       unit: 'mg',   bg: 'bg-red-50',     text: 'text-red-600'    },
];


function NutritionPills({ data }) {
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {NUTRIENTS.map(n => (
        <span key={n.key} className={`text-[15px] font-medium px-2 py-0.5 rounded-full ${n.bg} ${n.text}`}>
          {n.label} {data[n.key]}{n.unit}
        </span>
      ))}
    </div>
  );
}


function SummaryStrip({ totals }) {
  return (
    <div className="flex flex-wrap gap-1 mt-3">
      {NUTRIENTS.map(n => (
        <span key={n.key} className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/15 text-white">
          {n.label} {totals[n.key]}{n.unit}
        </span>
      ))}
    </div>
  );
}


// ── Menu Detail Modal ─────────────────────────────────────────
function MenuModal({ slot, menu, onClose }) {
  return (
    <AnimatePresence>
      {menu && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-w-sm mx-auto bg-white rounded-t-3xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Image */}
            <div className="relative h-52 bg-slate-100 flex-shrink-0">
              <img
                src={menu.image}
                alt={menu.name}
                className="w-full h-full object-cover"
                onError={e => { e.currentTarget.style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              {/* Slot badge */}
              <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <Icon name={slot.icon} className="w-4 h-4 text-white" />
                <span className="text-sm font-medium text-white">{slot.label}</span>
              </div>
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
              >
                <Icon name="close" className="w-5 h-5 text-white" />
              </button>
              {/* Name on image */}
              <div className="absolute bottom-4 left-4">
                <p className="text-2xl font-bold text-white">{menu.name}</p>
                <p className="text-sm text-white/70">{menu.cal} kcal</p>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 p-5 space-y-5">
              {/* Nutrition */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">โภชนาการ</p>
                <NutritionPills data={menu} />
              </div>

              {/* Ingredients */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">วัตถุดิบ</p>
                <div className="flex flex-wrap gap-2">
                  {menu.recipe.map(item => (
                    <span key={item} className="text-sm px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Steps */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">วิธีทำ</p>
                <ol className="space-y-2.5">
                  {menu.steps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-600">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Safe area spacer */}
              <div className="h-4" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Day Meal Card ──────────────────────────────────────────────
function DayMealCard({ slot, menu, index, onOpen }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      onClick={onOpen}
      className="w-full text-left bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden active:scale-[0.98] transition-transform"
    >
      {/* Image with color filter */}
      <div className="relative h-44 bg-slate-100">
        <img
          src={menu.image}
          alt={menu.name}
          className="w-full h-full object-cover"
          onError={e => { e.currentTarget.style.display = 'none'; }}
        />
        <div className={`absolute inset-0 ${slot.overlay} opacity-20`} />
      </div>
      {/* Info: name left, slot badge right */}
      <div className={`flex items-center justify-between px-4 py-3 border-l-4 ${slot.border}`}>
        <div className="flex-1 min-w-0 mr-3">
          <p className="text-xl font-bold text-slate-800 truncate">{menu.name}</p>
          <p className="text-sm text-slate-400">{menu.cal} kcal</p>
        </div>
        <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 ${slot.bg} ${slot.text}`}>
          <Icon name={slot.icon} className="w-3.5 h-3.5" />
          {slot.label}
        </span>
      </div>
    </motion.button>
  );
}

// ── Week Meal Row ──────────────────────────────────────────────
function WeekMealRow({ slot, menu, onOpen }) {
  return (
    <button
      onClick={onOpen}
      className={`w-full flex items-center gap-3 bg-white rounded-2xl p-3 border-l-4 ${slot.border} shadow-sm active:scale-[0.98] transition-transform`}
    >
      <img
        src={menu.image}
        alt={menu.name}
        className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-slate-200"
        onError={e => { e.currentTarget.style.display = 'none'; }}
      />
      <div className="flex-1 text-left min-w-0">
        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full mb-1 ${slot.bg} ${slot.text}`}>
          <Icon name={slot.icon} className="w-3 h-3" />
          {slot.label}
        </span>
        <p className="text-sm font-bold text-slate-800 truncate">{menu.name}</p>
        <p className="text-xs text-slate-400 mt-0.5">{menu.cal} kcal · {menu.sodium} mg โซเดียม</p>
      </div>
      <Icon name="chevron_right" className="w-5 h-5 text-slate-300 flex-shrink-0" />
    </button>
  );
}

function WeekDayCard({ data, index, isToday, onOpen }) {
  const [open, setOpen] = useState(isToday);
  const totals = {
    sodium:  sumDay(data, 'sodium'),
    cal:     sumDay(data, 'cal'),
    sugar:   sumDay(data, 'sugar'),
    fat:     sumDay(data, 'fat'),
    protein: sumDay(data, 'protein'),
    carbs:   sumDay(data, 'carbs'),
  };
  const lvl = sodiumLevel(totals.sodium);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`bg-white rounded-3xl border shadow-sm overflow-hidden ${isToday ? 'border-[#1B4332]/30' : 'border-slate-100'}`}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${isToday ? 'bg-[#1B4332] text-white' : 'bg-slate-100 text-slate-600'}`}>
            {data.day}
          </div>
          <div className="text-left">
            <p className={`text-base font-bold ${isToday ? 'text-[#1B4332]' : 'text-slate-800'}`}>
              {data.label}
              {isToday && <span className="ml-1.5 text-sm font-normal text-emerald-500">(วันนี้)</span>}
            </p>
            <p className="text-sm text-slate-400">
              {totals.cal} kcal ·{' '}
              <span className={`font-semibold ${lvl.color}`}>{totals.sodium} mg โซเดียม ({lvl.label})</span>
            </p>
          </div>
        </div>
        <Icon
          name={open ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
          className="w-5 h-5 text-slate-400 flex-shrink-0"
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-slate-50 space-y-3 pt-3">
              {MEAL_SLOTS.map(slot => (
                <WeekMealRow key={slot.key} slot={slot} menu={data[slot.key]} onOpen={() => onOpen(slot, data[slot.key])} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Main Page
export default function MealPlan() {
  const [view, setView] = useState('day');
  const [selected, setSelected] = useState({ slot: null, menu: null });
  const openModal  = (slot, menu) => setSelected({ slot, menu });
  const closeModal = () => setSelected({ slot: null, menu: null });

  return (
    <div className="min-h-screen">
      <MenuModal slot={selected.slot} menu={selected.menu} onClose={closeModal} />
      <div className="max-w-sm mx-auto px-4 pt-6 pb-28 space-y-4">

        <div>
          <h1 className="text-3xl font-bold text-slate-800">แผนอาหาร</h1>
          <p className="text-base text-slate-400 mt-0.5">{dateLabel}</p>
        </div>

        <div className="flex bg-slate-100 rounded-2xl p-1 gap-1">
          {[
            { key: 'day',  label: '1 วัน',    icon: 'today'          },
            { key: 'week', label: '1 สัปดาห์', icon: 'calendar_month' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setView(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-base font-semibold transition-all ${
                view === tab.key
                  ? 'bg-[#1B4332] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon name={tab.icon} className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {view === 'day' && (
            <motion.div
              key="day"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              className="space-y-4"
            >
              <div className="bg-[#1B4332] rounded-3xl p-5 text-white">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <p className="text-sm text-emerald-300 font-medium">สรุปโภชนาการวันนี้</p>
                    <p className="text-3xl font-bold mt-0.5">3 มื้อ</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-800/50 rounded-2xl flex items-center justify-center">
                    <Icon name="restaurant_menu" className="w-7 h-7 text-emerald-300" />
                  </div>
                </div>
                <SummaryStrip totals={todayTotals} />
              </div>

              {MEAL_SLOTS.map((slot, i) => (
                <DayMealCard key={slot.key} slot={slot} menu={DAY_PLAN[slot.key]} index={i} onOpen={() => openModal(slot, DAY_PLAN[slot.key])} />
              ))}
            </motion.div>
          )}

          {view === 'week' && (
            <motion.div
              key="week"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              className="space-y-3"
            >
              <div className="bg-[#1B4332] rounded-3xl p-5 text-white">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <p className="text-sm text-emerald-300 font-medium">สรุปโภชนาการ 7 วัน</p>
                    <p className="text-3xl font-bold mt-0.5">21 มื้อ</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-800/50 rounded-2xl flex items-center justify-center">
                    <Icon name="calendar_month" className="w-7 h-7 text-emerald-300" />
                  </div>
                </div>
                <SummaryStrip totals={{
                  sodium:  WEEK_DAYS.reduce((s, d) => s + sumDay(d, 'sodium'),  0),
                  cal:     WEEK_DAYS.reduce((s, d) => s + sumDay(d, 'cal'),     0),
                  sugar:   WEEK_DAYS.reduce((s, d) => s + sumDay(d, 'sugar'),   0),
                  fat:     WEEK_DAYS.reduce((s, d) => s + sumDay(d, 'fat'),     0),
                  protein: WEEK_DAYS.reduce((s, d) => s + sumDay(d, 'protein'), 0),
                  carbs:   WEEK_DAYS.reduce((s, d) => s + sumDay(d, 'carbs'),   0),
                }} />
              </div>

              {WEEK_DAYS.map((data, i) => (
                <WeekDayCard key={data.day} data={data} index={i} isToday={i === todayWeekIndex} onOpen={openModal} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
