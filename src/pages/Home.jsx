import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { localStore } from "@/api/apiStore";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/lib/AuthContext";
import Icon from "@/components/ui/Icon";
import FeedPostCard from "@/components/feed/FeedPostCard";

// Demo feed data — shows recipe posts from users who cooked swiped recipes
const demoFeedPosts = [
  {
    id: 1,
    userName: "สมชาย คำดี",
    avatar: null,
    badge: "สายเฮลตี้",
    hoursAgo: 2,
    caption:
      "ลองทำตามสูตรที่ปรับแล้ว ลดเค็มจัด แต่ยังอร่อยเหมือนเดิม! 🔥\nใช้น้ำปลาลดโซเดียม + เพิ่มมะนาวชดเชย",
    menuName: "ส้มตำปลาร้า สูตรลดเค็ม",
    image:
      "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800&q=80",
    sodiumReduced: 22,
    caloriesReduced: null,
    likes: 47,
    comments: 12,
    shares: 3,
    topComment: {
      name: "วิภา",
      text: "น่ากินมากเลยค่ะ! จะลองทำบ้าง 🥰",
    },
  },
  {
    id: 2,
    userName: "ปิยะ รุ่งเรือง",
    avatar: null,
    badge: null,
    hoursAgo: 5,
    caption:
      "วันนี้ทำข้าวผัดคลีนเอง สูตรจากแอปวงข้าว ไม่ใส่ผงชูรส เลย ลดแคลด้วย 💪",
    menuName: "ข้าวผัดคลีน",
    image:
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80",
    sodiumReduced: null,
    caloriesReduced: 15,
    likes: 23,
    comments: 5,
    shares: 1,
    topComment: {
      name: "กิตติ",
      text: "สูตรนี้โปรตีนสูงดีมากครับ! 💪",
    },
  },
  {
    id: 3,
    userName: "มานี ใจดี",
    avatar: null,
    badge: "7 วัน Streak 🔥",
    hoursAgo: 8,
    caption:
      "ต้มยำกุ้งสูตรใหม่ ลดน้ำตาลและโซเดียม ครอบครัวทานกันทั้งบ้าน ชอบมากค่ะ ❤️",
    menuName: "ต้มยำกุ้ง สูตรครอบครัว",
    image:
      "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=80",
    sodiumReduced: 35,
    caloriesReduced: 10,
    likes: 89,
    comments: 24,
    shares: 8,
    topComment: {
      name: "สมชาย",
      text: "สูตรครอบครัวนี้เด็ดครับ เด็กๆ ก็กินได้เลย 👍",
    },
  },
  {
    id: 4,
    userName: "กิตติ สุขสม",
    avatar: null,
    badge: null,
    hoursAgo: 12,
    caption:
      "ผัดกะเพราหมูสับ swap สูตรจากแอป ใช้ซีอิ๊วขาวลดเกลือแทนน้ำปลา อร่อยไม่แพ้กัน!",
    menuName: "ผัดกะเพราหมูสับ สูตรลดเค็ม",
    image:
      "https://images.unsplash.com/photo-1516684669134-de6f7c473a2a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    sodiumReduced: 28,
    caloriesReduced: 5,
    likes: 34,
    comments: 8,
    shares: 2,
    topComment: null,
  },
  {
    id: 5,
    userName: "วิภา สดใส",
    avatar: null,
    badge: "สายคลีน",
    hoursAgo: 18,
    caption: "สลัดอกไก่ย่างสูตรเฮลตี้ โปรตีนแน่นมาก ทำง่ายด้วย 🥗",
    menuName: "สลัดอกไก่ย่าง",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
    sodiumReduced: null,
    caloriesReduced: 20,
    likes: 56,
    comments: 15,
    shares: 4,
    topComment: {
      name: "ปิยะ",
      text: "คลีนๆ แบบนี้ชอบเลย!",
    },
  },
];

const collections = [
  {
    id: 1,
    label: "อาหารไทย",
    img: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=150&h=150&fit=crop&q=80",
  },
  {
    id: 2,
    label: "เพื่อสุขภาพ",
    img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=150&h=150&fit=crop&q=80",
  },
  {
    id: 3,
    label: "เผ็ดจัด",
    img: "https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=150&h=150&fit=crop&q=80",
  },
  {
    id: 4,
    label: "ยอดฮิต",
    img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=150&h=150&fit=crop&q=80",
  },
];

