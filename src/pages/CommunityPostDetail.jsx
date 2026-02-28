import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "@/components/ui/Icon";

// Mock data (we reuse the communityPosts from Home, plus some extra comments)
const mockPosts = [
  {
    id: 1,
    title: "แจกสูตรลดน้ำหนัก 1 เดือน ฉบับคนขี้เกียจออกกำลังกาย 💖",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    ],
    user: "Healthy Girl",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&q=80",
    likes: 1887,
    saves: 683,
    commentsCount: 4,
    content:
      "อันนี้วิธีที่เราลดน้ำหนักนะคะ ทุกคนที่เตรียมตัวลดสามารถนำไปปรับใช้ได้เลยน้าา สู้ๆนะคะ ✌🏻✌🏻 ใครจะเริ่มลด หรือเตรียมลดทักมาคุยกันปรึกษากันได้เลยน้าา\n\nล่าสุดเราเพิ่งลองเอาเมนูโปรดมาทำตามสูตรที่แอพวงข้าวปรับให้ (Swap สูตร) สรุปคือทำออกมาแล้วแคลลอรี่ลดลงเยอะมากแถมอร่อยเหมือนเดิมเลยยยย ฟินสุดๆ! ใครยังไม่เคยลองฟีเจอร์นี้ไปลองกันได้นะคะ\n\n#ลดน้ำหนัก #เมนูคลีน #อาหารคลีน #healthy #WongKhao",
    updatedAt: "1/10/2025",
    comments: [
      {
        id: 1,
        user: "Jia Jia",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop",
        text: "ดีมากกกก ขอบคุณที่แชร์แนวทางความรู้นะคะ 🥰",
        date: "7/12/2025",
      },
      {
        id: 2,
        user: "kk",
        avatar:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=50&h=50&fit=crop",
        text: "🥰",
        date: "8/9/2025",
      },
      {
        id: 3,
        user: "Kero(コップ) 94 🍰",
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop",
        text: "ขอบคุณมากค่ะ",
        date: "15/10/2025",
      },
      {
        id: 4,
        user: "PRAISE",
        avatar:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=50&h=50&fit=crop",
        text: "เป็นประโยชน์มากๆค่ะ",
        date: "8/9/2025",
      },
    ],
  },
  {
    id: 2,
    title: "แจกทริคหมักอกไก่ให้นุ่มฉ่ำ ไม่แห้งฝืดคอ 🍗",
    image:
      "https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?w=800&q=80",
    ],
    user: "Chef Mai",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&q=80",
    likes: 1954,
    saves: 300,
    commentsCount: 2,
    content:
      "ใครที่เบื่ออกไก่แห้งๆ ลองวิธีนี้ดูนะคะ รับรองว่าอกไก่นุ่มฉ่ำ ทานง่ายขึ้นเยอะเลย!\n\nส่วนผสม:\n- อกไก่ 500 กรัม\n- ซีอิ๊วขาวลดโซเดียม 1 ช้อนโต๊ะ\n- น้ำมันงา 1 ช้อนชา\n- เบกกิ้งโซดา หยิบมือ",
    updatedAt: "5/10/2025",
    comments: [
      {
        id: 1,
        user: "Ploy",
        avatar:
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=50&h=50&fit=crop",
        text: "ต้องลองทำตามแล้วค่ะ 😋",
        date: "6/10/2025",
      },
      {
        id: 2,
        user: "Toey",
        avatar:
          "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=50&h=50&fit=crop",
        text: "ใช้หม้อทอดไร้น้ำมันได้มั้ยคะ",
        date: "6/10/2025",
      },
    ],
  },
  // Default fallback for any other ID
  {
    id: "default",
    title: "เมนูสุขภาพ ทำง่าย อร่อย ไม่จำเจ ✨",
    image:
      "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=80",
    ],
    user: "Egg Lover",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&q=80",
    likes: 2400,
    saves: 500,
    commentsCount: 1,
    content:
      "เมนูไข่ทำได้หลากหลาย ลองเปลี่ยนวัตถุดิบเล็กน้อยก็อร่อยไม่ซ้ำแล้วค่ะ\n\n#เมนูไข่ #ลดน้ำหนัก",
    updatedAt: "10/10/2025",
    comments: [
      {
        id: 1,
        user: "Test User",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop",
        text: "น่าทานมากค่ะ",
        date: "11/10/2025",
      },
    ],
  },
];

