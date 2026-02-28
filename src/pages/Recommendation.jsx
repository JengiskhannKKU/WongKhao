import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { localStore } from '@/api/apiStore';
import { createPageUrl } from '@/utils';
import Icon from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { adjustRecipeByAI } from '@/lib/openai';
import { trackAdjustmentEvent, trackMealLogEvent } from '@/api/behaviorAnalytics';

// Sample menu for demo
const sampleMenu = {
  id: '2',
  name_th: 'ส้มตำปลาร้า',
  name_en: 'Som Tam Pla Ra',
  region: 'northeast',
  image_url: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800&q=80',
  spice_level: 5,
  health_score: 68,
  sodium_level: 'high',
  calories: 280,
  protein: 12,
  carbs: 35,
  fat: 8
};

const healthyAlternative = {
  id: 'alt_1',
  name_th: 'สลัดอกไก่ย่างน้ำสลัดงาใส',
  name_en: 'Grilled Chicken Salad',
  region: 'central',
  image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
  spice_level: 1,
  health_score: 95,
  sodium_level: 'low',
  calories: 250,
  protein: 35,
  carbs: 15,
  fat: 5
};

// Quick prompt suggestions
const quickPrompts = [
  { label: '🧂 ลดเค็ม', prompt: 'ลดโซเดียมลงให้มากที่สุด แต่ยังคงรสชาติ' },
  { label: '💪 เพิ่มโปรตีน', prompt: 'เพิ่มโปรตีนให้เหมาะกับคนออกกำลังกาย' },
  { label: '🌿 คลีน', prompt: 'ทำให้เป็นสูตรคลีน ไม่ใส่ผงชูรส ไม่ใส่น้ำตาล' },
  { label: '👶 เด็กกินได้', prompt: 'ปรับสูตรให้เด็กกินได้ ลดเผ็ด ลดเค็ม' },
];

