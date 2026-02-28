import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { localStore } from '@/api/apiStore';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/Icon';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkProfile();
  }, []);

  const checkProfile = async () => {
    try {
      const profile = await localStore.entities.UserProfile.get(user.id);
      if (profile && profile.health_goal) {
        setUserProfile(profile);
      } else {
        navigate(createPageUrl('Onboarding'), { replace: true });
        return;
      }
    } catch (error) {
      console.error('Error checking profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    if (userProfile) {
      navigate(createPageUrl('Discover'));
    } else {
      navigate(createPageUrl('Onboarding'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-slate-800 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-teal-50/40 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full blur-3xl opacity-40 translate-y-1/2 -translate-x-1/2" />

      <div className="relative max-w-sm mx-auto px-4 py-8 min-h-screen flex flex-col pt-12">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Icon name="location_on" className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">ปัจจุบัน</p>
              <p className="text-sm font-bold text-slate-800">ประเทศไทย</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <button
        onClick={() => navigate(createPageUrl('Discover'))}
        className="w-full bg-white px-5 py-3.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-3 text-slate-400 mb-8 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
      >
        <Icon name="search" className="w-5 h-5" />
        <span className="text-base">ค้นหาเมนูอาหาร...</span>
      </button>

      {/* Categories */}
      <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4">
        {['ทั้งหมด', 'ของคาว', 'ของหวาน', 'เครื่องดื่ม'].map((cat, i) => (
          <button
            key={cat}
            className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-semibold transition-all ${i === 0
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
              : 'bg-transparent text-slate-500 border border-slate-200 hover:border-emerald-300'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Visual Icons Row */}
      <div className="flex justify-between items-start mb-8 overflow-x-auto scrollbar-hide gap-6 pb-2">
        {[
          { id: 1, label: 'อาหารไทย', img: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=150&h=150&fit=crop&q=80' },
          { id: 2, label: 'เพื่อสุขภาพ', img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=150&h=150&fit=crop&q=80' },
          { id: 3, label: 'เผ็ดจัด', img: 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=150&h=150&fit=crop&q=80' },
          { id: 4, label: 'ยอดฮิต', img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=150&h=150&fit=crop&q=80' }
        ].map(item => (
          <div key={item.id} className="flex flex-col items-center gap-2 min-w-[60px] cursor-pointer group">
            <div className="w-14 h-14 rounded-full bg-emerald-50 p-1 group-hover:bg-emerald-100 transition-colors">
              <img src={item.img} alt={item.label} className="w-full h-full object-cover rounded-full" />
            </div>
            <span className="text-[11px] font-semibold text-slate-600">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Promo Banner */}
      <div className="mb-8">
        <h3 className="font-bold text-lg text-slate-800 mb-4">โปรโมชั่นเด็ด</h3>
        <div className="bg-emerald-800 rounded-3xl p-5 text-white flex relative overflow-hidden shadow-lg shadow-emerald-900/20">
          <div className="absolute top-0 right-0 w-32 h-full bg-white/10 skew-x-12 translate-x-10" />
          <div className="z-10 w-3/5">
            <h4 className="text-xl font-bold leading-tight mb-2">มื้ออร่อยสุขภาพดี<br />ที่คุณไม่ควรพลาด!</h4>
            <button
              onClick={handleStart}
              className="bg-white text-emerald-800 px-4 py-1.5 rounded-full text-sm font-bold mt-2 shadow-sm"
            >
              เริ่มเลือกรสชาติ
            </button>
          </div>
          <div className="absolute right-[-20px] bottom-0 w-40 h-40">
            <img
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop&q=80"
              alt="Healthy Bowl"
              className="w-full h-full object-cover rounded-tl-full rounded-bl-full shadow-2xl"
            />
          </div>
        </div>
      </div>


      {/* Popular Items / Content List Placeholder */}
      <div className="flex-1">
        <div className="flex justify-between items-end mb-4">
          <h3 className="font-bold text-lg text-slate-800">เมนูยอดนิยม</h3>
          <button className="text-sm font-semibold text-emerald-600">ดูทั้งหมด</button>
        </div>

        <div className="grid grid-cols-2 gap-4 pb-12">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-3xl p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
              <button className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm">
                <Icon name="favorite" className="w-4 h-4 text-slate-300" />
              </button>
              <div className="w-full aspect-square rounded-2xl overflow-hidden mb-3 relative">
                <img src={i === 1 ? 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=300&h=300&fit=crop&q=80' : 'https://images.unsplash.com/photo-1628867389140-5e608027aeb8?w=300&h=300&fit=crop&q=80'} alt="Food" className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1">
                  <Icon name="schedule" className="w-3 h-3 text-emerald-600" />
                  <span className="text-[10px] font-bold text-slate-700">15 นาที</span>
                </div>
              </div>
              <h4 className="font-bold text-sm text-slate-800 mb-1 leading-tight line-clamp-1">ผัดกะเพราคลีน</h4>
              <div className="flex items-center gap-1 mb-2">
                <Icon name="star" filled className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] font-semibold text-slate-600">4.8 <span className="text-slate-400 font-normal">(120 รีวิว)</span></span>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <div className="bg-emerald-600 text-white px-2 py-0.5 rounded-lg text-xs font-bold">฿89</div>
                <button className="text-emerald-700">
                  <Icon name="open_in_new" className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-6 mb-8"
      >
        <Button
          onClick={handleStart}
          className="w-full h-16 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-2xl shadow-xl shadow-emerald-200 text-lg font-medium"
        >
          {userProfile ? 'ไปดูเมนูวันนี้' : 'เริ่มต้นใช้งาน'}
          <Icon name="chevron_right" className="w-5 h-5 ml-2" />
        </Button>

        {userProfile && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
            <Icon name="favorite" className="w-4 h-4 text-rose-400" filled />
            <span>Day {userProfile.streak_days || 1} • {userProfile.points || 0} คะแนน</span>
          </div>
        )}

        <p className="text-center text-xs text-slate-400 mt-4">
          ปรับสูตรอาหาร • ลดโซเดียม • ดูแลสุขภาพ
        </p>
      </motion.div>
    </div>
  );
}
