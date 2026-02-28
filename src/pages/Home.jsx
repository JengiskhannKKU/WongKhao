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

const collections = [
  { id: 1, label: 'อาหารไทย', img: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=150&h=150&fit=crop&q=80' },
  { id: 2, label: 'เพื่อสุขภาพ', img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=150&h=150&fit=crop&q=80' },
  { id: 3, label: 'เผ็ดจัด', img: 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=150&h=150&fit=crop&q=80' },
  { id: 4, label: 'ยอดฮิต', img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=150&h=150&fit=crop&q=80' }
];

const popularMenus = [
  {
    id: 'm1',
    name: 'ผัดกะเพราคลีน',
    price: '฿89',
    rating: '4.8',
    reviews: '120 รีวิว',
    time: '15 นาที',
    img: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=300&h=300&fit=crop&q=80'
  },
  {
    id: 'm2',
    name: 'ข้าวยำสมุนไพร',
    price: '฿95',
    rating: '4.7',
    reviews: '96 รีวิว',
    time: '20 นาที',
    img: 'https://images.unsplash.com/photo-1628867389140-5e608027aeb8?w=300&h=300&fit=crop&q=80'
  }
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('foryou');
  const [activeCategory, setActiveCategory] = useState('all');

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

  const handleStart = () => {
    if (userProfile) {
      navigate(createPageUrl('Discover'));
      return;
    }
    navigate(createPageUrl('Onboarding'));
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-teal-50/40 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full blur-3xl opacity-40 translate-y-1/2 -translate-x-1/2" />

      <div className="relative max-w-sm mx-auto px-4 pt-6 pb-24">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Icon name="location_on" className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">ยินดีต้อนรับ</p>
              <p className="text-sm font-bold text-slate-800 line-clamp-1">{user?.name || user?.email || 'ผู้ใช้งาน'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 font-medium">ตำแหน่ง</p>
            <p className="text-sm font-bold text-slate-800">ประเทศไทย</p>
          </div>
        </div>

        <button
          onClick={() => navigate(createPageUrl('Discover'))}
          className="w-full bg-white px-5 py-3.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-3 text-slate-400 mb-6 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
        >
          <Icon name="search" className="w-5 h-5" />
          <span className="text-base">ค้นหาเมนูอาหาร...</span>
        </button>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xl font-bold text-slate-800">Categories</h2>
            <button className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500 text-emerald-600 text-[11px] font-bold bg-white hover:bg-emerald-50 transition-colors shadow-sm">
              <Icon name="filter_list" className="w-3 h-3" />
              Filter
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex flex-col items-center justify-center min-w-[70px] h-[78px] rounded-2xl transition-all shadow-sm shrink-0 border
                  ${activeCategory === cat.id
                    ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500 shadow-emerald-500/20'
                    : 'border-slate-100 bg-white hover:bg-slate-50'
                  }`}
              >
                <span className="text-[26px] mb-1 leading-none">{cat.icon}</span>
                <span className={`text-[11px] font-medium leading-tight ${activeCategory === cat.id ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}>
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-8">
          {collections.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(createPageUrl('Discover'))}
              className="flex flex-col items-center gap-2 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-50 p-1">
                <img src={item.img} alt={item.label} className="w-full h-full object-cover rounded-full" />
              </div>
              <span className="text-[11px] font-semibold text-slate-600 leading-tight">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mb-8">
          <h3 className="font-bold text-lg text-slate-800 mb-4">โปรโมชั่นเด็ด</h3>
          <div className="bg-emerald-800 rounded-3xl p-5 text-white flex relative overflow-hidden shadow-lg shadow-emerald-900/20 min-h-[170px]">
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

        <div>
          <div className="flex justify-between items-end mb-4">
            <h3 className="font-bold text-lg text-slate-800">เมนูยอดนิยม</h3>
            <button
              onClick={() => navigate(createPageUrl('Discover'))}
              className="text-sm font-semibold text-emerald-600"
            >
              ดูทั้งหมด
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {popularMenus.map((menu) => (
              <div key={menu.id} className="bg-white rounded-3xl p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
                <button className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm">
                  <Icon name="favorite" className="w-4 h-4 text-slate-300" />
                </button>
                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-3 relative">
                  <img src={menu.img} alt={menu.name} className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1">
                    <Icon name="schedule" className="w-3 h-3 text-emerald-600" />
                    <span className="text-[10px] font-bold text-slate-700">{menu.time}</span>
                  </div>
                </div>
                <h4 className="font-bold text-sm text-slate-800 mb-1 leading-tight line-clamp-1">{menu.name}</h4>
                <div className="flex items-center gap-1 mb-2">
                  <Icon name="star" filled className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px] font-semibold text-slate-600">
                    {menu.rating} <span className="text-slate-400 font-normal">({menu.reviews})</span>
                  </span>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <div className="bg-emerald-600 text-white px-2 py-0.5 rounded-lg text-xs font-bold">{menu.price}</div>
                  <button className="text-emerald-700">
                    <Icon name="open_in_new" className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-6"
        >
          <button
            onClick={handleStart}
            className="w-full h-14 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-2xl shadow-xl shadow-emerald-200 text-base font-medium flex justify-center items-center"
          >
            {userProfile ? 'ไปดูเมนูวันนี้' : 'เริ่มต้นใช้งาน'}
            <Icon name="chevron_right" className="w-5 h-5 ml-2" />
          </button>

          {userProfile && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
              <Icon name="favorite" className="w-4 h-4 text-rose-400" filled />
              <span>Day {userProfile.streak_days || 1} • {userProfile.points || 0} คะแนน</span>
            </div>
          )}
        </motion.div>

        <p className="text-center text-xs text-slate-400 mt-4">
          ปรับสูตรอาหาร • ลดโซเดียม • ดูแลสุขภาพ
        </p>
      </div>
    </div>
  );
}
