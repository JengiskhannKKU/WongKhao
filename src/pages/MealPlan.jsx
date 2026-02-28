import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/Icon';

//Mockup Data
const MENUS = {
  khao_pad: {
    name: 'ข้าวผัด',
    sodium: 600, cal: 350, sugar: 3, fat: 12, protein: 10, carbs: 48,
    recipe: ['ข้าวสวย', 'ไข่ไก่ 2 ฟอง', 'กระเทียม', 'น้ำมันพืช', 'ซีอิ๊วขาว', 'ต้นหอม'],
    steps: ['ตั้งกระทะใส่น้ำมัน เจียวกระเทียมจนหอม', 'ใส่ข้าวสวยลงผัดให้เม็ดข้าวแตก', 'ตอกไข่ลงผัดรวม ปรุงรสด้วยซีอิ๊วขาว', 'ตักใส่จาน โรยต้นหอม'],
  },
  som_tam: {
    name: 'ส้มตำ',
    sodium: 800, cal: 120, sugar: 8, fat: 2, protein: 4, carbs: 20,
    recipe: ['มะละกอดิบ', 'มะเขือเทศ', 'ถั่วฝักยาว', 'กุ้งแห้ง', 'น้ำปลา', 'น้ำตาลปี๊บ', 'มะนาว', 'พริก'],
    steps: ['โขลกพริกและกระเทียมพอแตก', 'ใส่มะละกอ ถั่วฝักยาว ตำเบาๆ', 'ปรุงรสด้วยน้ำปลา น้ำตาล มะนาว', 'ใส่มะเขือเทศ กุ้งแห้ง คลุกเคล้าให้เข้ากัน'],
  },
  pla_tod: {
    name: 'ปลาทอด',
    sodium: 450, cal: 220, sugar: 1, fat: 12, protein: 24, carbs: 4,
    recipe: ['ปลา', 'กระเทียม', 'น้ำมัน', 'ซีอิ๊วขาว', 'พริกไทยป่น'],
    steps: ['หมักปลาด้วยซีอิ๊ว พริกไทย กระเทียม 15 นาที', 'ตั้งกระทะใส่น้ำมันให้ร้อน', 'ทอดปลาไฟกลางจนเหลืองกรอบทั้งสองด้าน', 'ตักขึ้น พักให้สะเด็ดน้ำมัน'],
  },
  tom_yum: {
    name: 'ต้มยำกุ้ง',
    sodium: 1200, cal: 180, sugar: 5, fat: 6, protein: 18, carbs: 12,
    recipe: ['กุ้ง', 'ตะไคร้', 'ใบมะกรูด', 'ข่า', 'เห็ด', 'น้ำปลา', 'มะนาว', 'พริก', 'น้ำพริกเผา'],
    steps: ['ต้มน้ำให้เดือด ใส่ตะไคร้ ข่า ใบมะกรูด', 'ใส่กุ้งและเห็ด ต้มจนสุก', 'ปรุงรสด้วยน้ำพริกเผา น้ำปลา มะนาว', 'ใส่พริก ชิมรสให้เปรี้ยว เค็ม เผ็ด'],
  },
  kaeng_khiao: {
    name: 'แกงเขียวหวาน',
    sodium: 950, cal: 280, sugar: 6, fat: 18, protein: 20, carbs: 14,
    recipe: ['ไก่', 'น้ำพริกแกงเขียวหวาน', 'กะทิ', 'มะเขือ', 'ใบโหระพา', 'น้ำปลา'],
    steps: ['ผัดน้ำพริกแกงกับกะทิจนหอม', 'ใส่ไก่ผัดจนสุก', 'เติมกะทิและน้ำ ใส่มะเขือต้มจนนุ่ม', 'ปรุงรสด้วยน้ำปลา น้ำตาล โรยใบโหระพา'],
  },
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


function sumDay(d, key) {
  return d.breakfast[key] + d.lunch[key] + d.dinner[key];
}

function sodiumLevel(mg) {
  if (mg >= 900) return { label: 'สูง',  color: 'text-red-500'    };
  if (mg >= 500) return { label: 'กลาง', color: 'text-amber-500'  };
  return                 { label: 'ต่ำ',  color: 'text-emerald-600'};
}


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


function RecipeSteps({ recipe, steps }) {
  return (
    <div className="mt-2.5 space-y-2">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">วัตถุดิบ</p>
        <div className="flex flex-wrap gap-1.5">
          {recipe.map(item => (
            <span key={item} className="text-[15px] px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
              {item}
            </span>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">วิธีทำ</p>
        <ol className="space-y-1.5">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-600">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[20px] font-bold mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function DayMealCard({ slot, menu, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
          <Icon name={slot.icon} className="w-5 h-5 text-[#1B4332]" />
        </div>
        <div>
          <p className="text-sm text-slate-400">{slot.label}</p>
          <p className="text-lg font-bold text-slate-800">{menu.name}</p>
        </div>
      </div>
      <NutritionPills data={menu} />
      <RecipeSteps recipe={menu.recipe} steps={menu.steps} />
    </motion.div>
  );
}

function WeekMealRow({ slot, menu }) {
  return (
    <div className="bg-slate-50 rounded-2xl p-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
          <Icon name={slot.icon} className="w-4 h-4 text-[#1B4332]" />
        </div>
        <p className="text-sm text-slate-400">{slot.label}</p>
      </div>
      <p className="text-base font-bold text-slate-800 ml-9">{menu.name}</p>
      <div className="ml-9">
        <NutritionPills data={menu} />
        <RecipeSteps recipe={menu.recipe} steps={menu.steps} />
      </div>
    </div>
  );
}

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
                <WeekMealRow key={slot.key} slot={slot} menu={data[slot.key]} />
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

  return (
    <div className="min-h-screen">
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
                <DayMealCard key={slot.key} slot={slot} menu={DAY_PLAN[slot.key]} index={i} />
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
                <WeekDayCard key={data.day} data={data} index={i} isToday={i === 0} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
