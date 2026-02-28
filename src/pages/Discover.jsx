import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { adjustRecipeByAI } from "@/lib/openai";
import { localStore } from "@/api/apiStore";
import { createPageUrl } from "@/utils";
import Icon from "@/components/ui/Icon";
import {
  getBehaviorTrackingConfig,
  trackSwipeEvent,
  trackAdjustmentEvent,
} from "@/api/behaviorAnalytics";
import { useAuth } from "@/lib/AuthContext";

import MenuCard from "@/components/swipe/MenuCard";
import SwipeActions from "@/components/swipe/SwipeActions";
import RegionFilter from "@/components/swipe/RegionFilter";
import MoodSelector from "@/components/swipe/MoodSelector";

const fallbackImagesByRegion = {
  north:
    "https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=800&q=80",
  northeast:
    "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800&q=80",
  central:
    "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80",
  south:
    "https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=800&q=80",
  default:
    "https://images.unsplash.com/photo-1559847844-d721426d6edc?w=800&q=80",
};

function getSodiumLevel(menu) {
  if (menu.sodium_level) return menu.sodium_level;
  if (typeof menu.sodium_mg !== "number") return "medium";
  if (menu.sodium_mg >= 900) return "high";
  if (menu.sodium_mg >= 500) return "medium";
  return "low";
}

function normalizeMenu(menu) {
  const calories = menu.calories ?? 280;
  const region = menu.region || "central";

  return {
    id: String(menu.id),
    name_th: menu.name_th || menu.name || "เมนูอาหารไทย",
    name_en: menu.name_en || menu.name || "Thai Dish",
    region,
    image_url:
      menu.image_url ||
      fallbackImagesByRegion[region] ||
      fallbackImagesByRegion.default,
    spice_level: menu.spice_level ?? 3,
    health_score: menu.health_score ?? 70,
    sodium_level: getSodiumLevel(menu),
    calories,
    protein: menu.protein ?? Math.max(8, Math.round(calories * 0.08)),
    carbs: menu.carbs ?? Math.max(12, Math.round(calories * 0.12)),
    fat: menu.fat ?? Math.max(6, Math.round(calories * 0.05)),
  };
}

// Sample menus for demo
const sampleMenus = [
  {
    id: "1",
    name_th: "ข้าวซอยไก่",
    name_en: "Khao Soi Chicken",
    region: "north",
    image_url:
      "https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=800&q=80",
    spice_level: 3,
    health_score: 72,
    sodium_level: "high",
    calories: 520,
    protein: 28,
    carbs: 55,
    fat: 18,
  },
  {
    id: "2",
    name_th: "ส้มตำปลาร้า",
    name_en: "Som Tam Pla Ra",
    region: "northeast",
    image_url:
      "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800&q=80",
    spice_level: 5,
    health_score: 68,
    sodium_level: "high",
    calories: 280,
    protein: 12,
    carbs: 35,
    fat: 8,
  },
  {
    id: "3",
    name_th: "แกงเขียวหวานไก่",
    name_en: "Green Curry Chicken",
    region: "central",
    image_url:
      "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80",
    spice_level: 4,
    health_score: 75,
    sodium_level: "medium",
    calories: 450,
    protein: 32,
    carbs: 25,
    fat: 22,
  },
  {
    id: "4",
    name_th: "แกงส้มปลา",
    name_en: "Sour Curry Fish",
    region: "south",
    image_url:
      "https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=800&q=80",
    spice_level: 4,
    health_score: 82,
    sodium_level: "medium",
    calories: 320,
    protein: 28,
    carbs: 18,
    fat: 14,
  },
  {
    id: "5",
    name_th: "ไก่ย่าง",
    name_en: "Grilled Chicken",
    region: "northeast",
    image_url:
      "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80",
    spice_level: 2,
    health_score: 88,
    sodium_level: "low",
    calories: 380,
    protein: 42,
    carbs: 5,
    fat: 18,
  },
];

const quickPrompts = [
  { label: "🧂 ลดเค็ม", prompt: "ลดโซเดียมลงให้มากที่สุด แต่ยังคงรสชาติ" },
  { label: "💪 เพิ่มโปรตีน", prompt: "เพิ่มโปรตีนให้เหมาะกับคนออกกำลังกาย" },
  { label: "🌿 คลีน", prompt: "ทำให้เป็นสูตรคลีน ไม่ใส่ผงชูรส ไม่ใส่น้ำตาล" },
  { label: "👶 เด็กกินได้", prompt: "ปรับสูตรให้เด็กกินได้ ลดเผ็ด ลดเค็ม" },
];

