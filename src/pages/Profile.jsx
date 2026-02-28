import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { localStore } from "@/api/apiStore";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/lib/AuthContext";
import { syncUserProfileToGraph } from "@/api/behaviorAnalytics";
import Icon from "@/components/ui/Icon";

const fallbackImage =
  "https://images.unsplash.com/photo-1559847844-d721426d6edc?w=800&q=80";

const goalOptions = [
  { value: "reduce_sodium", label: "ลดโซเดียม", icon: "water_drop" },
  { value: "lose_weight", label: "ลดน้ำหนัก", icon: "monitor_weight" },
  { value: "eat_clean", label: "กินคลีน", icon: "eco" },
  { value: "heart_health", label: "ดูแลหัวใจ", icon: "favorite" },
];

const ncdTargetOptions = [
  { value: "hypertension", label: "ความดันโลหิตสูง" },
  { value: "diabetes", label: "เบาหวาน" },
  { value: "dyslipidemia", label: "ไขมันในเลือดสูง" },
  { value: "ckd", label: "โรคไตเรื้อรัง" },
  { value: "obesity", label: "ภาวะอ้วนลงพุง" },
  { value: "stroke_risk", label: "เสี่ยงหลอดเลือดสมอง" },
];

const mainTabs = [
  { id: "posts", label: "โพสต์", icon: "grid_view" },
  { id: "menu", label: "เมนู", icon: "restaurant_menu" },
  { id: "challenges", label: "ชาเลนจ์", icon: "emoji_events" },
];

const menuTabs = [
  { id: "like", label: "เมนูที่ถูกใจ" },
  { id: "history", label: "ประวัติการสั่งซื้อ" },
];

const challengeTabs = [
  { id: "select", label: "เลือกชาเลนจ์" },
  { id: "pending", label: "กำลังทำ" },
  { id: "done", label: "สำเร็จแล้ว" },
];

function parseArrayField(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" });
}

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("ไม่สามารถอ่านไฟล์ได้"));
    reader.readAsDataURL(file);
  });
}

function getGoalMeta(goalValue) {
  return goalOptions.find((item) => item.value === goalValue) || goalOptions[0];
}

function getNcdLabel(value) {
  return ncdTargetOptions.find((item) => item.value === value)?.label || value;
}

function getInitial(name) {
  if (!name) return "ผ";
  return String(name).trim().charAt(0).toUpperCase();
}

