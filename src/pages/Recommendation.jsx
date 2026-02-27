import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { localStore } from '@/api/apiStore';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { adjustRecipeByAI } from '@/lib/openai';

import MenuHeader from '@/components/recommendation/MenuHeader';
import ImpactPanel from '@/components/recommendation/ImpactPanel';
import ModificationList from '@/components/recommendation/ModificationList';
import TasteRetention from '@/components/recommendation/TasteRetention';
import ActionButtons from '@/components/recommendation/ActionButtons';
import AiPromptBox from '@/components/recommendation/AiPromptBox';

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

export default function Recommendation() {
  const navigate = useNavigate();
  const [menu, setMenu] = useState(sampleMenu);
  const [loading, setLoading] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
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

  useEffect(() => {
    loadMenu();
  }, []);

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

    switch (adjustType) {
      case 'more_sodium':
        setImpacts(prev => ({ ...prev, sodium: -35 }));
        setModifications([
          'ลดน้ำปลาจาก 2 ช้อน → 0.5 ช้อน',
          'ใช้น้ำปลาลดโซเดียมแบบพิเศษ',
          'ใช้เกลือหิมาลายันแทน',
          'เพิ่มมะนาวเพื่อชดเชยรสเค็ม',
          'ลดผงชูรส 100%'
        ]);
        setTasteRetention(78);
        break;
      case 'more_protein':
        setModifications([
          ...modifications,
          'เพิ่มไข่ต้ม 1 ฟอง',
          'เพิ่มกุ้งสด 50 กรัม'
        ]);
        setImpacts(prev => ({ ...prev, calories: -5 }));
        break;
      case 'clean':
        setImpacts({ sodium: -40, sugar: -30, calories: -20, bp_risk: -12 });
        setModifications([
          'ไม่ใส่น้ำปลา ใช้ซีอิ๊วขาวออร์แกนิค',
          'ไม่ใส่น้ำตาล',
          'ไม่ใส่ผงชูรส',
          'ใช้วัตถุดิบออร์แกนิค 100%',
          'เพิ่มผักสด 3 เท่า'
        ]);
        setTasteRetention(72);
        break;
      case 'family':
        setModifications([
          'ลดความเผ็ดลง 50%',
          'แยกน้ำสลัดสำหรับเด็ก',
          'เพิ่มปริมาณเป็น 4 ที่',
          'ลดโซเดียมเฉลี่ย 15%'
        ]);
        setTasteRetention(90);
        break;
    }

    setAdjusting(false);
    toast.success('ปรับสูตรเรียบร้อย!');
  };

  const handleAiPrompt = async (prompt) => {
    setAiLoading(true);
    try {
      const result = await adjustRecipeByAI(menu, prompt);
      setModifications(result.modifications);
      setTasteRetention(result.tasteRetention);
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
      await localStore.entities.MealLog.create({
        menu_id: menu.id,
        menu_name: menu.name_th,
        meal_type: 'lunch',
        is_modified: true,
        sodium_saved: Math.abs(impacts.sodium) * 10,
        calories: menu.calories * (1 + impacts.calories / 100),
        points_earned: 10
      });

      // Update user points
      const profiles = await localStore.entities.UserProfile.list();
      if (profiles.length > 0) {
        await localStore.entities.UserProfile.update(profiles[0].id, {
          points: (profiles[0].points || 0) + 10
        });
      }

      toast.success('บันทึกมื้ออาหารแล้ว! +10 คะแนน');
      navigate(createPageUrl('Discover'));
    } catch (error) {
      console.error('Error logging meal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-white pb-32">
      <div className="max-w-sm mx-auto">
        {/* Back Button */}
        <div className="p-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="px-3 space-y-4">
          {/* Menu Header */}
          <MenuHeader menu={menu} />

          {/* Modifications */}
          <ModificationList modifications={modifications} />

          {/* Taste Retention */}
          <TasteRetention percentage={tasteRetention} />

          {/* Action Buttons */}
          {adjusting ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              <span className="ml-2 text-slate-500">กำลังปรับสูตร...</span>
            </div>
          ) : (
            <ActionButtons onAdjust={handleAdjust} onOrder={handleOrder} />
          )}

          {/* AI Prompt Box */}
          <AiPromptBox
            onSubmit={handleAiPrompt}
            disabled={aiLoading}
          />
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-100 p-3 safe-area-bottom">
        <div className="max-w-sm mx-auto">
          <Button
            onClick={handleLogMeal}
            disabled={loading}
            className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                บันทึกมื้อนี้ (+10 คะแนน)
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}