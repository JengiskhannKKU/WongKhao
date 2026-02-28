import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/Icon';

// ── Mockup Data ───────────────────────────────────────────────
const MENUS = {
  khao_pad:    { name: 'ข้าวผัด',       sodium: 600,  cal: 350, sugar: 3,  fat: 12, protein: 10, carbs: 48 },
  som_tam:     { name: 'ส้มตำ',         sodium: 800,  cal: 120, sugar: 8,  fat: 2,  protein: 4,  carbs: 20 },
  pla_tod:     { name: 'ปลาทอด',        sodium: 450,  cal: 220, sugar: 1,  fat: 12, protein: 24, carbs: 4  },
  tom_yum:     { name: 'ต้มยำกุ้ง',     sodium: 1200, cal: 180, sugar: 5,  fat: 6,  protein: 18, carbs: 12 },
  kaeng_khiao: { name: 'แกงเขียวหวาน',  sodium: 950,  cal: 280, sugar: 6,  fat: 18, protein: 20, carbs: 14 },
};

const MEAL_SLOTS = [
  { key: 'breakfast', label: 'มื้อเช้า',    icon: 'wb_sunny'    },
  { key: 'lunch',     label: 'มื้อกลางวัน', icon: 'light_mode'  },
  { key: 'dinner',    label: 'มื้อเย็น',    icon: 'nights_stay' },
];

const DAY_PLAN = {
  breakfast: MENUS.khao_pad,
  lunch:     MENUS.som_tam,
  dinner:    MENUS.pla_tod,
};

const WEEK_DAYS = [
  { day: 'จ.',  label: 'จันทร์',    breakfast: MENUS.khao_pad,    lunch: MENUS.som_tam,     dinner: MENUS.pla_tod     },
  { day: 'อ.',  label: 'อังคาร',   breakfast: MENUS.tom_yum,     lunch: MENUS.kaeng_khiao, dinner: MENUS.som_tam     },
  { day: 'พ.',  label: 'พุธ',      breakfast: MENUS.khao_pad,    lunch: MENUS.pla_tod,     dinner: MENUS.tom_yum     },
  { day: 'พฤ.', label: 'พฤหัสบดี', breakfast: MENUS.som_tam,     lunch: MENUS.khao_pad,    dinner: MENUS.kaeng_khiao },
  { day: 'ศ.',  label: 'ศุกร์',    breakfast: MENUS.pla_tod,     lunch: MENUS.tom_yum,     dinner: MENUS.khao_pad    },
  { day: 'ส.',  label: 'เสาร์',    breakfast: MENUS.kaeng_khiao, lunch: MENUS.som_tam,     dinner: MENUS.pla_tod     },
  { day: 'อา.', label: 'อาทิตย์',  breakfast: MENUS.tom_yum,     lunch: MENUS.khao_pad,    dinner: MENUS.som_tam     },
];

// ── Helpers ───────────────────────────────────────────────────
function sumDay(d, key) {
  return d.breakfast[key] + d.lunch[key] + d.dinner[key];
}

function sodiumLevel(mg) {
  if (mg >= 900) return { label: 'สูง',  color: 'text-red-500'    };
  if (mg >= 500) return { label: 'กลาง', color: 'text-amber-500'  };
  return                 { label: 'ต่ำ',  color: 'text-emerald-600'};
}

// Daily totals for summary
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

// ── Nutrition Grid ────────────────────────────────────────────
const NUTRIENTS = [
  { key: 'cal',     label: 'แคลอรี่',    unit: 'kcal', icon: 'local_fire_department', bg: 'bg-orange-50',  text: 'text-orange-600' },
  { key: 'sugar',   label: 'น้ำตาล',     unit: 'g',    icon: 'water_drop',             bg: 'bg-pink-50',    text: 'text-pink-600'   },
  { key: 'fat',     label: 'ไขมัน',      unit: 'g',    icon: 'opacity',                bg: 'bg-yellow-50',  text: 'text-yellow-600' },
  { key: 'protein', label: 'โปรตีน',     unit: 'g',    icon: 'fitness_center',         bg: 'bg-blue-50',    text: 'text-blue-600'   },
  { key: 'carbs',   label: 'คาร์โบไฮเดรต', unit: 'g',  icon: 'grain',                  bg: 'bg-purple-50',  text: 'text-purple-600' },
  { key: 'sodium',  label: 'โซเดียม',    unit: 'mg',   icon: 'science',                bg: 'bg-red-50',     text: 'text-red-600'    },
];

