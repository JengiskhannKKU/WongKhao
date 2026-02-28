import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { localStore } from "@/api/apiStore";
import Icon from "@/components/ui/Icon";
import { useNavigate } from "react-router-dom";

export default function Community() {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [challengesData, provincesData] = await Promise.all([
        localStore.entities.Challenge.list(),
        localStore.entities.ProvinceScore.list(),
      ]);
      setChallenges(challengesData);
      setProvinces(provincesData);
    } catch (error) {
      console.error("Error loading community data:", error);
    } finally {
      setLoading(false);
    }
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

  const avatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop",
    "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=100&h=100&fit=crop",
  ];

  const getPillColor = (index) => {
    if (index === 0) return "bg-[#F26E7E]";
    if (index === 1) return "bg-[#F9F5EC]";
    if (index === 2) return "bg-[#FBB936]";
    return "bg-[#3D7A61]";
  };

  const getTextColor = (index) => {
    if (index === 1) return "text-slate-800";
    return "text-white";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-white">
      <div className="max-w-sm mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">วงข้าว</h1>
            <p className="text-sm text-slate-500">ชุมชนคนรักสุขภาพ</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200 flex items-center justify-center">
            <Icon name="leaderboard" className="w-5 h-5 text-amber-700" />
          </div>
        </div>

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
            <div className="w-[85px] h-[85px] bg-[#D1E4FF] rounded-full flex items-center justify-center flex-shrink-0">
              <Icon
                name="health_and_safety"
                className="w-12 h-12 text-[#2B6CB0]"
              />
            </div>
          </div>

          {/* Bottom Row: 3 Columns */}
          <div className="grid grid-cols-3 gap-3">
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

        {/* Leaderboard */}
        <div className="bg-[#C0EDD0] rounded-[32px] p-5 shadow-lg relative overflow-hidden mt-4">
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

                return (
                  <div
                    key={prov.id}
                    className="relative flex items-center h-[68px] rounded-[32px] p-2 bg-[#438368] overflow-visible shadow-sm"
                    style={{
                      backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)`,
                    }}
                  >
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-[60%] rounded-l-[32px] rounded-r-[24px] ${getPillColor(index)} z-0`}
                    />

                    {(isFirst || isThird) && (
                      <div
                        className={`absolute left-[58%] top-1/2 -translate-y-1/2 w-[14px] h-[36px] rounded-full ${getPillColor(index)} opacity-90 z-0 border-[3px] border-[#438368]/20`}
                      />
                    )}

                    <div className="relative z-10 flex w-full h-full items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <div className="w-[18px] flex justify-center ml-1">
                          <Icon
                            name="visibility"
                            className={`w-[18px] h-[18px] ${getTextColor(index)} opacity-80`}
                          />
                        </div>
                        <span
                          className={`text-[20px] font-black ${getTextColor(index)} tracking-tighter`}
                        >
                          #{index + 1}
                        </span>
                        <div className="ml-2 flex flex-col justify-center max-w-[70px]">
                          <span
                            className={`text-[13px] font-bold truncate ${getTextColor(index)}`}
                          >
                            {prov.province}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-[44px] h-[44px] rounded-full bg-white flex items-center justify-center shadow-sm border-[2px] ${isSecond ? "border-[#4A8B71]" : "border-transparent"}`}
                        >
                          <span className="text-[13px] font-black text-slate-800 tracking-tighter flex items-end leading-none gap-[1px]">
                            {(prov.total_sodium_reduced / 1000).toFixed(0)}
                            <span className="text-[10px] font-bold mb-[1px]">
                              g
                            </span>
                          </span>
                        </div>
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
      </div>
    </div>
  );
}
