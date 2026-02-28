import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { localStore } from '@/api/apiStore';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import Icon from '@/components/ui/Icon';
import FeedPostCard from '@/components/feed/FeedPostCard';

// Demo feed data — shows recipe posts from users who cooked swiped recipes
const demoFeedPosts = [
  {
    id: 1,
    userName: 'สมชาย คำดี',
    avatar: null,
    badge: 'สายเฮลตี้',
    hoursAgo: 2,
    caption: 'ลองทำตามสูตรที่ปรับแล้ว ลดเค็มจัด แต่ยังอร่อยเหมือนเดิม! 🔥\nใช้น้ำปลาลดโซเดียม + เพิ่มมะนาวชดเชย',
    menuName: 'ส้มตำปลาร้า สูตรลดเค็ม',
    image: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800&q=80',
    sodiumReduced: 22,
    caloriesReduced: null,
    likes: 47,
    comments: 12,
    shares: 3,
    topComment: {
      name: 'วิภา',
      text: 'น่ากินมากเลยค่ะ! จะลองทำบ้าง 🥰'
    }
  },
  {
    id: 2,
    userName: 'ปิยะ รุ่งเรือง',
    avatar: null,
    badge: null,
    hoursAgo: 5,
    caption: 'วันนี้ทำข้าวผัดคลีนเอง สูตรจากแอปวงข้าว ไม่ใส่ผงชูรส เลย ลดแคลด้วย 💪',
    menuName: 'ข้าวผัดคลีน',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80',
    sodiumReduced: null,
    caloriesReduced: 15,
    likes: 23,
    comments: 5,
    shares: 1,
    topComment: {
      name: 'กิตติ',
      text: 'สูตรนี้โปรตีนสูงดีมากครับ! 💪'
    }
  },
  {
    id: 3,
    userName: 'มานี ใจดี',
    avatar: null,
    badge: '7 วัน Streak 🔥',
    hoursAgo: 8,
    caption: 'ต้มยำกุ้งสูตรใหม่ ลดน้ำตาลและโซเดียม ครอบครัวทานกันทั้งบ้าน ชอบมากค่ะ ❤️',
    menuName: 'ต้มยำกุ้ง สูตรครอบครัว',
    image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=80',
    sodiumReduced: 35,
    caloriesReduced: 10,
    likes: 89,
    comments: 24,
    shares: 8,
    topComment: {
      name: 'สมชาย',
      text: 'สูตรครอบครัวนี้เด็ดครับ เด็กๆ ก็กินได้เลย 👍'
    }
  },
  {
    id: 4,
    userName: 'กิตติ สุขสม',
    avatar: null,
    badge: null,
    hoursAgo: 12,
    caption: 'ผัดกะเพราหมูสับ swap สูตรจากแอป ใช้ซีอิ๊วขาวลดเกลือแทนน้ำปลา อร่อยไม่แพ้กัน!',
    menuName: 'ผัดกะเพราหมูสับ สูตรลดเค็ม',
    image: 'https://images.unsplash.com/photo-1516684669134-de6f7c473a2a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    sodiumReduced: 28,
    caloriesReduced: 5,
    likes: 34,
    comments: 8,
    shares: 2,
    topComment: null
  },
  {
    id: 5,
    userName: 'วิภา สดใส',
    avatar: null,
    badge: 'สายคลีน',
    hoursAgo: 18,
    caption: 'สลัดอกไก่ย่างสูตรเฮลตี้ โปรตีนแน่นมาก ทำง่ายด้วย 🥗',
    menuName: 'สลัดอกไก่ย่าง',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
    sodiumReduced: null,
    caloriesReduced: 20,
    likes: 56,
    comments: 15,
    shares: 4,
    topComment: {
      name: 'ปิยะ',
      text: 'คลีนๆ แบบนี้ชอบเลย!'
    }
  }
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('foryou');
  const [activeCategory, setActiveCategory] = useState('ทั้งหมด');

  const categories = [
    { id: 'all', label: 'All', icon: '✨' },
    { id: 'fruits', label: 'Fruits', icon: '🍎' },
    { id: 'bread', label: 'Bread', icon: '🍞' },
    { id: 'vegetable', label: 'Vegetable', icon: '🥬' },
    { id: 'fish', label: 'Fish', icon: '🐟' },
    { id: 'meat', label: 'Meat', icon: '🍖' },
    { id: 'drinks', label: 'Drinks', icon: '🥤' },
    { id: 'seafood', label: 'Sea Food', icon: '🐙' },
    { id: 'ice_cream', label: 'Ice cream', icon: '🍦' },
    { id: 'juice', label: 'Juice', icon: '🍹' },
    { id: 'jam', label: 'Jam', icon: '🍓' },
  ];

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top App Bar — Lemon8 Style Header */}
      <div className="sticky top-0 z-30 bg-white pb-3 shadow-sm rounded-b-3xl">
        <div className="max-w-lg mx-auto">
          {/* Top Row: User/Scan + Tabs + Search */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <button
              onClick={() => navigate(createPageUrl('Profile'))}
              className="w-8 h-8 flex items-center justify-center text-slate-800"
            >

            </button>

            {/* Title / Tabs */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveTab('following')}
                className={`text-[16px] font-medium transition-colors ${activeTab === 'following' ? 'text-slate-800' : 'text-slate-400'}`}
              >
                อาหารที่คุณชอบ
              </button>
              <button
                onClick={() => setActiveTab('foryou')}
                className={`text-[16px] font-bold relative transition-colors ${activeTab === 'foryou' ? 'text-slate-800' : 'text-slate-400'}`}
              >
                สำหรับคุณ
                {activeTab === 'foryou' && (
                  <motion.div layoutId="tab-indicator" className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-[3px] bg-slate-800 rounded-full" />
                )}
              </button>
            </div>

            <button
              onClick={() => navigate(createPageUrl('Discover'))}
              className="w-8 h-8 flex items-center justify-center text-slate-800"
            >
              <Icon name="search" className="w-6 h-6" />
            </button>
          </div>



          {/* Square Category Cards Row */}
          <div className="flex px-4 gap-3 overflow-x-auto no-scrollbar py-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex flex-col items-center justify-center min-w-[76px] h-[84px] rounded-[20px] transition-all shadow-sm shrink-0 border
                  ${activeCategory === cat.id
                    ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500'
                    : 'border-slate-100 bg-white hover:bg-slate-50'
                  }`}
              >
                <span className="text-[28px] mb-1.5 leading-none">{cat.icon}</span>
                <span className={`text-[12px] font-medium ${activeCategory === cat.id ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}>
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Lemon8 Style Masonry Feed */}
        <div className="columns-2 gap-3 space-y-3">
          {demoFeedPosts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              className="break-inside-avoid"
            >
              <FeedPostCard post={post} />
            </motion.div>
          ))}
        </div>

        {/* End of feed message */}
        <div className="flex flex-col items-center py-8 text-slate-400">
          <Icon name="check_circle" className="w-8 h-8 mb-2 text-slate-300" />
          <p className="text-sm font-medium">ไม่มีโพสต์เพิ่มเติม</p>
        </div>
      </div>

      {/* Add CSS to hide scrollbar */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
        }
      `}} />
    </div>
  );
}
