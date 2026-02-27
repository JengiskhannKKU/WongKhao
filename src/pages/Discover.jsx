import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { localStore } from '@/api/apiStore';
import { createPageUrl } from '@/utils';
import Icon from '@/components/ui/Icon';
import { trackSwipeEvent } from '@/api/behaviorAnalytics';

import MenuCard from '@/components/swipe/MenuCard';
import SwipeActions from '@/components/swipe/SwipeActions';
import RegionFilter from '@/components/swipe/RegionFilter';
import MoodSelector from '@/components/swipe/MoodSelector';
import ProgressHeader from '@/components/swipe/ProgressHeader';

// Sample menus for demo
const sampleMenus = [
  {
    id: '1',
    name_th: 'ข้าวซอยไก่',
    name_en: 'Khao Soi Chicken',
    region: 'north',
    image_url: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=800&q=80',
    spice_level: 3,
    health_score: 72,
    sodium_level: 'high',
    calories: 520,
    protein: 28,
    carbs: 55,
    fat: 18
  },
  {
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
  },
  {
    id: '3',
    name_th: 'แกงเขียวหวานไก่',
    name_en: 'Green Curry Chicken',
    region: 'central',
    image_url: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80',
    spice_level: 4,
    health_score: 75,
    sodium_level: 'medium',
    calories: 450,
    protein: 32,
    carbs: 25,
    fat: 22
  },
  {
    id: '4',
    name_th: 'แกงส้มปลา',
    name_en: 'Sour Curry Fish',
    region: 'south',
    image_url: 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=800&q=80',
    spice_level: 4,
    health_score: 82,
    sodium_level: 'medium',
    calories: 320,
    protein: 28,
    carbs: 18,
    fat: 14
  },
  {
    id: '5',
    name_th: 'ไก่ย่าง',
    name_en: 'Grilled Chicken',
    region: 'northeast',
    image_url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80',
    spice_level: 2,
    health_score: 88,
    sodium_level: 'low',
    calories: 380,
    protein: 42,
    carbs: 5,
    fat: 18
  }
];

export default function Discover() {
  const navigate = useNavigate();
  const [menus, setMenus] = useState(sampleMenus);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedMood, setSelectedMood] = useState(null);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load user profile
      const profiles = await localStore.entities.UserProfile.list();
      if (profiles.length > 0) {
        setUserProfile(profiles[0]);
      }

      // Load menus from database
      const dbMenus = await localStore.entities.Menu.list();
      if (dbMenus.length > 0) {
        setMenus(dbMenus);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const filteredMenus = menus.filter(menu => {
    if (selectedRegion !== 'all' && menu.region !== selectedRegion) return false;
    return true;
  });

  const handleSwipe = async (swipeInput) => {
    const action = typeof swipeInput === 'string' ? swipeInput : swipeInput?.action;
    const source = typeof swipeInput === 'string' ? 'button' : swipeInput?.source || 'button';
    const currentMenu = filteredMenus[currentIndex];
    if (!currentMenu || !action) return;

    // Log swipe action
    try {
      await localStore.entities.MenuSwipe.create({
        user_id: userProfile?.id || null,
        menu_id: currentMenu.id,
        direction: action,
      });
    } catch (error) {
      console.error('Error logging swipe:', error);
    }

    void trackSwipeEvent({
      userId: userProfile?.id,
      menu: currentMenu,
      action,
      source,
      selectedRegion,
      mood: selectedMood
    });

    if (currentIndex < filteredMenus.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleAction = (actionType) => {
    if (actionType === 'swap') {
      const currentMenu = filteredMenus[currentIndex];
      navigate(createPageUrl('Recommendation') + `?menuId=${currentMenu.id}`);
    } else if (actionType === 'like' || actionType === 'dislike' || actionType === 'save') {
      handleSwipe({
        action: actionType === 'save' ? 'save' : actionType,
        source: 'button'
      });
    }
  };

  const currentMenu = filteredMenus[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F5E9] to-[#FFFFFF] pt-12 pb-24">
      <div className="max-w-sm mx-auto px-4">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">ค้นหาเมนูวันนี้</h1>
          <p className="text-sm text-slate-500">ปัดซ้าย-ขวา เพื่อเลือกเมนูที่ชอบ</p>
        </div>
        <ProgressHeader
          streakDays={userProfile?.streak_days || 1}
          sodiumReduction={userProfile?.sodium_limit || 1500}
          targetText={`โซเดียม ${userProfile?.sodium_limit || 1500}mg`}
        />

        {/* Region Filter */}
        <div className="mt-6 flex items-center gap-2">
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <RegionFilter selected={selectedRegion} onSelect={setSelectedRegion} />
          </div>
          <button
            onClick={() => setShowMoodSelector(true)}
            className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0 border hidden border-slate-100 text-slate-400 hover:text-emerald-600 transition-colors"
          >
            <Icon name="tune" className="w-5 h-5" />
          </button>
        </div>

        {/* Swipe Area */}
        <div className="relative h-[520px] sm:h-[480px] mt-6">
          {/* Stack Effect - Show next cards behind */}
          {filteredMenus.slice(currentIndex + 1, currentIndex + 3).map((menu, index) => (
            <div
              key={menu.id}
              className="absolute w-full h-full"
              style={{
                transform: `scale(${1 - (index + 1) * 0.05}) translateY(${(index + 1) * 10}px)`,
                zIndex: -index - 1,
                opacity: 1 - (index + 1) * 0.3
              }}
            >
              <div className="w-full h-full bg-white rounded-3xl shadow-xl border border-slate-100" />
            </div>
          ))}

          <AnimatePresence>
            {currentMenu && (
              <MenuCard
                key={currentMenu.id}
                menu={currentMenu}
                onSwipe={handleSwipe}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="mt-6">
          <SwipeActions onAction={handleAction} />
        </div>

        {/* Hint */}
        <div className="bg-white rounded-2xl p-3 mt-4 border border-slate-100">
          <p className="text-center text-xs text-slate-500">
            ❌ ปัดซ้าย = ไม่สนใจ • ✅ ปัดขวา = ชอบ
          </p>
        </div>
      </div>

      {/* Mood Selector */}
      <MoodSelector
        isOpen={showMoodSelector}
        onClose={() => setShowMoodSelector(false)}
        onSelect={setSelectedMood}
        selectedMood={selectedMood}
      />
    </div>
  );
}
