import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { localStore } from '@/api/localStore';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import {
  Utensils,
  Target,
  TrendingDown,
  Sparkles,
  ChevronRight,
  Heart,
  Award
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkProfile();
  }, []);

  const checkProfile = async () => {
    try {
      const profiles = await localStore.entities.UserProfile.list();
      if (profiles.length > 0) {
        setUserProfile(profiles[0]);
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

      <div className="relative max-w-sm mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-auto"
        >
          <img src="/logo.png" alt="WongKhao Logo" className="w-12 h-12 rounded-2xl object-contain" />
          <div>
            <h1 className="text-xl font-bold text-slate-800">WongKhao</h1>
            <p className="text-xs text-slate-600">วงข้าว</p>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 leading-tight mb-3">
              ค้นพบเมนูไทย
              <br />
              <span className="bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">
                ที่ใช่สำหรับคุณ
              </span>
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              AI วิเคราะห์และปรับสูตรอาหารไทย
              <br />
              ให้เหมาะกับเป้าหมายสุขภาพของคุณ
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10 space-y-4"
          >
            {[
              {
                icon: Target,
                title: 'Smart Menu Swap',
                desc: 'ปรับสูตรอาหารตามเป้าหมาย',
                color: 'bg-teal-100 text-teal-700'
              },
              {
                icon: TrendingDown,
                title: 'Therapeutic Impact',
                desc: 'ดูผลลัพธ์ต่อสุขภาพแบบ Real-time',
                color: 'bg-emerald-100 text-emerald-700'
              },
              {
                icon: Award,
                title: 'Challenge & Points',
                desc: 'สะสมคะแนนจากการกินดี',
                color: 'bg-amber-100 text-amber-700'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-100"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-auto"
        >
          <Button
            onClick={handleStart}
            className="w-full h-16 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-2xl shadow-xl shadow-teal-200 text-lg font-medium"
          >
            {userProfile ? 'ไปดูเมนูวันนี้' : 'เริ่มต้นใช้งาน'}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>

          {userProfile && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
              <Heart className="w-4 h-4 text-rose-400" />
              <span>Day {userProfile.streak_days || 1} • {userProfile.points || 0} คะแนน</span>
            </div>
          )}

          <p className="text-center text-xs text-slate-400 mt-4">
            ปรับสูตรอาหาร • ลดโซเดียม • ดูแลสุขภาพ
          </p>
        </motion.div>
      </div>
    </div>
  );
}