function NutritionGrid({ data, compact = false }) {
  if (compact) {
    // Compact pill row for week view
    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {NUTRIENTS.map(n => (
          <span key={n.key} className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${n.bg} ${n.text}`}>
            {n.label} {data[n.key]}{n.unit}
          </span>
        ))}
      </div>
    );
  }

  // Full 2-column grid for day view meal cards
  return (
    <div className="grid grid-cols-3 gap-2 mt-3">
      {NUTRIENTS.map(n => (
        <div key={n.key} className={`rounded-2xl p-2.5 ${n.bg} flex flex-col items-center`}>
          <Icon name={n.icon} className={`w-4 h-4 ${n.text} mb-0.5`} />
          <p className={`text-sm font-bold ${n.text}`}>{data[n.key]}</p>
          <p className="text-xs text-slate-400">{n.unit}</p>
          <p className={`text-xs font-medium ${n.text} mt-0.5`}>{n.label}</p>
        </div>
      ))}
    </div>
  );
}

// ── Summary Nutrition Strips ──────────────────────────────────
function SummaryStrip({ totals }) {
  return (
    <div className="grid grid-cols-3 gap-2 mt-3">
      {NUTRIENTS.map(n => (
        <div key={n.key} className="bg-white/10 rounded-2xl p-2.5 flex flex-col items-center">
          <Icon name={n.icon} className="w-4 h-4 text-white/70 mb-0.5" />
          <p className="text-sm font-bold text-white">{totals[n.key]}</p>
          <p className="text-xs text-emerald-200">{n.unit}</p>
          <p className="text-xs text-emerald-300 mt-0.5">{n.label}</p>
        </div>
      ))}
    </div>
  );
}

// ── Week Day Card ─────────────────────────────────────────────
function WeekDayCard({ data, index, isToday }) {
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
            <p className={`text-sm font-bold ${isToday ? 'text-[#1B4332]' : 'text-slate-800'}`}>
              {data.label}
              {isToday && <span className="ml-1.5 text-xs font-normal text-emerald-500">(วันนี้)</span>}
            </p>
            <p className="text-xs text-slate-400">
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
              {/* Nutrition summary for the day */}
              <NutritionGrid data={totals} compact />

              {/* Each meal row */}
              {MEAL_SLOTS.map(slot => {
                const menu = data[slot.key];
                return (
                  <div key={slot.key} className="bg-slate-50 rounded-2xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                        <Icon name={slot.icon} className="w-4 h-4 text-[#1B4332]" />
                      </div>
                      <p className="text-xs text-slate-400">{slot.label}</p>
                    </div>
                    <p className="text-sm font-bold text-slate-800 ml-9">{menu.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5 ml-9">
                      {NUTRIENTS.map(n => (
                        <span key={n.key} className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${n.bg} ${n.text}`}>
                          {menu[n.key]}{n.unit}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function MealPlan() {
  const [view, setView] = useState('day');

  return (
    <div className="min-h-screen">
      <div className="max-w-sm mx-auto px-4 pt-6 pb-28 space-y-4">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">แผนอาหาร</h1>
          <p className="text-sm text-slate-400 mt-0.5">{dateLabel}</p>
        </div>

        {/* Toggle */}
        <div className="flex bg-slate-100 rounded-2xl p-1 gap-1">
          {[
            { key: 'day',  label: '1 วัน',    icon: 'today'          },
            { key: 'week', label: '1 สัปดาห์', icon: 'calendar_month' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setView(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all ${
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

        {/* ── 1-DAY VIEW ── */}
        <AnimatePresence mode="wait">
          {view === 'day' && (
            <motion.div
              key="day"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              className="space-y-4"
            >
              {/* Daily summary card */}
              <div className="bg-[#1B4332] rounded-3xl p-5 text-white">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <p className="text-xs text-emerald-300 font-medium">สรุปโภชนาการวันนี้</p>
                    <p className="text-2xl font-bold mt-0.5">3 มื้อ</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-800/50 rounded-2xl flex items-center justify-center">
                    <Icon name="restaurant_menu" className="w-7 h-7 text-emerald-300" />
                  </div>
                </div>
                <SummaryStrip totals={todayTotals} />
              </div>

              {/* Meal cards */}
              {MEAL_SLOTS.map((slot, i) => {
                const menu = DAY_PLAN[slot.key];
                return (
                  <motion.div
                    key={slot.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm"
                  >
                    <div className="flex items-center gap-2.5 mb-1">
                      <div className="w-9 h-9 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <Icon name={slot.icon} className="w-5 h-5 text-[#1B4332]" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">{slot.label}</p>
                        <p className="font-bold text-slate-800">{menu.name}</p>
                      </div>
                    </div>
                    <NutritionGrid data={menu} />
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* ── 1-WEEK VIEW ── */}
          {view === 'week' && (
            <motion.div
              key="week"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              className="space-y-3"
            >
              {/* Weekly summary */}
              <div className="bg-[#1B4332] rounded-3xl p-5 text-white">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <p className="text-xs text-emerald-300 font-medium">สรุปโภชนาการ 7 วัน</p>
                    <p className="text-2xl font-bold mt-0.5">21 มื้อ</p>
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

              {/* Day accordion cards */}
              {WEEK_DAYS.map((data, i) => (
                <WeekDayCard key={data.day} data={data} index={i} isToday={i === 0} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
