import React, { useState, useEffect } from "react";
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

const goalLabelMap = {
  reduce_sodium: "ลดโซเดียม",
  lose_weight: "ลดน้ำหนัก",
  eat_clean: "กินคลีน",
  heart_health: "ดูแลหัวใจ",
  control_sugar: "ควบคุมน้ำตาล",
  reduce_cholesterol: "ลดไขมันในเลือด",
  kidney_care: "ดูแลไต",
  build_muscle: "เพิ่มกล้ามเนื้อ",
  maintain_weight: "รักษาน้ำหนัก",
  gut_health: "ดูแลลำไส้",
  boost_energy: "เพิ่มพลังงาน",
  high_protein: "เพิ่มโปรตีน",
  calcium: "เสริมแคลเซียม",
};

const goalPromptMap = {
  reduce_sodium: "ลดโซเดียมให้ต่ำกว่า 600mg คงรสชาติเดิมให้มากที่สุด",
  lose_weight: "ลดแคลอรีให้น้อยกว่า 350 kcal ลดไขมัน ไม่เพิ่มน้ำตาล",
  eat_clean: "ปรับเป็นสูตรคลีน ไม่ใส่ผงชูรส น้ำตาล น้ำมันพืช",
  heart_health: "ลดโซเดียม ลดไขมันอิ่มตัว เพิ่มผัก เหมาะกับการดูแลหัวใจ",
  control_sugar: "ลดน้ำตาลและคาร์โบไฮเดรต เหมาะกับผู้ควบคุมระดับน้ำตาลในเลือด",
  reduce_cholesterol: "ลดไขมันอิ่มตัว เพิ่มไฟเบอร์ เหมาะกับการลดคอเลสเตอรอล",
  kidney_care: "ลดโซเดียม โพแทสเซียม และฟอสฟอรัส เหมาะกับการดูแลไต",
  build_muscle: "เพิ่มโปรตีนให้ได้อย่างน้อย 35g เหมาะกับคนออกกำลังกายสร้างกล้ามเนื้อ",
  maintain_weight: "คงแคลอรีอยู่ในระดับสมดุล สารอาหารครบถ้วน",
  gut_health: "เพิ่มไฟเบอร์ ลดอาหารแปรรูป เหมาะกับการดูแลระบบย่อยอาหาร",
  boost_energy: "เพิ่มคาร์โบไฮเดรตเชิงซ้อน วิตามิน เพื่อเพิ่มพลังงาน",
  high_protein: "เพิ่มโปรตีนให้สูงสุดเท่าที่ทำได้ ลดคาร์โบไฮเดรต",
  calcium: "เพิ่มแหล่งแคลเซียม เช่น เต้าหู้ งา ผักสีเขียว",
};