const communityPosts = [
  {
    id: 1,
    title: "แจกสูตรลดน้ำหนัก 1 เดือน ฉบับคนขี้เกียจออกกำลังกาย 💖",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80",
    user: "Healthy Girl",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&q=80",
    likes: 1887,
  },
  {
    id: 2,
    title: "แจกทริคหมักอกไก่ให้นุ่มฉ่ำ ไม่แห้งฝืดคอ 🍗",
    image:
      "https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?w=400&q=80", // Fixed URL
    user: "Chef Mai",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&q=80",
    likes: 1954,
  },
  {
    id: 3,
    title: "เมนูไข่ลดน้ำหนัก ทำง่าย อร่อย ไม่จำเจ 🥚✨",
    image:
      "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&q=80",
    user: "Egg Lover",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&q=80",
    likes: 2405,
  },
  {
    id: 4,
    title: "5 ไอเดียข้าวกล่องมื้อเที่ยง แคลน้อยแต่อิ่มนาน 🍱",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80",
    user: "Bento Master",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80",
    likes: 2649,
  },
  {
    id: 5,
    title: "สูตรน้ำจิ้มสุกี้ลดโซเดียม อร่อยไม่อ้วน! 🌶️",
    image:
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&q=80", // Fixed URL
    user: "Spicy Queen",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&q=80",
    likes: 3120,
  },
  {
    id: 6,
    title: "แจกสูตรสมูทตี้โบวล์ กินแทนมื้อเช้าสดชื่นมาก 🍓🥣",
    image:
      "https://images.unsplash.com/photo-1494597564530-871f2b93ac55?w=400&q=80",
    user: "Fruit Lover",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop&q=80",
    likes: 4502,
  },
  {
    id: 7,
    title: "รวบรวมเมนูเส้นบุก แคลต่ำ กินเท่าไหร่ก็ไม่ผิด 🍜",
    image:
      "https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&q=80", // Fixed URL
    user: "Noodle Fan",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80",
    likes: 5890,
  },
  {
    id: 8,
    title: "ทำกิมจิโฮมเมดกินเอง ลดเค็ม ลดน้ำตาล 🥬",
    image:
      "https://images.unsplash.com/photo-1583224964978-225ddb1ca266?w=400&q=80",
    user: "Kimchi Master",
    avatar:
      "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=100&h=100&fit=crop&q=80",
    likes: 1245,
  },
  {
    id: 9,
    title: "แชร์ไอเดียขนมคลีน ทำจากข้าวโอ๊ต 🍪",
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
    user: "Baker Girl",
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&q=80",
    likes: 890,
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("foryou");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    checkProfile();
  }, []);

  const checkProfile = async () => {
    try {
      const profile = await localStore.entities.UserProfile.get(user.id);
      if (profile && profile.health_goal) {
        setUserProfile(profile);
      } else {
        navigate(createPageUrl("Onboarding"), { replace: true });
        return;
      }
    } catch (error) {
      console.error("Error checking profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    if (userProfile) {
      navigate(createPageUrl("Discover"));
      return;
    }
    navigate(createPageUrl("Onboarding"));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
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
              <p className="text-sm font-bold text-slate-800 line-clamp-1">
                {user?.name || user?.email || "ผู้ใช้งาน"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 font-medium">ตำแหน่ง</p>
            <p className="text-sm font-bold text-slate-800">ประเทศไทย</p>
          </div>
        </div>

        <button
          onClick={() => navigate(createPageUrl("Discover"))}
          className="w-full bg-white px-5 py-3.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-3 text-slate-400 mb-6 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
        >
          <Icon name="search" className="w-5 h-5" />
          <span className="text-base">ค้นหาเมนูอาหาร...</span>
        </button>

        <div className="mb-8 flex flex-col gap-4">
          {/* Banner 1: Recommendation (Swap) */}
          <div
            onClick={() => navigate(createPageUrl("Recommendation"))}
            className="cursor-pointer bg-[#0e4b3e] hover:bg-[#0a382e] transition-colors rounded-[24px] p-5 text-white flex relative overflow-hidden shadow-lg min-h-[170px]"
          >
            {/* Background shape */}
            <div className="absolute top-0 right-0 w-[60%] h-full bg-[#e8f6f3] rounded-l-[100px] opacity-10" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl flex-shrink-0" />

            <div className="relative z-10 w-[55%] flex flex-col justify-center">
              <h4 className="text-[19px] font-black leading-tight mb-2 tracking-tight">
                มื้ออร่อยสุขภาพดี
                <br />
                ที่คุณปรับเปลี่ยนได้!
              </h4>
              <p className="text-[12px] opacity-90 mb-4 leading-snug font-medium">
                เลือกเมนูโปรดแล้วนำมาปรับให้สุขภาพดีขึ้น (Swap)
              </p>
              <button className="bg-white text-[#0e4b3e] px-5 py-2 rounded-full text-[13px] font-bold shadow-md flex items-center justify-center gap-2 self-start w-max group hover:shadow-lg transition-all mt-1">
                <span className="leading-none pt-0.5">เลือกเมนูเลย</span>
                <Icon
                  name="arrow_forward"
                  className="w-[18px] h-[18px] group-hover:translate-x-1 transition-transform stroke-2"
                />
              </button>
            </div>

            {/* Image Circle Area */}
            <div className="absolute right-[-15px] top-1/2 -translate-y-1/2 w-[160px] h-[160px] flex-shrink-0 z-10">
              <div className="w-full h-full bg-[#f4fbf9] rounded-full p-2 shadow-inner">
                <img
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop&q=80"
                  alt="Healthy Bowl"
                  className="w-full h-full object-cover rounded-full shadow-lg border-[3px] border-white"
                />
              </div>
            </div>
          </div>

          {/* Banner 2: Profile (Meal Plan) */}
          <div
            onClick={() => navigate(createPageUrl("Profile"))}
            className="cursor-pointer bg-[#d27519] hover:bg-[#b86616] transition-colors rounded-[24px] p-5 text-white flex relative overflow-hidden shadow-lg min-h-[170px]"
          >
            {/* Background shape */}
            <div className="absolute top-0 right-0 w-[60%] h-full bg-[#fff4eb] rounded-l-[100px] opacity-10" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl flex-shrink-0" />

            <div className="relative z-10 w-[55%] flex flex-col justify-center">
              <h4 className="text-[19px] font-black leading-tight mb-2 tracking-tight drop-shadow-sm">
                วางแผนการกิน
                <br />
                ในแบบของคุณเอง
              </h4>
              <p className="text-[12px] opacity-90 mb-4 leading-snug font-medium">
                จัดตารางมื้ออาหารเพื่อเป้าหมายสุขภาพที่ยั่งยืน
              </p>
              <button className="bg-white text-[#d27519] px-5 py-2 rounded-full text-[13px] font-bold shadow-md flex items-center justify-center gap-2 self-start w-max group hover:shadow-lg transition-all mt-1">
                <span className="leading-none pt-0.5">ดูแผนโภชนาการ</span>
                <Icon
                  name="calendar_month"
                  className="w-[18px] h-[18px] group-hover:scale-110 transition-transform stroke-2"
                />
              </button>
            </div>

            {/* Image Circle Area */}
            <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-[160px] h-[160px] flex-shrink-0 z-10">
              <div className="w-full h-full bg-white/20 rounded-full p-1 backdrop-blur-sm shadow-inner">
                <img
                  src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&h=300&fit=crop&q=80"
                  alt="Meal Planning Menu"
                  className="w-full h-full object-cover rounded-full shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="columns-2 gap-3 space-y-3">
            {communityPosts.map((post) => (
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={post.id}
                onClick={() =>
                  navigate(createPageUrl("CommunityPostDetail/" + post.id))
                }
                className="bg-white rounded-[16px] overflow-hidden shadow-sm border border-slate-100 relative group cursor-pointer inline-block w-full break-inside-avoid"
              >
                <div className="w-full relative">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="flex flex-col h-full bg-white content-between p-3">
                  <h4 className="font-medium text-[13px] text-slate-800 mb-3 leading-snug line-clamp-2">
                    {post.title}
                  </h4>
                  <div className="flex items-center justify-between mt-auto w-full pt-1">
                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                      <img
                        src={post.avatar}
                        alt={post.user}
                        className="w-[28px] h-[28px] rounded-full object-cover flex-shrink-0 border border-slate-100"
                      />
                      <span className="text-[12px] text-slate-400 font-medium truncate">
                        {post.user}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 flex-shrink-0">
                      <Icon
                        name="favorite_border"
                        className="w-[26px] h-[26px] text-slate-400 opacity-90 stroke-[2px]"
                      />
                      <span className="text-[13px] font-medium tracking-tight pr-1 text-slate-300">
                        {post.likes}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
