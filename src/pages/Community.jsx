import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { localStore } from "@/api/apiStore";
import Icon from "@/components/ui/Icon";
import PostCard from "@/components/community/PostCard";
import ChallengeCard from "@/components/community/ChallengeCard";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const tabs = [
  { key: "challenges", label: "ชาเลนจ์", icon: "emoji_events" },
  { key: "leaderboard", label: "อันดับ", icon: "group" },
];

export default function Community() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("challenges");
  const [posts, setPosts] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [joinedChallenges, setJoinedChallenges] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostData, setNewPostData] = useState({
    menu_name: "",
    caption: "",
    sodium_reduced: "",
    image_url: "",
  });
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [postsData, challengesData, participantsData, provincesData] =
        await Promise.all([
          localStore.entities.CommunityPost.list(),
          localStore.entities.Challenge.list(),
          localStore.entities.ChallengeParticipant.list(),
          localStore.entities.ProvinceScore.list(),
        ]);
      setPosts(
        postsData.sort(
          (a, b) =>
            new Date(b.created_date).getTime() -
            new Date(a.created_date).getTime(),
        ),
      );
      setChallenges(challengesData);
      setParticipants(participantsData);
      setJoinedChallenges(participantsData.map((p) => p.challenge_id));
      setProvinces(provincesData);
    } catch (error) {
      console.error("Error loading community data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheer = async (postId) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, cheer_count: (p.cheer_count || 0) + 1 } : p,
      ),
    );
    const post = posts.find((p) => p.id === postId);
    if (post) {
      await localStore.entities.CommunityPost.update(postId, {
        cheer_count: (post.cheer_count || 0) + 1,
      });
    }
  };

  const handleJoinChallenge = async (challengeId) => {
    if (joinedChallenges.includes(challengeId)) return;

    await localStore.entities.ChallengeParticipant.create({
      challenge_id: challengeId,
      progress: 0,
      completed: false,
      days_completed: 0,
    });

    // Update participant count
    const challenge = challenges.find((c) => c.id === challengeId);
    if (challenge) {
      await localStore.entities.Challenge.update(challengeId, {
        participant_count: (challenge.participant_count || 0) + 1,
      });
      setChallenges((prev) =>
        prev.map((c) =>
          c.id === challengeId
            ? { ...c, participant_count: (c.participant_count || 0) + 1 }
            : c,
        ),
      );
    }

    setJoinedChallenges((prev) => [...prev, challengeId]);
    setParticipants((prev) => [
      ...prev,
      { challenge_id: challengeId, progress: 0 },
    ]);
  };

  const handleCreatePost = async () => {
    if (!newPostData.menu_name) return;
    setPosting(true);
    try {
      const newPost = await localStore.entities.CommunityPost.create({
        menu_name: newPostData.menu_name,
        caption: newPostData.caption,
        sodium_reduced: newPostData.sodium_reduced
          ? Number(newPostData.sodium_reduced)
          : undefined,
        image_url:
          newPostData.image_url ||
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
        region: "central",
        province: "กรุงเทพ",
        cheer_count: 0,
        created_by: "คุณ",
      });
      setPosts((prev) => [newPost, ...prev]);
      setNewPostData({
        menu_name: "",
        caption: "",
        sodium_reduced: "",
        image_url: "",
      });
      setShowNewPost(false);
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setPosting(false);
    }
  };

  const getTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "เมื่อสักครู่";
    if (hours < 24) return `${hours} ชม. ที่แล้ว`;
    const days = Math.floor(hours / 24);
    return `${days} วันที่แล้ว`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-white">
      <div className="max-w-sm mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">วงข้าว</h1>
            <p className="text-sm text-slate-500">ชุมชนคนรักสุขภาพ</p>
          </div>
          <button
            onClick={() => setShowNewPost(true)}
            className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-200 active:scale-95 transition-transform"
          >
            <Icon name="add" className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl p-1 flex gap-1 mb-5 shadow-sm border border-slate-100">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-teal-600 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon name={tab.icon} className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "challenges" && (
            <motion.div
              key="challenges"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Active challenges header */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Icon
                    name="emoji_events"
                    className="w-4 h-4 text-amber-700"
                  />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800">
                    ชาเลนจ์ที่เปิดอยู่
                  </h2>
                  <p className="text-xs text-slate-500">
                    {challenges.filter((c) => c.status === "active").length}{" "}
                    ชาเลนจ์ • เข้าร่วมแล้ว {joinedChallenges.length}
                  </p>
                </div>
              </div>

              {/* My challenges */}
              {joinedChallenges.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-teal-700 mb-2 flex items-center gap-1">
                    <Icon name="local_fire_department" className="w-4 h-4" />
                    ชาเลนจ์ของฉัน
                  </h3>
                  <div className="space-y-3">
                    {challenges
                      .filter((c) => joinedChallenges.includes(c.id))
                      .map((challenge) => {
                        const participant = participants.find(
                          (p) => p.challenge_id === challenge.id,
                        );
                        return (
                          <ChallengeCard
                            key={challenge.id}
                            challenge={challenge}
                            isJoined={true}
                            progress={
                              participant?.progress ||
                              Math.floor(Math.random() * 60 + 10)
                            }
                            onJoin={handleJoinChallenge}
                          />
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Available challenges */}
              <div>
                <h3 className="text-sm font-semibold text-slate-600 mb-2">
                  {joinedChallenges.length > 0
                    ? "ชาเลนจ์อื่นๆ"
                    : "เลือกชาเลนจ์ที่สนใจ"}
                </h3>
                <div className="space-y-3">
                  {challenges
                    .filter((c) => !joinedChallenges.includes(c.id))
                    .map((challenge) => (
                      <ChallengeCard
                        key={challenge.id}
                        challenge={challenge}
                        isJoined={false}
                        progress={0}
                        onJoin={handleJoinChallenge}
                      />
                    ))}
                </div>
              </div>

              {joinedChallenges.length === challenges.length && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 text-center border border-amber-100">
                  <span className="text-3xl">🎉</span>
                  <p className="font-semibold text-slate-800 mt-2">
                    เข้าร่วมครบทุกชาเลนจ์แล้ว!
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    สู้ๆ ทำให้สำเร็จทุกอันนะ
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "leaderboard" && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Sodium impact stats */}
              <div className="space-y-3">
                {/* Top Row: Total Sodium Reduced */}
                <div className="bg-[#EBF3FF] rounded-[24px] p-5 border border-[#DEECFE] flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-semibold text-slate-500 mb-1">
                      ผลกระทบรวมของชุมชน
                    </p>
                    <h3 className="text-[20px] font-black text-slate-800 leading-tight pr-4">
                      ลดโซเดียมไปแล้วกว่า
                    </h3>
                    <div className="flex items-center gap-2 mt-3 bg-white rounded-full px-4 py-1.5 w-max shadow-sm border border-slate-100">
                      <Icon
                        name="trending_down"
                        className="w-[18px] h-[18px] text-[#418774]"
                      />
                      <span className="font-bold text-[#418774] text-[15px]">
                        {(
                          provinces.reduce(
                            (sum, p) => sum + (p.total_sodium_reduced || 0),
                            0,
                          ) / 1000
                        ).toFixed(1)}
                        g
                      </span>
                    </div>
                  </div>
                  {/* Decorative icon mimicking the bird */}
                  <div className="w-[85px] h-[85px] bg-[#D1E4FF] rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon
                      name="health_and_safety"
                      className="w-12 h-12 text-[#2B6CB0]"
                    />
                  </div>
                </div>

                {/* Bottom Row: 3 Columns */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Column 1: Participants */}
                  <div className="bg-[#EBF5F8] rounded-[20px] p-4 flex flex-col items-center justify-center text-center border border-[#DEEDF0] h-[120px]">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm">
                      <Icon name="groups" className="w-5 h-5 text-[#3182CE]" />
                    </div>
                    <p className="text-[17px] font-black text-slate-800 leading-none mb-1">
                      {provinces.reduce(
                        (sum, p) => sum + (p.participant_count || 0),
                        0,
                      )}
                    </p>
                    <p className="text-[11px] font-medium text-slate-500">
                      ผู้เข้าร่วม
                    </p>
                  </div>

                  {/* Column 2: Provinces */}
                  <div className="bg-[#FFF0F2] rounded-[20px] p-4 flex flex-col items-center justify-center text-center border border-[#FBE3E6] h-[120px]">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm">
                      <Icon name="map" className="w-5 h-5 text-[#E53E3E]" />
                    </div>
                    <p className="text-[17px] font-black text-slate-800 leading-none mb-1">
                      {provinces.length}
                    </p>
                    <p className="text-[11px] font-medium text-slate-500">
                      จังหวัด
                    </p>
                  </div>

                  {/* Column 3: Active Challenges */}
                  <div className="bg-[#FFF5E6] rounded-[20px] p-4 flex flex-col items-center justify-center text-center border border-[#FCEBDB] h-[120px]">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm">
                      <Icon
                        name="emoji_events"
                        className="w-5 h-5 text-[#DD6B20]"
                      />
                    </div>
                    <p className="text-[17px] font-black text-slate-800 leading-none mb-1">
                      {challenges.filter((c) => c.status === "active").length}
                    </p>
                    <p className="text-[11px] font-medium text-slate-500">
                      ชาเลนจ์
                    </p>
                  </div>
                </div>
              </div>

              {/* All provinces list - Redesigned Leaderboard */}
              <div className="bg-[#C0EDD0] rounded-[32px] p-5 shadow-lg relative overflow-hidden mt-2">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>

                <div className="relative z-10 flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800 text-[22px] tracking-tight">
                    Leaderboard
                  </h3>
                  <div className="bg-[#3D7A61] rounded-full p-1 flex">
                    <button className="px-4 py-1.5 bg-white text-[#4A8B71] rounded-full text-xs font-bold shadow-sm">
                      Weekly
                    </button>
                    <button className="px-4 py-1.5 text-white/80 rounded-full text-xs font-medium">
                      Month
                    </button>
                  </div>
                </div>

                <div className="space-y-3 relative z-10 w-full overflow-x-hidden p-1 -mx-1">
                  {[...provinces]
                    .sort(
                      (a, b) =>
                        (b.total_sodium_reduced || 0) -
                        (a.total_sodium_reduced || 0),
                    )
                    .map((prov, index) => {
                      const isFirst = index === 0;
                      const isSecond = index === 1;
                      const isThird = index === 2;

                      const getPillColor = () => {
                        if (isFirst) return "bg-[#F26E7E]";
                        if (isSecond) return "bg-[#F9F5EC]";
                        if (isThird) return "bg-[#FBB936]";
                        return "bg-[#3D7A61]";
                      };

                      const getTextColor = () => {
                        if (isSecond) return "text-slate-800";
                        return "text-white";
                      };

                      const avatars = [
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
                        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
                        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
                        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
                        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop",
                        "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=100&h=100&fit=crop",
                      ];

                      return (
                        <div
                          key={prov.id}
                          className="relative flex items-center h-[68px] rounded-[32px] p-2 bg-[#438368] overflow-visible shadow-sm"
                          style={{
                            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)`,
                          }}
                        >
                          {/* Left colored blob */}
                          <div
                            className={`absolute left-0 top-0 bottom-0 w-[60%] rounded-l-[32px] rounded-r-[24px] ${getPillColor()} z-0`}
                          />

                          {/* Tiny decorative pill on the right of the left blob */}
                          {(isFirst || isThird) && (
                            <div
                              className={`absolute left-[58%] top-1/2 -translate-y-1/2 w-[14px] h-[36px] rounded-full ${getPillColor()} opacity-90 z-0 border-[3px] border-[#438368]/20`}
                            />
                          )}

                          {/* Content wrapper */}
                          <div className="relative z-10 flex w-full h-full items-center justify-between px-1">
                            {/* Left info */}
                            <div className="flex items-center gap-2">
                              <div className="w-[18px] flex justify-center ml-1">
                                <Icon
                                  name="visibility"
                                  className={`w-[18px] h-[18px] ${getTextColor()} opacity-80`}
                                />
                              </div>
                              <span
                                className={`text-[20px] font-black ${getTextColor()} tracking-tighter`}
                              >
                                #{index + 1}
                              </span>
                              <div className="ml-2 flex flex-col justify-center max-w-[70px]">
                                <span
                                  className={`text-[13px] font-bold truncate ${getTextColor()}`}
                                >
                                  {prov.province}
                                </span>
                              </div>
                            </div>

                            {/* Right info */}
                            <div className="flex items-center gap-1.5">
                              {/* Score circle */}
                              <div
                                className={`w-[44px] h-[44px] rounded-full bg-white flex items-center justify-center shadow-sm border-[2px] ${isSecond ? "border-[#4A8B71]" : "border-transparent"}`}
                              >
                                <span className="text-[13px] font-black text-slate-800 tracking-tighter flex items-end leading-none gap-[1px]">
                                  {(prov.total_sodium_reduced / 1000).toFixed(
                                    0,
                                  )}
                                  <span className="text-[10px] font-bold mb-[1px]">
                                    g
                                  </span>
                                </span>
                              </div>
                              {/* Avatar */}
                              <div className="w-[44px] h-[44px] rounded-full border-2 border-transparent overflow-hidden shadow-sm flex-shrink-0">
                                <img
                                  src={avatars[index % avatars.length]}
                                  className="w-full h-full object-cover"
                                  alt={prov.province}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* New Post Modal */}
      <AnimatePresence>
        {showNewPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center"
            onClick={() => setShowNewPost(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-3xl w-full max-w-sm p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-800">
                  แชร์เมนูสุขภาพ
                </h2>
                <button
                  onClick={() => setShowNewPost(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
                >
                  <Icon name="close" className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">
                    ชื่อเมนู *
                  </label>
                  <input
                    type="text"
                    value={newPostData.menu_name}
                    onChange={(e) =>
                      setNewPostData((prev) => ({
                        ...prev,
                        menu_name: e.target.value,
                      }))
                    }
                    placeholder="เช่น ส้มตำลดเค็ม"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">
                    เล่าให้ฟังหน่อย
                  </label>
                  <textarea
                    value={newPostData.caption}
                    onChange={(e) =>
                      setNewPostData((prev) => ({
                        ...prev,
                        caption: e.target.value,
                      }))
                    }
                    placeholder="สูตรนี้ดียังไง ทำยังไง..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">
                    ลดเค็มได้กี่ %
                  </label>
                  <input
                    type="number"
                    value={newPostData.sodium_reduced}
                    onChange={(e) =>
                      setNewPostData((prev) => ({
                        ...prev,
                        sodium_reduced: e.target.value,
                      }))
                    }
                    placeholder="เช่น 25"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">
                    URL รูปภาพ
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPostData.image_url}
                      onChange={(e) =>
                        setNewPostData((prev) => ({
                          ...prev,
                          image_url: e.target.value,
                        }))
                      }
                      placeholder="https://..."
                      className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    <button className="w-12 h-12 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400">
                      <Icon name="photo_camera" className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleCreatePost}
                  disabled={!newPostData.menu_name || posting}
                  className={`w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    newPostData.menu_name && !posting
                      ? "bg-teal-600 text-white hover:bg-teal-700 active:scale-[0.98]"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {posting ? (
                    <Icon
                      name="progress_activity"
                      className="w-4 h-4 animate-spin"
                    />
                  ) : (
                    <>โพสต์เลย 🎉</>
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