export default function Recommendation() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('cook'); // 'cook' | 'order'
  const [menu, setMenu] = useState(sampleMenu);
  const [loading, setLoading] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [impacts, setImpacts] = useState({
    sodium: -22,
    sugar: -15,
    calories: -10,
    bp_risk: -6
  });
  const [modifications, setModifications] = useState([
    'ลดน้ำปลาจาก 2 ช้อน → 1 ช้อน',
    'ใช้น้ำปลาลดโซเดียม',
    'เพิ่มมะเขือเทศเพื่อเพิ่มโพแทสเซียม',
    'ลดผงชูรส 100%',
    'เพิ่มผักสดเป็น 2 เท่า'
  ]);
  const [tasteRetention, setTasteRetention] = useState(85);
  const textareaRef = useRef(null);

  useEffect(() => {
    loadMenu();
  }, []);

  useEffect(() => {
    if (showAiModal && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [showAiModal]);

  const loadMenu = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const menuId = urlParams.get('menuId');

    if (menuId) {
      try {
        const menus = await localStore.entities.Menu.filter({ id: menuId });
        if (menus.length > 0) {
          setMenu(menus[0]);
        }
      } catch (error) {
        console.error('Error loading menu:', error);
      }
    }
  };

  const handleAdjust = async (adjustType) => {
    setAdjusting(true);

    // Simulate AI adjustment
    await new Promise(resolve => setTimeout(resolve, 1500));

    let nextImpacts = impacts;
    let nextModifications = modifications;
    let nextTasteRetention = tasteRetention;

    switch (adjustType) {
      case 'more_sodium':
        nextImpacts = { ...impacts, sodium: -35 };
        nextModifications = [
          'ลดน้ำปลาจาก 2 ช้อน → 0.5 ช้อน',
          'ใช้น้ำปลาลดโซเดียมแบบพิเศษ',
          'ใช้เกลือหิมาลายันแทน',
          'เพิ่มมะนาวเพื่อชดเชยรสเค็ม',
          'ลดผงชูรส 100%'
        ];
        nextTasteRetention = 78;
        break;
      case 'more_protein':
        nextModifications = [
          ...modifications,
          'เพิ่มไข่ต้ม 1 ฟอง',
          'เพิ่มกุ้งสด 50 กรัม'
        ];
        nextImpacts = { ...impacts, calories: -5 };
        break;
      case 'clean':
        nextImpacts = { sodium: -40, sugar: -30, calories: -20, bp_risk: -12 };
        nextModifications = [
          'ไม่ใส่น้ำปลา ใช้ซีอิ๊วขาวออร์แกนิค',
          'ไม่ใส่น้ำตาล',
          'ไม่ใส่ผงชูรส',
          'ใช้วัตถุดิบออร์แกนิค 100%',
          'เพิ่มผักสด 3 เท่า'
        ];
        nextTasteRetention = 72;
        break;
      case 'family':
        nextModifications = [
          'ลดความเผ็ดลง 50%',
          'แยกน้ำสลัดสำหรับเด็ก',
          'เพิ่มปริมาณเป็น 4 ที่',
          'ลดโซเดียมเฉลี่ย 15%'
        ];
        nextTasteRetention = 90;
        break;
    }

    setImpacts(nextImpacts);
    setModifications(nextModifications);
    setTasteRetention(nextTasteRetention);

    void trackAdjustmentEvent({
      menu,
      adjustType,
      source: 'preset',
      impacts: nextImpacts,
      tasteRetention: nextTasteRetention
    });

    setAdjusting(false);
    toast.success('ปรับสูตรเรียบร้อย!');
  };

  const handleAiPrompt = async (prompt) => {
    if (!prompt.trim()) return;
    setAiLoading(true);
    try {
      const result = await adjustRecipeByAI(menu, prompt);
      setModifications(result.modifications);
      setTasteRetention(result.tasteRetention);
      void trackAdjustmentEvent({
        menu,
        adjustType: 'ai_prompt',
        source: 'ai',
        prompt,
        impacts,
        tasteRetention: result.tasteRetention
      });
      setAiPrompt('');
      setShowAiModal(false);
      toast.success('AI ปรับสูตรเรียบร้อย!');
    } catch (error) {
      console.error('AI adjustment error:', error);
      toast.error('ไม่สามารถปรับสูตรด้วย AI ได้ กรุณาลองใหม่');
    } finally {
      setAiLoading(false);
    }
  };

  const handleOrder = () => {
    toast.success('กำลังนำคุณไปยังร้านค้า...');
  };

  const handleLogMeal = async () => {
    setLoading(true);
    try {
      const profiles = await localStore.entities.UserProfile.list();
      const currentUserId = profiles[0]?.id || null;

      const mealLog = await localStore.entities.MealLog.create({
        user_id: currentUserId,
        menu_id: menu.id,
        menu_name: menu.name_th,
        meal_type: 'lunch',
        is_modified: true,
        sodium_saved: Math.abs(impacts.sodium) * 10,
        calories: menu.calories * (1 + impacts.calories / 100),
        points_earned: 10
      });

      // Update user points
      if (profiles.length > 0) {
        await localStore.entities.UserProfile.update(profiles[0].id, {
          points: (profiles[0].points || 0) + 10
        });
      }

      void trackMealLogEvent({
        userId: currentUserId,
        menu,
        mealLog
      });

      toast.success('บันทึกมื้ออาหารแล้ว! +10 คะแนน');
      navigate(createPageUrl('Discover'));
    } catch (error) {
      console.error('Error logging meal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrabOrder = () => {
    window.open('https://food.grab.com/th/th/', '_blank');
  };

  const displayMenu = mode === 'cook' ? menu : healthyAlternative;

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Top App Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 pt-8 flex justify-between items-center z-10 max-w-sm mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-slate-900/30 backdrop-blur-md flex items-center justify-center text-white"
        >
          <Icon name="arrow_back" className="w-6 h-6" />
        </button>

        {/* Mode Toggle (Pills) */}
        <div className="flex bg-slate-900/30 backdrop-blur-md p-1 rounded-full border border-white/10">
          <button
            onClick={() => setMode('cook')}
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${mode === 'cook' ? 'bg-white text-emerald-800' : 'text-white/80'}`}
          >
            ปรุงเอง
          </button>
          <button
            onClick={() => setMode('order')}
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${mode === 'order' ? 'bg-white text-emerald-800' : 'text-white/80'}`}
          >
            สั่งอาหาร
          </button>
        </div>
      </div>

      {/* The Card */}
      <div className="relative w-full max-w-sm mx-auto h-[85vh] mt-8 flex flex-col pt-12 pb-24 px-4 overflow-hidden">
        <div className="flex-1 bg-emerald-100 rounded-[32px] overflow-visible shadow-2xl relative flex flex-col border-4 border-white/50">

          {/* Top Half: Image and Header Info */}
          <div className="bg-white rounded-t-[28px] rounded-b-sm pb-6 relative z-10 flex flex-col shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
            {/* Image */}
            <div className="h-48 w-full p-2">
              <img
                src={displayMenu.image_url}
                alt={displayMenu.name_th}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>

            {/* Header Info */}
            <div className="px-5 pt-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {displayMenu.region === 'northeast' ? 'อาหารอีสาน' : 'ยอดนิยม'}
                </span>
                <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md flex items-center">
                  <Icon name="local_fire_department" className="w-3 h-3 mr-0.5" />
                  เผ็ด {displayMenu.spice_level}/5
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-800 leading-tight">
                {displayMenu.name_th}
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">{displayMenu.name_en}</p>
            </div>

            {/* Floating AI Button */}
            {mode === 'cook' && (
              <button
                onClick={() => setShowAiModal(true)}
                className="absolute -bottom-6 right-6 w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white rounded-full flex items-center justify-center shadow-lg shadow-violet-300/50 transform transition-transform hover:scale-110 z-20"
              >
                <Icon name="auto_awesome" className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Half: Colored Theme Area */}
          <div className="flex-1 px-6 py-6 overflow-y-auto no-scrollbar relative z-0">

            {mode === 'cook' ? (
              <>
                <h2 className="text-3xl font-black text-emerald-950 tracking-tight leading-none mb-1">
                  ปรับสูตรใหม่
                </h2>
                <p className="text-emerald-800 font-medium opacity-80 mb-4">
                  ดีต่อสุขภาพยิ่งขึ้น
                </p>

                {/* Taste retention bar */}
                <div className="mb-4 bg-emerald-200/50 rounded-2xl p-3">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold text-emerald-800">🎯 คงรสชาติ</span>
                    <span className="text-sm font-black text-emerald-700">{tasteRetention}%</span>
                  </div>
                  <div className="h-2 bg-emerald-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${tasteRetention}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                <div className="h-px bg-emerald-950/10 w-full mb-4" />

                <div className="space-y-2.5">
                  {modifications.map((mod, idx) => {
                    let emoji = '✅';
                    if (mod.includes('น้ำปลา') || mod.includes('โซเดียม') || mod.includes('เค็ม')) emoji = '🧂';
                    else if (mod.includes('ผัก') || mod.includes('มะเขือเทศ') || mod.includes('ออร์แกนิค')) emoji = '🥦';
                    else if (mod.includes('ผงชูรส')) emoji = '🥄';
                    else if (mod.includes('น้ำตาล')) emoji = '🍯';
                    else if (mod.includes('ไข่') || mod.includes('กุ้ง') || mod.includes('โปรตีน')) emoji = '🍳';
                    else if (mod.includes('เผ็ด')) emoji = '🌶️';

                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex gap-3 items-start"
                      >
                        <span className="text-base leading-tight mt-0.5">{emoji}</span>
                        <span className="text-emerald-900 font-medium text-[15px] leading-snug">
                          {mod}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>

                <p className="mt-6 text-sm text-emerald-800/80 italic font-medium">
                  "หรอยเหมือนเดิมชัวร์ ลด{Math.abs(impacts.sodium)}% โซเดียม คอนเฟิร์ม!"
                </p>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-black text-emerald-950 tracking-tight leading-none mb-1">
                  สั่งเลยดีกว่า
                </h2>
                <p className="text-emerald-800 font-medium opacity-80 mb-4">
                  เมนูทางเลือกเพื่อสุขภาพ
                </p>

                <div className="h-px bg-emerald-950/10 w-full mb-4" />

                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <span className="text-base leading-tight mt-0.5">🏃‍♂️</span>
                    <span className="text-emerald-900 font-medium text-[15px] leading-snug">
                      สั่งเมนู {displayMenu.name_th} สูตรนี้ดีกว่าแน่นอน
                    </span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="text-base leading-tight mt-0.5">💪</span>
                    <span className="text-emerald-900 font-medium text-[15px] leading-snug">
                      โปรตีนสูง {displayMenu.protein}g เหมาะกับวันสบายๆ
                    </span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="text-base leading-tight mt-0.5">🛵</span>
                    <span className="text-emerald-900 font-medium text-[15px] leading-snug">
                      มีร้านอร่อยอยู่ในระยะจัดส่งมากมาย
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Soft gradient at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-emerald-100 to-transparent pointer-events-none rounded-b-[28px]" />
        </div>
      </div>

      {/* Fixed 3 Action Buttons (Tinder Style) */}
      <div className="fixed bottom-6 left-0 right-0 z-50 pointer-events-none">
        <div className="max-w-sm mx-auto flex justify-center items-center gap-6 px-4 pointer-events-auto">
          {/* Back/Cancel Button */}
          <button
            onClick={() => navigate(-1)}
            className="w-[72px] h-[72px] rounded-full bg-slate-900 shadow-xl flex items-center justify-center border-[3px] border-rose-500/20 hover:scale-105 transition-transform"
          >
            <Icon name="close" className="w-10 h-10 text-rose-500" />
          </button>

          {/* Middle Action: Adjust/Grab */}
          <button
            onClick={() => mode === 'cook' ? handleAdjust('clean') : handleGrabOrder()}
            disabled={adjusting}
            className="w-[64px] h-[64px] rounded-full bg-slate-900 shadow-xl flex items-center justify-center border-[3px] border-sky-400/20 hover:scale-105 transition-transform"
          >
            {adjusting ? (
              <Icon name="progress_activity" className="w-8 h-8 text-sky-400 animate-spin" />
            ) : (
              <Icon name={mode === 'cook' ? 'tune' : 'two_wheeler'} className="w-8 h-8 text-sky-400" />
            )}
          </button>

          {/* Primary Action: Log Meal */}
          <button
            onClick={handleLogMeal}
            disabled={loading}
            className="w-[72px] h-[72px] rounded-full bg-slate-900 shadow-xl flex items-center justify-center border-[3px] border-emerald-400/20 hover:scale-105 transition-transform"
          >
            {loading ? (
              <Icon name="progress_activity" className="w-10 h-10 text-emerald-400 animate-spin" />
            ) : (
              <Icon name="favorite" filled className="w-10 h-10 text-emerald-400" />
            )}
          </button>
        </div>
      </div>

      {/* AI Prompt Modal (Slide-up) */}
      <AnimatePresence>
        {showAiModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end justify-center"
            onClick={() => !aiLoading && setShowAiModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="bg-white rounded-t-3xl w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-slate-200 rounded-full" />
              </div>

              <div className="px-5 pb-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200">
                      <Icon name="auto_awesome" className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">ปรับสูตรด้วย AI</h3>
                      <p className="text-xs text-slate-500">บอก AI ว่าอยากปรับยังไง</p>
                    </div>
                  </div>
                  <button
                    onClick={() => !aiLoading && setShowAiModal(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
                  >
                    <Icon name="close" className="w-4 h-4 text-slate-500" />
                  </button>
                </div>

                {/* Current menu context */}
                <div className="bg-slate-50 rounded-2xl p-3 mb-4 flex items-center gap-3">
                  <img src={menu.image_url} alt={menu.name_th} className="w-12 h-12 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-800 truncate">{menu.name_th}</p>
                    <p className="text-xs text-slate-500">{menu.calories} kcal • โซเดียม: {menu.sodium_level}</p>
                  </div>
                </div>

                {/* Quick prompt chips */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {quickPrompts.map((qp, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setAiPrompt(qp.prompt);
                        if (textareaRef.current) textareaRef.current.focus();
                      }}
                      disabled={aiLoading}
                      className="px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-medium rounded-full border border-violet-100 transition-all disabled:opacity-50"
                    >
                      {qp.label}
                    </button>
                  ))}
                </div>

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAiPrompt(aiPrompt);
                    }
                  }}
                  disabled={aiLoading}
                  placeholder='เช่น "ลดโซเดียมลง ไม่ใส่ผงชูรส" หรือ "เพิ่มโปรตีน เหมาะกับคนออกกำลังกาย"'
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-violet-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />

                {/* Submit Button */}
                <button
                  onClick={() => handleAiPrompt(aiPrompt)}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className={`w-full mt-4 py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${aiPrompt.trim() && !aiLoading
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-200 active:scale-[0.98]'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                >
                  {aiLoading ? (
                    <>
                      <Icon name="progress_activity" className="w-5 h-5 animate-spin" />
                      กำลังปรับสูตร...
                    </>
                  ) : (
                    <>
                      <Icon name="auto_awesome" className="w-5 h-5" />
                      ปรับสูตรด้วย AI
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