function buildPersonalizedPrompt(menu, userProfile) {
  const goal = userProfile?.health_goal;
  const base = goalPromptMap[goal] || "ปรับสูตรให้มีประโยชน์สูงสุด สมดุลสารอาหาร";
  const sodiumNote = userProfile?.sodium_limit
    ? ` โซเดียมรวมทั้งมื้อไม่เกิน ${userProfile.sodium_limit}mg`
    : "";
  return base + sodiumNote;
}

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
  const [defaultRecipe, setDefaultRecipe] = useState(null);
  const [personalizedRecipe, setPersonalizedRecipe] = useState(null);
  const [activeView, setActiveView] = useState("default");
  const [impacts, setImpacts] = useState({ sodium: -22, sugar: -15, calories: -10, bp_risk: -6 });
  const [aiLoading, setAiLoading] = useState(false);
  const [defaultLoading, setDefaultLoading] = useState(false);
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
    setDefaultRecipe(null);
    setPersonalizedRecipe(null);
    setActiveView("default");

    const menu = filteredMenus[currentIndex];
    if (!menu) return;

    let cancelled = false;
    setDefaultLoading(true);

    adjustRecipeByAI(menu, "แสดงสูตรอาหารต้นตำรับพร้อมส่วนผสมและวิธีทำแบบดั้งเดิม", userProfile)
      .then((result) => {
        if (!cancelled) {
          setDefaultRecipe({ modifications: result.modifications, tasteRetention: result.tasteRetention });
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
        // Store menu details inline for profile display
        menu_name_th: currentMenu.name_th,
        menu_name_en: currentMenu.name_en,
        menu_image_url: currentMenu.image_url,
        menu_region: currentMenu.region,
        menu_calories: currentMenu.calories,
        menu_sodium_level: currentMenu.sodium_level,
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

  const handlePersonalizedRecipe = async () => {
    if (!currentMenu) return;
    const prompt = buildPersonalizedPrompt(currentMenu, userProfile);
    setAiLoading(true);
    try {
      const result = await adjustRecipeByAI(currentMenu, prompt, userProfile);
      setPersonalizedRecipe({ modifications: result.modifications, tasteRetention: result.tasteRetention });
      setActiveView("personalized");
      void trackAdjustmentEvent({
        menu: currentMenu,
        adjustType: "personalized",
        source: "ai",
        prompt,
        impacts,
        tasteRetention: result.tasteRetention,
      });
      toast.success("AI ปรับสูตรเฉพาะสำหรับคุณแล้ว!");
    } catch (error) {
      console.error("AI personalized error:", error);
      toast.error("ไม่สามารถปรับสูตรได้ กรุณาลองใหม่");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAction = (actionType) => {
    if (actionType === "swap") {
      handlePersonalizedRecipe();
    } else if (actionType === "menu") {
      const activeMenu = filteredMenus[currentIndex];
      if (!activeMenu?.region) return;
      setSelectedRegion(activeMenu.region);
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
  const displayedRecipe = activeView === "personalized" ? personalizedRecipe : defaultRecipe;
  const displayedModifications = displayedRecipe?.modifications ?? [];
  const displayedTasteRetention = displayedRecipe?.tasteRetention ?? 85;

  let currentSection = "ingredients";
  const parsedIngredients = [];
  const parsedSteps = [];

  displayedModifications.forEach((mod) => {
    if (mod === "วัตถุดิบ (Bullet Points)" || mod === "วัตถุดิบ" || mod === "วัตถุดิบแนะนำ") {
      currentSection = "ingredients";
      return;
    }
    if (mod === "ขั้นตอนแบบย่อ" || mod.startsWith("ขั้นตอน")) {
      currentSection = "steps";
      return;
    }

    if (currentSection === "ingredients") {
      let text = mod.replace(/^[•\-*\d\.]+\s*/, '').trim();
      let name = text;
      let amount = "";

      if (text.includes("...")) {
        const parts = text.split("...");
        amount = parts.pop().trim();
        name = parts.join("...").trim();
      } else {
        const lastSpace = text.lastIndexOf(" ");
        if (lastSpace !== -1 && /\d/.test(text.substring(lastSpace))) {
          amount = text.substring(lastSpace).trim();
          name = text.substring(0, lastSpace).trim();
        }
      }

      let emoji = "🥗";
      if (name.includes("น้ำปลา") || name.includes("โซเดียม") || name.includes("ซีอิ๊ว") || name.includes("เกลือ")) emoji = "🧂";
      else if (name.includes("หมู") || name.includes("ไก่") || name.includes("เนื้อ") || name.includes("สะโพก")) emoji = "🥩";
      else if (name.includes("กะเพรา") || name.includes("โหระพา")) emoji = "🌿";
      else if (name.includes("มะนาว")) emoji = "🍋";
      else if (name.includes("กระเทียม")) emoji = "🧄";
      else if (name.includes("พริก") || name.includes("เผ็ด")) emoji = "🌶️";
      else if (name.includes("กุ้ง")) emoji = "🦐";
      else if (name.includes("ปลา") || name.includes("หมึก") || name.includes("ทะเล")) emoji = "🦑";
      else if (name.includes("ผงชูรส") || name.includes("รสดี") || name.includes("ชูรส")) emoji = "🥄";
      else if (name.includes("น้ำตาล") || name.includes("หวาน")) emoji = "🍯";
      else if (name.includes("ไข่")) emoji = "🥚";
      else if (name.includes("เส้น") || name.includes("ข้าว")) emoji = "🍚";
      else if (name.includes("น้ำมัน") || name.includes("กะทิ") || name.includes("นม")) emoji = "🥥";
      else if (name.includes("หัวหอม") || name.includes("หอมแดง")) emoji = "🧅";
      else if (name.includes("มะเขือเทศ")) emoji = "🍅";
      else if (name.includes("แครอท")) emoji = "🥕";
      else if (name.includes("ผัก") || name.includes("กะหล่ำ") || name.includes("คะน้า")) emoji = "🥦";

      parsedIngredients.push({ name, amount, emoji, original: mod });
    } else {
      parsedSteps.push(mod);
    }
  });

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

          {/* Premium Badge — golden animated */}
          <div className="relative flex-shrink-0">
            <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 bg-[length:200%_auto] animate-[gradient_3s_ease-in-out_infinite] text-white px-4 py-1.5 rounded-full flex items-center justify-center gap-1.5 shadow-lg shadow-amber-400/40 border border-yellow-300">
              <Icon name="workspace_premium" className="text-[20px] leading-none text-yellow-50 drop-shadow-sm flex-shrink-0" />
              <span className="text-[13px] font-extrabold tracking-widest uppercase leading-none">Premium</span>
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 opacity-30 blur-md -z-10" />
          </div>
        </div>

        {/* Stage of Change Card — Stage 3: Preparation */}
        <div className="mb-4 relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/80 p-3.5">
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-200/30 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Stage number circle */}
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md shadow-amber-400/30 flex-shrink-0">
                <span className="text-white text-lg font-black leading-none">3</span>
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-extrabold text-amber-900 leading-tight">ขั้นเตรียมพร้อม</p>
                <p className="text-[11px] text-amber-700/70 font-medium leading-tight mt-0.5">Preparation</p>
              </div>
            </div>

            {/* Step progress dots */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="flex flex-col items-center gap-0.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border-2 transition-all ${s < 3 ? 'bg-emerald-500 border-emerald-400 text-white' :
                    s === 3 ? 'bg-amber-500 border-amber-400 text-white shadow-md shadow-amber-400/40 ring-2 ring-amber-200' :
                      'bg-slate-100 border-slate-200 text-slate-400'
                    }`}>
                    {s < 3 ? '✓' : s}
                  </div>
                </div>
              ))}
            </div>
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

        {/* Order Button */}
        <div className="mt-3">
          <button
            onClick={() => navigate(createPageUrl("Order"))}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 px-3 py-3 text-sm font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 active:scale-[0.98] transition-all"
          >
            <Icon name="shopping_bag" className="w-5 h-5" />
            สั่งอาหารเลย
          </button>
        </div>



        {/* Modifications Result */}
        {(defaultLoading || defaultRecipe) && (
          <div className="mt-3 bg-emerald-50 rounded-2xl border border-emerald-100 px-4 py-4">
            {/* Header + Toggle */}
            <div className="flex items-center justify-between mb-3">
              {defaultLoading ? (
                <h3 className="text-sm font-bold text-emerald-800">กำลังโหลดสูตรอาหาร...</h3>
              ) : personalizedRecipe ? (
                <div className="flex bg-emerald-100 rounded-xl p-0.5 gap-0.5 w-full">
                  <button
                    onClick={() => setActiveView("default")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${activeView === "default"
                      ? "bg-white text-emerald-800 shadow-sm"
                      : "text-emerald-600"
                      }`}
                  >
                    📖 สูตรต้นตำรับ
                  </button>
                  <button
                    onClick={() => setActiveView("personalized")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${activeView === "personalized"
                      ? "bg-white text-violet-700 shadow-sm"
                      : "text-emerald-600"
                      }`}
                  >
                    ✨ สูตรที่ปรับ
                  </button>
                </div>
              ) : (
                <h3 className="text-sm font-bold text-emerald-800">สูตรต้นตำรับ 📖</h3>
              )}
            </div>

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
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Taste retention bar */}
                <div className="mb-5 mt-1">
                  <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-xs font-bold text-emerald-900">ระดับคงรสชาติดั้งเดิม</span>
                    <span className="text-xs font-black text-emerald-700">{displayedTasteRetention}%</span>
                  </div>
                  <div className="flex items-center bg-white rounded-full p-1 shadow-sm border border-emerald-50">
                    <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 flex-shrink-0 z-10">
                      <Icon name="restaurant_menu" className="w-5 h-5" />
                    </div>
                    <div className="flex-1 h-[22px] bg-slate-50 rounded-full mx-1.5 p-1 flex items-center relative overflow-hidden">
                      <motion.div
                        className="absolute left-0 top-0 h-full bg-emerald-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${displayedTasteRetention}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>

                {parsedIngredients.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-emerald-900 mb-3 ml-1">วัตถุดิบ (Ingredients)</h4>
                    <div className="flex overflow-x-auto gap-2.5 pb-2 scrollbar-hide snap-x">
                      {parsedIngredients.map((ing, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-white rounded-[24px] p-3 shadow-sm border border-emerald-100 flex flex-col items-center justify-center w-[84px] flex-shrink-0 relative overflow-hidden group snap-start"
                        >
                          <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-slate-50 to-transparent -z-10" />
                          <span className="text-[32px] mb-2 drop-shadow-sm group-hover:scale-110 transition-transform">{ing.emoji}</span>
                          <span className="text-[11px] font-bold text-slate-800 text-center leading-tight line-clamp-2 w-full">{ing.name}</span>
                          {ing.amount && (
                            <span className="text-[10px] text-slate-500 font-semibold mt-1.5 flex items-center justify-center -space-x-[1px]">
                              {ing.amount.startsWith('x') ? ing.amount : `${ing.amount}`}
                            </span>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {parsedSteps.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900 mb-3 ml-1 mt-4">ขั้นตอนวิธีทำ (Steps)</h4>
                    <div className="space-y-3">
                      {parsedSteps.map((step, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-white rounded-[20px] p-3 shadow-sm border border-emerald-50 flex gap-3.5 items-start relative overflow-hidden group"
                        >
                          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-emerald-50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />

                          {/* Left Avatar / Icon */}
                          <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-emerald-100 to-teal-50 border border-emerald-100/60 flex flex-col items-center justify-center flex-shrink-0 z-10 shadow-inner">
                            <span className="text-[10px] font-bold text-emerald-600/70 leading-none mb-0.5">STEP</span>
                            <span className="text-lg font-black text-emerald-700 leading-none">{idx + 1}</span>
                          </div>

                          {/* Right Content */}
                          <div className="flex-1 min-w-0 pt-0.5 z-10">
                            <div className="flex justify-between items-start mb-0.5">
                              <span className="font-bold text-slate-800 text-[13px]">ขั้นตอนที่ {idx + 1}</span>
                            </div>
                            <p className="text-slate-600 text-[12px] leading-relaxed">
                              {step.replace(/^\d+\.\s*/, '')}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* Personalized AI Button */}
        <div className="mt-3 bg-white rounded-2xl border border-violet-100 px-4 py-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Icon name="auto_awesome" className="text-[18px] text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">สูตรเฉพาะสำหรับคุณ</h3>
              <p className="text-xs text-slate-500">
                {userProfile?.health_goal
                  ? `เป้าหมาย: ${goalLabelMap[userProfile.health_goal] ?? userProfile.health_goal}`
                  : "ตั้งค่าเป้าหมายใน Profile เพื่อรับสูตรที่ตรงกว่านี้"}
              </p>
            </div>
          </div>
          <button
            onClick={handlePersonalizedRecipe}
            disabled={aiLoading || defaultLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-200 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {aiLoading ? (
              <>
                <Icon name="progress_activity" className="text-[20px] animate-spin" />
                กำลังปรับสูตร...
              </>
            ) : (
              <>
                <Icon name="auto_awesome" className="text-[20px]" />
                ปรับสูตรให้เหมาะกับฉัน
              </>
            )}
          </button>
        </div>


        {/* Hint */}


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