const syncStyles = {
  idle: "border-slate-200 bg-white text-slate-600",
  sending: "border-sky-200 bg-sky-50 text-sky-700",
  sent: "border-emerald-200 bg-emerald-50 text-emerald-700",
  queued: "border-amber-200 bg-amber-50 text-amber-700",
  disabled: "border-slate-200 bg-slate-100 text-slate-600",
  skipped: "border-slate-200 bg-slate-100 text-slate-600",
  error: "border-rose-200 bg-rose-50 text-rose-700",
};

const syncIcons = {
  idle: "sync",
  sending: "sync",
  sent: "check_circle",
  queued: "schedule",
  disabled: "block",
  skipped: "warning",
  error: "error",
};

export default function Discover() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const trackingConfig = getBehaviorTrackingConfig();
  const [menus, setMenus] = useState(sampleMenus.map(normalizeMenu));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedMood, setSelectedMood] = useState(null);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [modifications, setModifications] = useState([]);
  const [tasteRetention, setTasteRetention] = useState(85);
  const [impacts, setImpacts] = useState({ sodium: -22, sugar: -15, calories: -10, bp_risk: -6 });
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [defaultLoading, setDefaultLoading] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);
  const textareaRef = useRef(null);
  const [syncDebug, setSyncDebug] = useState({
    status: trackingConfig.enabled ? "idle" : "disabled",
    message: trackingConfig.enabled
      ? "รอการปัดเพื่อส่งเข้า Neo4j"
      : "ปิดการส่งพฤติกรรม (tracking disabled)",
    at: null,
  });

  useEffect(() => {
    loadData();
  }, [authUser?.id]);

  useEffect(() => {
    setModifications([]);
    setTasteRetention(85);
    setShowAiInput(false);
    setAiPrompt("");

    const menu = filteredMenus[currentIndex];
    if (!menu) return;

    let cancelled = false;
    setDefaultLoading(true);

    adjustRecipeByAI(menu, "แสดงสูตรอาหารต้นตำรับพร้อมส่วนผสมและวิธีทำแบบดั้งเดิม", userProfile)
      .then((result) => {
        if (!cancelled) {
          setModifications(result.modifications);
          setTasteRetention(result.tasteRetention);
        }
      })
      .catch((err) => console.error("Default recipe error:", err))
      .finally(() => { if (!cancelled) setDefaultLoading(false); });

    return () => { cancelled = true; };
  }, [currentIndex, selectedRegion]);

  const loadData = async () => {
    try {
      // Load user profile
      if (authUser?.id) {
        const currentProfile = await localStore.entities.UserProfile.get(authUser.id).catch(() => null);
        if (currentProfile) {
          setUserProfile(currentProfile);
        }
      } else {
        const profiles = await localStore.entities.UserProfile.list();
        if (profiles.length > 0) {
          setUserProfile(profiles[0]);
        }
      }

      // Load menus from database
      const dbMenus = await localStore.entities.Menu.list();
      if (dbMenus.length > 0) {
        setMenus(dbMenus.map(normalizeMenu));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const filteredMenus = menus.filter((menu) => {
    if (selectedRegion !== "all" && menu.region !== selectedRegion)
      return false;
    return true;
  });

  const handleSwipe = async (swipeInput) => {
    const action =
      typeof swipeInput === "string" ? swipeInput : swipeInput?.action;
    const source =
      typeof swipeInput === "string"
        ? "button"
        : swipeInput?.source || "button";
    const currentUserId = authUser?.id || userProfile?.id || null;
    const currentMenu = filteredMenus[currentIndex];
    if (!currentMenu || !action) return;

    // Log swipe action
    try {
      await localStore.entities.MenuSwipe.create({
        user_id: currentUserId,
        menu_id: currentMenu.id,
        direction: action,
      });
    } catch (error) {
      console.error("Error logging swipe:", error);
    }

    setSyncDebug({
      status: "sending",
      message: `กำลังส่ง ${action} ไป Neo4j...`,
      at: new Date().toISOString(),
    });

    void (async () => {
      try {
        const result = await trackSwipeEvent({
          userId: currentUserId,
          menu: currentMenu,
          action,
          source,
          selectedRegion,
          mood: selectedMood,
        });

        const at = new Date().toISOString();
        if (result?.status === "sent") {
          setSyncDebug({
            status: "sent",
            message: `ส่งสำเร็จ: ${action} (${result.userId || "unknown user"})`,
            at,
          });
          return;
        }

        if (result?.status === "queued") {
          setSyncDebug({
            status: "queued",
            message: `ส่งไม่สำเร็จ เก็บเข้าคิวไว้: ${action}`,
            at,
          });
          return;
        }

        if (result?.status === "disabled") {
          setSyncDebug({
            status: "disabled",
            message: "ปิดการส่งพฤติกรรม (tracking disabled)",
            at,
          });
          return;
        }

        if (result?.status === "skipped") {
          setSyncDebug({
            status: "skipped",
            message: `ข้ามการส่ง: ${result.reason || "unknown reason"}`,
            at,
          });
          return;
        }

        setSyncDebug({
          status: "error",
          message: "ไม่ทราบสถานะการส่งไป Neo4j",
          at,
        });
      } catch (error) {
        setSyncDebug({
          status: "error",
          message: `ส่งผิดพลาด: ${error?.message || "unknown error"}`,
          at: new Date().toISOString(),
        });
      }
    })();

    if (currentIndex < filteredMenus.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleAiPrompt = async (prompt) => {
    if (!prompt.trim() || !currentMenu) return;
    setAiLoading(true);
    try {
      const result = await adjustRecipeByAI(currentMenu, prompt, userProfile);
      setModifications(result.modifications);
      setTasteRetention(result.tasteRetention);
      void trackAdjustmentEvent({
        menu: currentMenu,
        adjustType: "ai_prompt",
        source: "ai",
        prompt,
        impacts,
        tasteRetention: result.tasteRetention,
      });
      setAiPrompt("");
      setShowAiInput(false);
      toast.success("AI ปรับสูตรเรียบร้อย!");
    } catch (error) {
      console.error("AI adjustment error:", error);
      toast.error("ไม่สามารถปรับสูตรด้วย AI ได้ กรุณาลองใหม่");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAction = (actionType) => {
    if (actionType === "swap") {
      setShowAiInput(true);
      setTimeout(() => textareaRef.current?.focus(), 100);
    } else if (actionType === "menu") {
      const currentMenu = filteredMenus[currentIndex];
      if (!currentMenu?.region) return;
      setSelectedRegion(currentMenu.region);
      setCurrentIndex(0);
    } else if (
      actionType === "like" ||
      actionType === "dislike" ||
      actionType === "save"
    ) {
      handleSwipe({
        action: actionType === "save" ? "save" : actionType,
        source: "button",
      });
    }
  };

  const currentMenu = filteredMenus[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F5E9] to-[#FFFFFF] pt-12 pb-24">
      <div className="max-w-sm mx-auto px-4">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">
            ค้นหาเมนูวันนี้
          </h1>
          <p className="text-sm text-slate-500">
            ปัดซ้าย-ขวา เพื่อเลือกเมนูที่ชอบ
          </p>
        </div>

        {/* Region Filter */}
        <div className="mt-6 flex items-center gap-2">
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <RegionFilter
              selected={selectedRegion}
              onSelect={setSelectedRegion}
            />
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
          {filteredMenus
            .slice(currentIndex + 1, currentIndex + 3)
            .map((menu, index) => (
              <div
                key={menu.id}
                className="absolute w-full h-full"
                style={{
                  transform: `scale(${1 - (index + 1) * 0.05}) translateY(${(index + 1) * 10}px)`,
                  zIndex: -index - 1,
                  opacity: 1 - (index + 1) * 0.3,
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

        <div className="mt-3">
          <button
            onClick={() => handleAction("menu")}
            className="w-full rounded-2xl border border-cyan-200 bg-cyan-50 px-3 py-2.5 text-xs font-semibold text-cyan-700 flex items-center justify-center gap-1.5"
          >
            <Icon name="filter_alt" className="w-4 h-4" />
            ดูเมนูคล้ายกัน
          </button>
        </div>

        {/* Modifications Result */}
        {(defaultLoading || modifications.length > 0) && (
          <div className="mt-3 bg-emerald-50 rounded-2xl border border-emerald-100 px-4 py-4">
            <h3 className="text-sm font-bold text-emerald-800 mb-3">
              {defaultLoading ? "กำลังโหลดสูตรอาหาร..." : "สูตรอาหาร ✨"}
            </h3>

            {defaultLoading && (
              <div className="space-y-2.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-2 items-start animate-pulse">
                    <div className="w-4 h-4 bg-emerald-200 rounded-full flex-shrink-0 mt-0.5" />
                    <div className={`h-3 bg-emerald-200 rounded-full ${i % 2 === 0 ? "w-3/4" : "w-full"}`} />
                  </div>
                ))}
              </div>
            )}

            {!defaultLoading && (
              <>
                {/* Taste retention bar */}
                <div className="mb-3 bg-emerald-100/60 rounded-xl p-3">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold text-emerald-800">🎯 คงรสชาติ</span>
                    <span className="text-sm font-black text-emerald-700">{tasteRetention}%</span>
                  </div>
                  <div className="h-2 bg-emerald-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${tasteRetention}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {modifications.map((mod, idx) => {
                    let emoji = "✅";
                    if (mod.includes("น้ำปลา") || mod.includes("โซเดียม") || mod.includes("เค็ม")) emoji = "🧂";
                    else if (mod.includes("ผัก") || mod.includes("ออร์แกนิค")) emoji = "🥦";
                    else if (mod.includes("ผงชูรส")) emoji = "🥄";
                    else if (mod.includes("น้ำตาล")) emoji = "🍯";
                    else if (mod.includes("ไข่") || mod.includes("กุ้ง") || mod.includes("โปรตีน")) emoji = "🍳";
                    else if (mod.includes("เผ็ด")) emoji = "🌶️";
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex gap-2 items-start"
                      >
                        <span className="text-sm leading-tight mt-0.5 flex-shrink-0">{emoji}</span>
                        <span className="text-emerald-900 font-medium text-xs leading-snug">{mod}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Inline AI Recipe Section */}
        <div className="mt-3 bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Icon name="auto_awesome" className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">ปรับสูตรด้วย AI</h3>
                <p className="text-xs text-slate-500">บอก AI ว่าอยากปรับยังไง</p>
              </div>
            </div>

            {/* Current menu context */}
            {currentMenu && (
              <div className="bg-slate-50 rounded-xl p-3 mb-3 flex items-center gap-3">
                <img
                  src={currentMenu.image_url}
                  alt={currentMenu.name_th}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-800 truncate">{currentMenu.name_th}</p>
                  <p className="text-xs text-slate-500">{currentMenu.calories} kcal • โซเดียม: {currentMenu.sodium_level}</p>
                </div>
              </div>
            )}

            {/* Quick prompt chips */}
            <div className="flex flex-wrap gap-2 mb-3">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setAiPrompt(qp.prompt);
                    setShowAiInput(true);
                    setTimeout(() => textareaRef.current?.focus(), 100);
                  }}
                  disabled={aiLoading}
                  className="px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-medium rounded-full border border-violet-100 transition-all disabled:opacity-50"
                >
                  {qp.label}
                </button>
              ))}
            </div>

            {/* Toggle textarea button */}
            {!showAiInput && (
              <button
                onClick={() => setShowAiInput(true)}
                className="w-full py-2.5 rounded-xl border border-violet-200 text-violet-600 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-violet-50 transition-colors"
              >
                <Icon name="edit" className="w-3.5 h-3.5" />
                พิมพ์คำขอของคุณเอง
              </button>
            )}

            {/* Textarea + submit */}
            {showAiInput && (
              <>
                <textarea
                  ref={textareaRef}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAiPrompt(aiPrompt);
                    }
                  }}
                  disabled={aiLoading}
                  placeholder='เช่น "ลดโซเดียมลง ไม่ใส่ผงชูรส" หรือ "เพิ่มโปรตีน"'
                  rows={3}
                  className="w-full resize-none rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 transition-all disabled:opacity-50"
                />
                <button
                  onClick={() => handleAiPrompt(aiPrompt)}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className={`w-full mt-2 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    aiPrompt.trim() && !aiLoading
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-200 active:scale-[0.98]"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {aiLoading ? (
                    <>
                      <Icon name="progress_activity" className="w-5 h-5 animate-spin" />
                      กำลังปรับสูตร...
                    </>
                  ) : (
                    <>
                      <Icon name="auto_awesome" className="w-5 h-5" />
                      ปรับสูตรด้วย AI
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        

        {/* Hint */}
        <div className="bg-white rounded-2xl p-3 mt-4 border border-slate-100">
          <p className="text-center text-xs text-slate-500">
            ❌ ปัดซ้าย = ไม่สนใจ • ✅ ปัดขวา = ชอบ
          </p>
        </div>

        <div
          className={`rounded-2xl p-3 mt-3 border ${syncStyles[syncDebug.status] || syncStyles.idle}`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Icon
                name={syncIcons[syncDebug.status] || syncIcons.idle}
                className={`w-4 h-4 ${syncDebug.status === "sending" ? "animate-spin" : ""}`}
              />
              <p className="text-xs font-semibold truncate">
                Neo4j Sync: {syncDebug.status.toUpperCase()}
              </p>
            </div>
            <span className="text-[10px] opacity-80">
              {syncDebug.at
                ? new Date(syncDebug.at).toLocaleTimeString("th-TH", {
                    hour12: false,
                  })
                : "--:--:--"}
            </span>
          </div>
          <p className="text-[11px] mt-1 opacity-90">{syncDebug.message}</p>
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