export default function CommunityPostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Find post by ID, or fallback to default
    const foundPost =
      mockPosts.find((p) => p.id.toString() === id) ||
      mockPosts.find((p) => p.id === "default");
    setPost(foundPost);
  }, [id]);

  if (!post) return <div className="min-h-screen bg-white" />;

  return (
    <div className="min-h-screen bg-white flex flex-col pt-safe pb-safe">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-[36px] h-[36px] rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
          >
            <Icon
              name="chevron_left"
              className="w-[26px] h-[26px] text-slate-800"
            />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img
                src={post.avatar}
                alt={post.user}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-medium text-slate-800 text-[15px]">
              {post.user}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="bg-[#CCFF99] text-slate-900 px-5 py-1.5 rounded-full font-bold text-[14px]">
            ติดตาม
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-slate-600">
            <Icon name="more_horiz" className="w-[22px] h-[22px]" />
          </button>
        </div>
      </div>

      {/* Image Carousel Area */}
      <div className="w-full relative bg-black aspect-[3/4] sm:aspect-square flex items-center overflow-hidden">
        {/* Placeholder for swipeable images, for now we just show one or cycle on click */}
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            src={post.images[currentImageIndex]}
            alt="post content"
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Image pagination dots */}
        {post.images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
            {post.images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImageIndex ? "bg-white w-3" : "bg-white/50"}`}
              />
            ))}
          </div>
        )}

        {/* Overlay number indicator */}
        {post.images.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/40 backdrop-blur text-white text-[11px] font-medium px-2 py-0.5 rounded-full">
            {currentImageIndex + 1}/{post.images.length}
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="px-4 pt-4 pb-6 border-b border-slate-100">
        <h1 className="text-[20px] font-bold text-slate-900 leading-snug mb-3">
          {post.title}
        </h1>

        <p className="text-[15px] text-slate-700 leading-relaxed whitespace-pre-wrap mb-4">
          {post.content}
        </p>

        <p className="text-[12px] text-slate-400">
          ปรับปรุงล่าสุด {post.updatedAt}
        </p>
      </div>

      {/* Comments Section */}
      <div className="px-4 py-5 flex-1">
        <h3 className="font-bold text-[15px] text-slate-800 mb-5">
          {post.commentsCount} ความคิดเห็น
        </h3>

        <div className="space-y-5">
          {post.comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <img
                src={comment.avatar}
                alt={comment.user}
                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[13px] font-medium text-slate-500">
                    {comment.user}
                  </span>
                  <button className="text-slate-400">
                    <Icon
                      name="favorite_border"
                      className="w-[18px] h-[18px]"
                    />
                  </button>
                </div>
                <p className="text-[14px] text-slate-800 leading-relaxed mb-1">
                  {comment.text}
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-[12px] text-slate-400">
                    {comment.date}
                  </span>
                  <button className="text-[12px] font-bold text-slate-600">
                    ตอบกลับ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="sticky bottom-0 bg-white border-t border-slate-100 px-4 py-2.5 pb-safe-bottom">
        {/* Fake Comment Input Box */}
        <div className="bg-[#F6F6F6] rounded-xl flex items-center px-4 py-2.5 mb-3">
          <input
            type="text"
            placeholder="แสดงความคิดเห็นตอนนี้!"
            className="bg-transparent flex-1 text-[14px] outline-none placeholder:text-slate-400 text-slate-800"
          />
          <div className="flex items-center gap-1.5 text-[18px] ml-2">
            <span>🍋</span>
            <span>🥰</span>
            <span>🤩</span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center justify-between pb-1">
          <button className="flex items-center gap-2 text-slate-800">
            <Icon name="bookmark_border" className="w-[22px] h-[22px]" />
            <span className="text-[13px] font-bold">
              {post.saves} คนบันทึกแล้ว
            </span>
          </button>

          <div className="flex items-center gap-5">
            <button className="flex items-center gap-1.5 text-slate-800">
              <Icon name="favorite_border" className="w-[22px] h-[22px]" />
              <span className="text-[13px] font-medium opacity-90">
                {post.likes}
              </span>
            </button>
            <button className="flex items-center gap-1.5 text-slate-800">
              <Icon name="chat_bubble_outline" className="w-[20px] h-[20px]" />
              <span className="text-[13px] font-medium opacity-90">
                {post.commentsCount}
              </span>
            </button>
            <button className="text-slate-800">
              <Icon name="ios_share" className="w-[22px] h-[22px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