function getDirectionStyle(direction) {
  if (direction === "like" || direction === "save") {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }
  if (direction === "dislike") {
    return "bg-rose-100 text-rose-700 border-rose-200";
  }
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function getDirectionLabel(direction) {
  if (direction === "like") return "ถูกใจ";
  if (direction === "save") return "บันทึก";
  if (direction === "dislike") return "ไม่สนใจ";
  return direction || "-";
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [posting, setPosting] = useState(false);
  const [joiningChallengeId, setJoiningChallengeId] = useState(null);
  const [updatingChallengeId, setUpdatingChallengeId] = useState(null);

  const [profile, setProfile] = useState(null);
  const [swipes, setSwipes] = useState([]);
  const [posts, setPosts] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [userParticipants, setUserParticipants] = useState([]);

  const [mainTab, setMainTab] = useState("posts");
  const [menuTab, setMenuTab] = useState("like");
  const [challengeTab, setChallengeTab] = useState("select");

  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddPostModal, setShowAddPostModal] = useState(false);
  const [certificateError, setCertificateError] = useState("");

  const [profileForm, setProfileForm] = useState({
    name: "",
    age: "",
    health_goal: "reduce_sodium",
    sodium_limit: 1500,
    ncd_targets: [],
    blood_certificate_name: "",
    blood_certificate_data: "",
    blood_certificate_mime: "",
    blood_certificate_uploaded_at: null,
  });

  const [newPostForm, setNewPostForm] = useState({
    menu_name: "",
    caption: "",
    sodium_reduced: "",
    image_url: "",
  });

  const challengeMap = useMemo(() => {
    const map = new Map();
    challenges.forEach((item) => map.set(String(item.id), item));
    return map;
  }, [challenges]);

  const likedSwipes = useMemo(
    () => swipes.filter((item) => item.direction === "like" || item.direction === "save"),
    [swipes]
  );

  const pendingParticipants = useMemo(
    () => userParticipants.filter((item) => !item.completed),
    [userParticipants]
  );

  const doneParticipants = useMemo(
    () => userParticipants.filter((item) => Boolean(item.completed)),
    [userParticipants]
  );

  const joinedChallengeIds = useMemo(
    () => new Set(userParticipants.map((item) => String(item.challenge_id))),
    [userParticipants]
  );

  const selectableChallenges = useMemo(
    () => challenges.filter((item) => !joinedChallengeIds.has(String(item.id))),
    [challenges, joinedChallengeIds]
  );

  const currentGoal = useMemo(
    () => getGoalMeta(profileForm.health_goal),
    [profileForm.health_goal]
  );

  const profileCompletion = useMemo(() => {
    let score = 35;
    if (profileForm.name) score += 20;
    if (profileForm.age) score += 10;
    if (profileForm.health_goal) score += 15;
    if (profileForm.ncd_targets.length > 0) score += 10;
    if (profileForm.blood_certificate_name) score += 10;
    return Math.min(100, score);
  }, [
    profileForm.age,
    profileForm.blood_certificate_name,
    profileForm.health_goal,
    profileForm.name,
    profileForm.ncd_targets.length,
  ]);

  const memberCode = useMemo(() => {
    const raw = String(user?.id || "guest");
    return raw.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12).toUpperCase() || "GUEST";
  }, [user?.id]);

  const joinedDateLabel = useMemo(() => {
    const candidate = profile?.created_date || user?.created_date;
    if (!candidate) return "สมาชิกใหม่";
    const date = new Date(candidate);
    if (Number.isNaN(date.getTime())) return "สมาชิกใหม่";
    return date.toLocaleDateString("th-TH", { dateStyle: "medium" });
  }, [profile?.created_date, user?.created_date]);

  const tabCounts = useMemo(
    () => ({
      posts: posts.length,
      menu: swipes.length,
      challenges: userParticipants.length,
    }),
    [posts.length, swipes.length, userParticipants.length]
  );

  useEffect(() => {
    if (!user?.id) return;
    void loadData();
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [existingProfile, allPosts, allSwipes, allMenus, allChallenges, allParticipants] =
        await Promise.all([
          localStore.entities.UserProfile.get(user.id).catch(() => null),
          localStore.entities.CommunityPost.list().catch(() => []),
          localStore.entities.MenuSwipe.list().catch(() => []),
          localStore.entities.Menu.list().catch(() => []),
          localStore.entities.Challenge.list().catch(() => []),
          localStore.entities.ChallengeParticipant.list().catch(() => []),
        ]);

      setProfile(existingProfile);

      const ncdTargets = parseArrayField(existingProfile?.ncd_targets);
      const healthGoals = parseArrayField(existingProfile?.health_goals);
      const fallbackNcdTargets = healthGoals.filter(
        (item) => item !== existingProfile?.health_goal
      );

      setProfileForm({
        name: existingProfile?.name || user?.name || "",
        age: existingProfile?.age ? String(existingProfile.age) : "",
        health_goal: existingProfile?.health_goal || "reduce_sodium",
        sodium_limit: existingProfile?.sodium_limit || 1500,
        ncd_targets: ncdTargets.length ? ncdTargets : fallbackNcdTargets,
        blood_certificate_name: existingProfile?.blood_certificate_name || "",
        blood_certificate_data: existingProfile?.blood_certificate_data || "",
        blood_certificate_mime: existingProfile?.blood_certificate_mime || "",
        blood_certificate_uploaded_at:
          existingProfile?.blood_certificate_uploaded_at || null,
      });

      const menuMap = new Map(allMenus.map((menu) => [String(menu.id), menu]));
      const mappedSwipes = allSwipes
        .filter((item) => String(item.user_id || "") === String(user.id))
        .map((item) => ({
          ...item,
          menu: menuMap.get(String(item.menu_id || "")) || null,
        }))
        .filter((item) => item.menu)
        .sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));
      setSwipes(mappedSwipes);

      const profileNames = new Set([existingProfile?.name, user?.name].filter(Boolean));
      const userPosts = allPosts
        .filter(
          (item) =>
            String(item.user_id || "") === String(user.id) || profileNames.has(item.created_by)
        )
        .sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));
      setPosts(userPosts);

      const ownParticipants = allParticipants.filter(
        (item) => String(item.user_id || "") === String(user.id)
      );
      setChallenges(allChallenges);
      setUserParticipants(ownParticipants);
    } catch (error) {
      console.error("Error loading profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setSavingProfile(true);
    try {
      const parsedAge = Number.parseInt(profileForm.age, 10);
      const parsedSodium = Number.parseInt(String(profileForm.sodium_limit), 10);
      const healthGoals = Array.from(
        new Set([profileForm.health_goal, ...profileForm.ncd_targets].filter(Boolean))
      );

      const payload = {
        name: profileForm.name || user?.name || null,
        age: Number.isNaN(parsedAge) ? null : parsedAge,
        health_goal: profileForm.health_goal,
        health_goals: JSON.stringify(healthGoals),
        ncd_targets: JSON.stringify(profileForm.ncd_targets),
        sodium_limit: Number.isNaN(parsedSodium) ? 1500 : parsedSodium,
        blood_certificate_name: profileForm.blood_certificate_name || null,
        blood_certificate_data: profileForm.blood_certificate_data || null,
        blood_certificate_mime: profileForm.blood_certificate_mime || null,
        blood_certificate_uploaded_at: profileForm.blood_certificate_uploaded_at || null,
        points: profile?.points || 0,
        streak_days: profile?.streak_days || 1,
      };

      let saved;
      if (profile) {
        saved = await localStore.entities.UserProfile.update(user.id, payload);
      } else {
        saved = await localStore.entities.UserProfile.create({
          id: user.id,
          email: user?.email || null,
          ...payload,
        });
      }

      setProfile(saved);
      setShowEditModal(false);

      void syncUserProfileToGraph(
        {
          ...saved,
          health_goal: profileForm.health_goal,
          health_goals: healthGoals,
          sodium_limit: payload.sodium_limit,
        },
        user.id
      );
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleToggleNcdTarget = (value) => {
    setProfileForm((prev) => {
      const active = prev.ncd_targets.includes(value);
      return {
        ...prev,
        ncd_targets: active
          ? prev.ncd_targets.filter((item) => item !== value)
          : [...prev.ncd_targets, value],
      };
    });
  };

  const handleUploadCertificate = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const validMime = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    const validByExt = /\.(pdf|png|jpe?g|webp)$/i.test(file.name);
    const isMimeAllowed =
      validMime.includes(file.type) || (file.type === "" && validByExt);

    if (!isMimeAllowed) {
      setCertificateError("รองรับเฉพาะไฟล์ PDF, JPG, PNG หรือ WEBP");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setCertificateError("ขนาดไฟล์ต้องไม่เกิน 5MB");
      return;
    }

    setCertificateError("");
    try {
      const dataUrl = await toDataUrl(file);
      setProfileForm((prev) => ({
        ...prev,
        blood_certificate_name: file.name,
        blood_certificate_data: dataUrl,
        blood_certificate_mime: file.type || "application/octet-stream",
        blood_certificate_uploaded_at: new Date().toISOString(),
      }));
    } catch (error) {
      setCertificateError(error?.message || "อัปโหลดไฟล์ไม่สำเร็จ");
    }
  };

  const handleRemoveCertificate = () => {
    setProfileForm((prev) => ({
      ...prev,
      blood_certificate_name: "",
      blood_certificate_data: "",
      blood_certificate_mime: "",
      blood_certificate_uploaded_at: null,
    }));
  };

  const handleCreatePost = async () => {
    if (!user?.id || !newPostForm.menu_name.trim()) return;
    setPosting(true);
    try {
      const created = await localStore.entities.CommunityPost.create({
        user_id: user.id,
        created_by: profileForm.name || user?.name || "ผู้ใช้งาน",
        menu_name: newPostForm.menu_name.trim(),
        caption: newPostForm.caption.trim() || null,
        sodium_reduced: newPostForm.sodium_reduced
          ? Number(newPostForm.sodium_reduced)
          : null,
        image_url: newPostForm.image_url.trim() || fallbackImage,
        region: "central",
        province: "กรุงเทพ",
        cheer_count: 0,
      });
      setPosts((prev) => [created, ...prev]);
      setNewPostForm({
        menu_name: "",
        caption: "",
        sodium_reduced: "",
        image_url: "",
      });
      setShowAddPostModal(false);
      setMainTab("posts");
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setPosting(false);
    }
  };

  const handleJoinChallenge = async (challengeId) => {
    if (!user?.id || joinedChallengeIds.has(String(challengeId))) return;
    setJoiningChallengeId(challengeId);
    try {
      const participant = await localStore.entities.ChallengeParticipant.create({
        user_id: user.id,
        challenge_id: challengeId,
        progress: 0,
        progress_days: 0,
        days_completed: 0,
        completed: false,
      });

      const selectedChallenge = challenges.find(
        (item) => String(item.id) === String(challengeId)
      );

      setUserParticipants((prev) => [participant, ...prev]);
      setChallenges((prev) =>
        prev.map((item) =>
          String(item.id) === String(challengeId)
            ? { ...item, participant_count: (item.participant_count || 0) + 1 }
            : item
        )
      );

      if (selectedChallenge) {
        void localStore.entities.Challenge.update(challengeId, {
          participant_count: (selectedChallenge.participant_count || 0) + 1,
        });
      }
      setChallengeTab("pending");
    } catch (error) {
      console.error("Error joining challenge:", error);
    } finally {
      setJoiningChallengeId(null);
    }
  };

  const handleSetChallengeDone = async (participantId, done) => {
    setUpdatingChallengeId(participantId);
    try {
      const updated = await localStore.entities.ChallengeParticipant.update(participantId, {
        completed: done,
        progress: done ? 100 : 70,
      });
      setUserParticipants((prev) =>
        prev.map((item) => (String(item.id) === String(updated.id) ? updated : item))
      );
    } catch (error) {
      console.error("Error updating challenge status:", error);
    } finally {
      setUpdatingChallengeId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate(createPageUrl("Login"));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-emerald-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-2 border-emerald-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const swipesToShow = menuTab === "like" ? likedSwipes : swipes;

  return (
    <div className="min-h-screen bg-[#f4f6f3]">
      <div className="mx-auto max-w-md px-4 pb-24 pt-5">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative overflow-hidden rounded-[32px] border border-[#e2e7e0] bg-[#f8faf7] px-3 pb-20 pt-3 shadow-[0_22px_44px_rgba(35,65,51,0.08)]"
        >
          <div className="rounded-[24px] border border-[#dfe6de] bg-white px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-[18px] border border-[#e4ece8] bg-gradient-to-br from-emerald-200/55 via-emerald-100/80 to-white text-2xl font-bold text-emerald-800 shadow-[0_8px_18px_rgba(16,101,73,0.14)]">
                  {getInitial(profileForm.name || user?.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold tracking-[0.15em] text-slate-400">
                    WONGKHAO E-CARD
                  </p>
                  <h1 className="mt-0.5 truncate text-lg font-bold leading-tight text-slate-800">
                    {profileForm.name || user?.name || "ผู้ใช้งาน WongKhao"}
                  </h1>
                  <p className="truncate text-[11px] text-slate-500">
                    {user?.email || "ยังไม่ระบุอีเมล"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center gap-1 rounded-xl border border-[#d7ded8] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                <Icon name="edit_square" className="text-sm" />
                แก้ไข
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-[#dbe2dc] bg-[#fbfcfb] px-2.5 py-2">
                <p className="text-[10px] text-slate-400">รหัสสมาชิก</p>
                <p className="mt-0.5 text-xs font-semibold tracking-[0.12em] text-slate-700">
                  WK-{memberCode}
                </p>
              </div>
              <div className="rounded-xl border border-[#dbe2dc] bg-[#fbfcfb] px-2.5 py-2">
                <p className="text-[10px] text-slate-400">เริ่มใช้งาน</p>
                <p className="mt-0.5 text-xs font-semibold text-slate-700">{joinedDateLabel}</p>
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/75 px-2 py-2.5">
              <div className="flex items-center gap-1 text-emerald-700">
                <Icon name="workspace_premium" className="text-sm" />
                <p className="text-[11px]">คะแนนสะสม</p>
              </div>
              <p className="mt-1 text-sm font-bold text-emerald-900">{profile?.points || 0}</p>
            </div>
            <div className="rounded-2xl border border-orange-200 bg-orange-50/75 px-2 py-2.5">
              <div className="flex items-center gap-1 text-orange-700">
                <Icon name="local_fire_department" className="text-sm" />
                <p className="text-[11px]">สตรีค</p>
              </div>
              <p className="mt-1 text-sm font-bold text-orange-900">{profile?.streak_days || 1} วัน</p>
            </div>
            <div className="rounded-2xl border border-sky-200 bg-sky-50/75 px-2 py-2.5">
              <div className="flex items-center gap-1 text-sky-700">
                <Icon name="assignment_turned_in" className="text-sm" />
                <p className="text-[11px]">โปรไฟล์</p>
              </div>
              <p className="mt-1 text-sm font-bold text-sky-900">{profileCompletion}%</p>
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-emerald-50/30 px-3 py-2.5">
            <div className="flex items-center gap-2 text-emerald-800">
              <Icon name={currentGoal.icon} className="text-lg" filled />
              <p className="text-xs font-semibold">
                เป้าหมายหลัก: {currentGoal.label} | จำกัดโซเดียม{" "}
                {profileForm.sodium_limit || 1500} มก./วัน
              </p>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-emerald-100/90">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                style={{ width: `${Math.max(20, profileCompletion)}%` }}
              />
            </div>
            {profileForm.ncd_targets.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {profileForm.ncd_targets.slice(0, 3).map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800"
                  >
                    {getNcdLabel(item)}
                  </span>
                ))}
                {profileForm.ncd_targets.length > 3 && (
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    +{profileForm.ncd_targets.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-white p-1.5">
            {mainTabs.map((tab) => {
              const active = mainTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setMainTab(tab.id)}
                  className={`rounded-xl border px-2 py-2.5 text-xs font-semibold transition-all ${
                    active
                      ? "border-emerald-500 bg-emerald-500 text-white shadow-md"
                      : "border-transparent bg-transparent text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <Icon name={tab.icon} className="text-base" />
                    {tab.label}
                  </span>
                  <span
                    className={`mt-0.5 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] ${
                      active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {tabCounts[tab.id] || 0}
                  </span>
                </button>
              );
            })}
          </div>

          {mainTab === "menu" && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {menuTabs.map((tab) => {
                const active = menuTab === tab.id;
                const count = tab.id === "like" ? likedSwipes.length : swipes.length;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setMenuTab(tab.id)}
                    className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                      active
                        ? "border-emerald-300 bg-emerald-50 text-emerald-800 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      {tab.label}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] ${
                          active ? "bg-emerald-200/60 text-emerald-900" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {count}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {mainTab === "challenges" && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {challengeTabs.map((tab) => {
                const active = challengeTab === tab.id;
                const count =
                  tab.id === "select"
                    ? selectableChallenges.length
                    : tab.id === "pending"
                      ? pendingParticipants.length
                      : doneParticipants.length;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setChallengeTab(tab.id)}
                    className={`rounded-xl border px-2 py-2 text-[11px] font-semibold transition-colors ${
                      active
                        ? "border-orange-300 bg-orange-50 text-orange-800 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      {tab.label}
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                          active ? "bg-orange-200/70 text-orange-900" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {count}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-4 max-h-[44vh] space-y-2.5 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2.5 pr-1">
            {mainTab === "posts" && (
              <>
                {posts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">
                    ยังไม่มีโพสต์จากบัญชีนี้
                  </div>
                ) : (
                  posts.map((post) => (
                    <div
                      key={post.id}
                      className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                            {post.menu_name || "โพสต์ใหม่"}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {post.caption || "ไม่มีคำบรรยาย"}
                          </p>
                        </div>
                        <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700 whitespace-nowrap">
                          {post.sodium_reduced
                            ? `ลด ${post.sodium_reduced} มก.`
                            : "ไม่ระบุโซเดียม"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2">{formatDate(post.created_date)}</p>
                    </div>
                  ))
                )}
              </>
            )}

            {mainTab === "menu" && (
              <>
                {swipesToShow.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">
                    ยังไม่มีข้อมูลเมนูในหมวดนี้
                  </div>
                ) : (
                  swipesToShow.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-white to-emerald-50/40 p-2.5 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.menu?.image_url || fallbackImage}
                          alt={item.menu?.name || item.menu?.name_th || "menu"}
                          className="h-16 w-16 rounded-xl border border-slate-100 object-cover shadow-sm"
                          onError={(event) => {
                            event.currentTarget.src = fallbackImage;
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                            {item.menu?.name || item.menu?.name_th || "เมนูอาหาร"}
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-1">{item.menu?.region || "-"}</p>
                          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                            <Icon name="schedule" className="text-[13px]" />
                            {formatDate(item.created_date)}
                          </p>
                        </div>
                        <span
                          className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${getDirectionStyle(
                            item.direction
                          )}`}
                        >
                          {getDirectionLabel(item.direction)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {mainTab === "challenges" && (
              <>
                {challengeTab === "select" && (
                  <>
                    {selectableChallenges.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">
                        เข้าร่วมชาเลนจ์ครบแล้ว
                      </div>
                    ) : (
                      selectableChallenges.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
                        >
                          <p className="text-sm font-semibold text-slate-800">
                            {item.title || "ชาเลนจ์สุขภาพ"}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {item.description || "-"}
                          </p>
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <span className="text-[11px] text-slate-500">
                              {item.target_days || 0} วัน | รางวัล {item.reward_points || 0} คะแนน
                            </span>
                            <button
                              onClick={() => handleJoinChallenge(item.id)}
                              disabled={joiningChallengeId === item.id}
                              className="rounded-xl border border-emerald-700 bg-emerald-700 px-3 py-1 text-[11px] font-semibold text-white disabled:opacity-60"
                            >
                              {joiningChallengeId === item.id ? "กำลังเข้าร่วม..." : "เข้าร่วม"}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}

                {challengeTab === "pending" && (
                  <>
                    {pendingParticipants.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">
                        ยังไม่มีชาเลนจ์ที่กำลังทำ
                      </div>
                    ) : (
                      pendingParticipants.map((item) => {
                        const challenge = challengeMap.get(String(item.challenge_id));
                        return (
                          <div
                            key={item.id}
                            className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
                          >
                            <p className="text-sm font-semibold text-slate-800">
                              {challenge?.title || "ชาเลนจ์สุขภาพ"}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              ความคืบหน้า {item.progress || 0}% | {item.days_completed || 0} วัน
                            </p>
                            <div className="mt-2 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-orange-400 to-emerald-500"
                                style={{
                                  width: `${Math.max(
                                    0,
                                    Math.min(100, item.progress || 0)
                                  )}%`,
                                }}
                              />
                            </div>
                            <div className="mt-2 flex justify-end">
                              <button
                                onClick={() => handleSetChallengeDone(item.id, true)}
                                disabled={updatingChallengeId === item.id}
                                className="rounded-xl border border-emerald-700 bg-emerald-700 px-3 py-1 text-[11px] font-semibold text-white disabled:opacity-60"
                              >
                                {updatingChallengeId === item.id
                                  ? "กำลังอัปเดต..."
                                  : "ทำสำเร็จแล้ว"}
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </>
                )}

                {challengeTab === "done" && (
                  <>
                    {doneParticipants.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">
                        ยังไม่มีชาเลนจ์ที่ทำเสร็จ
                      </div>
                    ) : (
                      doneParticipants.map((item) => {
                        const challenge = challengeMap.get(String(item.challenge_id));
                        return (
                          <div
                            key={item.id}
                            className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 shadow-sm"
                          >
                            <p className="text-sm font-semibold text-emerald-900">
                              {challenge?.title || "ชาเลนจ์สุขภาพ"}
                            </p>
                            <p className="text-xs text-emerald-700 mt-0.5">
                              สำเร็จแล้ว | ความคืบหน้า {item.progress || 100}%
                            </p>
                            <div className="mt-2 flex justify-end">
                              <button
                                onClick={() => handleSetChallengeDone(item.id, false)}
                                disabled={updatingChallengeId === item.id}
                                className="rounded-xl border border-slate-300 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 disabled:opacity-60"
                              >
                                ย้ายกลับไปกำลังทำ
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </>
                )}
              </>
            )}
          </div>

          <button
            onClick={() => setShowAddPostModal(true)}
            className="absolute bottom-4 left-1/2 h-12 w-12 -translate-x-1/2 rounded-[16px] border-2 border-white bg-gradient-to-br from-emerald-500 to-emerald-700 text-2xl leading-none text-white shadow-[0_10px_20px_rgba(19,114,83,0.35)]"
            aria-label="เพิ่มโพสต์"
          >
            +
          </button>
        </motion.div>

        <div className="mt-4 flex items-center justify-center">
          <button
            onClick={() => setShowAddPostModal(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-100"
          >
            <Icon name="add_circle" className="text-lg" />
            เพิ่มโพสต์ใหม่
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => navigate(createPageUrl("Discover"))}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Icon name="explore" className="text-base" />
            ไปหน้าเมนู
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-100"
          >
            <Icon name="logout" className="text-base" />
            ออกจากระบบ
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/45 p-4 flex items-end sm:items-center justify-center"
            onClick={() => !savingProfile && setShowEditModal(false)}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-4 space-y-3 max-h-[88vh] overflow-y-auto"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">แก้ไขโปรไฟล์</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-600"
                >
                  ปิด
                </button>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-3 space-y-2">
                <p className="text-xs font-semibold text-amber-800">ข้อมูลบัญชี</p>
                <div>
                  <label className="text-xs font-medium text-slate-600">ชื่อผู้ใช้</label>
                  <input
                    value={profileForm.name}
                    onChange={(event) =>
                      setProfileForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                    placeholder="เช่น ใบเตย"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-slate-600">อายุ</label>
                    <input
                      type="number"
                      value={profileForm.age}
                      onChange={(event) =>
                        setProfileForm((prev) => ({ ...prev, age: event.target.value }))
                      }
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                      placeholder="เช่น 30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">
                      โซเดียมเป้าหมาย (มก./วัน)
                    </label>
                    <input
                      type="number"
                      value={profileForm.sodium_limit}
                      onChange={(event) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          sodium_limit: event.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3">
                <p className="text-xs font-semibold text-emerald-800 mb-2">เป้าหมายสุขภาพหลัก</p>
                <div className="grid grid-cols-2 gap-2">
                  {goalOptions.map((item) => (
                    <button
                      key={item.value}
                      onClick={() =>
                        setProfileForm((prev) => ({ ...prev, health_goal: item.value }))
                      }
                      className={`rounded-xl border px-2 py-2 text-xs font-semibold transition-colors ${
                        profileForm.health_goal === item.value
                          ? "border-emerald-700 bg-emerald-700 text-white"
                          : "border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50"
                      }`}
                    >
                      <span className="flex items-center justify-center gap-1.5">
                        <Icon name={item.icon} className="text-base" />
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-3">
                <p className="text-xs font-semibold text-sky-800 mb-2">
                  กลุ่มโรค NCDs ที่ต้องการโฟกัส
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {ncdTargetOptions.map((item) => {
                    const active = profileForm.ncd_targets.includes(item.value);
                    return (
                      <button
                        key={item.value}
                        onClick={() => handleToggleNcdTarget(item.value)}
                        className={`rounded-xl border px-2 py-2 text-xs font-semibold transition-colors ${
                          active
                            ? "border-sky-700 bg-sky-700 text-white"
                            : "border-sky-200 bg-white text-sky-800 hover:bg-sky-50"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-700">
                    ใบรับรองผลเลือด (PDF / รูปภาพ)
                  </p>
                  <label className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 cursor-pointer hover:bg-slate-100">
                    อัปโหลด
                    <input
                      type="file"
                      accept="application/pdf,image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleUploadCertificate}
                    />
                  </label>
                </div>
                {certificateError && (
                  <p className="text-[11px] text-rose-600 mt-1">{certificateError}</p>
                )}
                {profileForm.blood_certificate_name && (
                  <div className="mt-2 rounded-xl border border-slate-200 bg-white p-2.5">
                    <p className="text-xs text-slate-700 line-clamp-1">
                      {profileForm.blood_certificate_name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      อัปโหลดเมื่อ {formatDate(profileForm.blood_certificate_uploaded_at)}
                    </p>
                    <button
                      onClick={handleRemoveCertificate}
                      className="mt-1 text-[11px] font-semibold text-rose-600"
                    >
                      ลบไฟล์
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={savingProfile}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-60"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="rounded-xl border border-emerald-700 bg-emerald-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                >
                  {savingProfile ? "กำลังบันทึก..." : "บันทึกโปรไฟล์"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddPostModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/45 p-4 flex items-end sm:items-center justify-center"
            onClick={() => !posting && setShowAddPostModal(false)}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-4 space-y-3"
              onClick={(event) => event.stopPropagation()}
            >
              <h2 className="text-lg font-bold text-slate-800">เพิ่มโพสต์</h2>

              <div>
                <label className="text-xs font-medium text-slate-600">ชื่อเมนู</label>
                <input
                  value={newPostForm.menu_name}
                  onChange={(event) =>
                    setNewPostForm((prev) => ({ ...prev, menu_name: event.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="เช่น ต้มจืดเต้าหู้หมูสับ"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">คำบรรยาย</label>
                <textarea
                  rows={3}
                  value={newPostForm.caption}
                  onChange={(event) =>
                    setNewPostForm((prev) => ({ ...prev, caption: event.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="แชร์วิธีทำหรือผลลัพธ์สุขภาพของคุณ"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-slate-600">โซเดียมที่ลดได้ (มก.)</label>
                  <input
                    type="number"
                    value={newPostForm.sodium_reduced}
                    onChange={(event) =>
                      setNewPostForm((prev) => ({
                        ...prev,
                        sodium_reduced: event.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    placeholder="เช่น 120"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">
                    ลิงก์รูปภาพ (ไม่บังคับ)
                  </label>
                  <input
                    value={newPostForm.image_url}
                    onChange={(event) =>
                      setNewPostForm((prev) => ({ ...prev, image_url: event.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowAddPostModal(false)}
                  disabled={posting}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-60"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleCreatePost}
                  disabled={posting}
                  className="rounded-xl border border-emerald-700 bg-emerald-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                >
                  {posting ? "กำลังโพสต์..." : "โพสต์เลย"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
