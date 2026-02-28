import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { localStore } from "@/api/apiStore";
import { createPageUrl } from "@/utils";
import Icon from "@/components/ui/Icon";
import {
  getBehaviorTrackingConfig,
  trackSwipeEvent,
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

  const loadData = async () => {
    try {
      // Load user profile
      if (authUser?.id) {
        const currentProfile = await localStore.entities.UserProfile.get(
          authUser.id,
        ).catch(() => null);
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

  const handleAction = (actionType) => {
    if (actionType === "swap" || actionType === "recipe") {
      const currentMenu = filteredMenus[currentIndex];
      navigate(createPageUrl("Recommendation") + `?menuId=${currentMenu.id}`);
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
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">
              ค้นหาเมนูวันนี้
            </h1>
            <p className="text-sm text-slate-500">
              ปัดซ้าย-ขวา เพื่อเลือกเมนูที่ชอบ
            </p>
          </div>

          {/* Premium Stage Indicator */}
          <div className="flex flex-col items-end">
            <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 bg-[length:200%_auto] animate-[gradient_3s_ease-in-out_infinite] text-white px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md shadow-amber-500/30 border border-yellow-300">
              <Icon
                name="workspace_premium"
                className="w-[14px] h-[14px] text-yellow-50 drop-shadow-sm"
              />
              <span className="text-[11px] font-bold tracking-widest uppercase">
                Premium
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1 pr-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Stage 1: เพิ่งเริ่ม
            </p>
          </div>
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

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => handleAction("recipe")}
            className="rounded-2xl border border-violet-200 bg-violet-50 px-3 py-2.5 text-xs font-semibold text-violet-700 flex items-center justify-center gap-1.5"
          >
            <Icon name="restaurant_menu" className="w-4 h-4" />
            ดูสูตรเมนูนี้
          </button>
          <button
            onClick={() => handleAction("menu")}
            className="rounded-2xl border border-cyan-200 bg-cyan-50 px-3 py-2.5 text-xs font-semibold text-cyan-700 flex items-center justify-center gap-1.5"
          >
            <Icon name="filter_alt" className="w-4 h-4" />
            ดูเมนูคล้ายกัน
          </button>
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
