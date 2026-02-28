import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { localStore } from '@/api/apiStore';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import Icon from '@/components/ui/Icon';
import StoryRow from '@/components/feed/StoryRow';
import CreatePostPrompt from '@/components/feed/CreatePostPrompt';
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
    image: 'https://images.unsplash.com/photo-1628867389140-5e608027aeb8?w=800&q=80',
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
    <div className="min-h-screen bg-slate-100">
      {/* Top App Bar — sticky like Facebook */}
      <div className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-2.5">
          <h1 className="text-2xl font-extrabold text-emerald-700 tracking-tight" style={{ fontFamily: "'Kanit', sans-serif" }}>
            วงข้าว
          </h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate(createPageUrl('Discover'))}
              className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <Icon name="search" className="w-5 h-5" />
            </button>
            <button className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors relative">
              <Icon name="notifications" className="w-5 h-5" />
              <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        {/* Create Post Prompt */}
        <CreatePostPrompt
          userName={userProfile?.display_name || user?.displayName}
        />

        {/* Stories */}
        <div className="bg-white mt-2 border-b border-slate-100">
          <StoryRow />
        </div>

        {/* Spacer */}
        <div className="h-2" />

        {/* Feed */}
        {demoFeedPosts.map((post, idx) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.3 }}
          >
            <FeedPostCard post={post} />
          </motion.div>
        ))}

        {/* End of feed message */}
        <div className="flex flex-col items-center py-8 text-slate-400">
          <Icon name="check_circle" className="w-10 h-10 mb-2 text-slate-300" />
          <p className="text-sm font-medium">คุณดูครบทุกโพสต์แล้ว</p>
          <p className="text-xs mt-1">เลื่อน swipe เมนูเพิ่มเพื่อสร้างสูตรใหม่!</p>
          <button
            onClick={() => navigate(createPageUrl('Discover'))}
            className="mt-4 bg-emerald-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-200"
          >
            ไปค้นหาเมนู
          </button>
        </div>
      </div>
    </div>
  );
}
