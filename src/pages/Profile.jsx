import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { localStore } from '@/api/apiStore';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import Icon from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import { syncUserProfileToGraph } from '@/api/behaviorAnalytics';
import ChallengeCard from '@/components/community/ChallengeCard';
import PostCard from '@/components/community/PostCard';

const fallbackSwipeImage = 'https://images.unsplash.com/photo-1559847844-d721426d6edc?w=800&q=80';
const defaultFormState = {
  name: '',
  age: '',
  health_goal: 'reduce_sodium',
  sodium_limit: 1500,
  ncd_targets: [],
  blood_certificate_name: '',
  blood_certificate_data: '',
  blood_certificate_mime: '',
  blood_certificate_uploaded_at: null,
};

const goalOptions = [
  { value: 'reduce_sodium', label: 'ลดโซเดียม', icon: 'water_drop' },
  { value: 'lose_weight', label: 'ลดน้ำหนัก', icon: 'local_fire_department' },
  { value: 'eat_clean', label: 'กินคลีน', icon: 'eco' },
  { value: 'heart_health', label: 'ดูแลหัวใจ', icon: 'favorite' },
];

const ncdTargetOptions = [
  { value: 'hypertension', label: 'ความดันโลหิตสูง', icon: 'monitor_heart' },
  { value: 'diabetes', label: 'เบาหวาน', icon: 'bloodtype' },
  { value: 'dyslipidemia', label: 'ไขมันในเลือดสูง', icon: 'biotech' },
  { value: 'ckd', label: 'โรคไตเรื้อรัง', icon: 'health_and_safety' },
  { value: 'obesity', label: 'ภาวะอ้วนลงพุง', icon: 'monitor_weight' },
  { value: 'stroke_risk', label: 'เสี่ยงหลอดเลือดสมอง', icon: 'neurology' },
];

const swipeDirectionMeta = {
  like: {
    label: 'ถูกใจ',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: 'favorite',
  },
  dislike: {
    label: 'ไม่สนใจ',
    className: 'bg-rose-100 text-rose-700 border-rose-200',
    icon: 'close',
  },
  save: {
    label: 'บันทึกไว้',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: 'bookmark',
  },
};

function createMockPosts(userName) {
  return [
    {
      id: 'mock-1',
      menu_name: 'ส้มตำไทยลดเค็ม',
      caption: 'ลองทำส้มตำสูตรลดโซเดียม ใช้น้ำปลาลดเกลือแทน อร่อยไม่แพ้สูตรเดิมเลย! 🥗',
      sodium_reduced: 35,
      image_url: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800&q=80',
      region: 'northeast',
      province: 'ขอนแก่น',
      cheer_count: 12,
      created_by: userName || 'คุณ',
      created_date: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: 'mock-2',
      menu_name: 'ข้าวผัดคลีน ไข่ดาว',
      caption: 'ข้าวผัดกระเทียมสูตรคลีน ไม่ใส่ซอสปรุงรส ใช้น้ำมันมะกอกแทน หอมอร่อย 💪',
      sodium_reduced: 50,
      image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80',
      region: 'central',
      province: 'กรุงเทพ',
      cheer_count: 8,
      created_by: userName || 'คุณ',
      created_date: new Date(Date.now() - 24 * 3600000).toISOString(),
    },
  ];
}

function parseArrayField(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
}

function formatThaiDate(value) {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';
  return parsed.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
}

function getInitial(name) {
  if (!name) return 'ผ';
  return String(name).trim().charAt(0).toUpperCase();
}

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์ได้'));
    reader.readAsDataURL(file);
  });
}

function createFormFromProfile(existingProfile, authUser) {
  const ncdTargets = parseArrayField(existingProfile?.ncd_targets);
  const mixedGoals = parseArrayField(existingProfile?.health_goals);
  const fallbackNcdTargets = mixedGoals.filter((goal) => goal !== existingProfile?.health_goal);
  return {
    name: existingProfile?.name || authUser?.name || '',
    age: existingProfile?.age ? String(existingProfile.age) : '',
    health_goal: existingProfile?.health_goal || defaultFormState.health_goal,
    sodium_limit: existingProfile?.sodium_limit || defaultFormState.sodium_limit,
    ncd_targets: ncdTargets.length ? ncdTargets : fallbackNcdTargets,
    blood_certificate_name: existingProfile?.blood_certificate_name || '',
    blood_certificate_data: existingProfile?.blood_certificate_data || '',
    blood_certificate_mime: existingProfile?.blood_certificate_mime || '',
    blood_certificate_uploaded_at: existingProfile?.blood_certificate_uploaded_at || null,
  };
}

function buildProfilePayload(form, currentProfile, authUser) {
  const parsedAge = Number.parseInt(form.age, 10);
  const parsedSodium = Number.parseInt(String(form.sodium_limit), 10);
  const healthGoals = Array.from(new Set([form.health_goal, ...form.ncd_targets].filter(Boolean)));
  const payload = {
    name: form.name || authUser?.name || null,
    age: Number.isNaN(parsedAge) ? null : parsedAge,
    health_goal: form.health_goal,
    health_goals: JSON.stringify(healthGoals),
    ncd_targets: JSON.stringify(form.ncd_targets),
    sodium_limit: Number.isNaN(parsedSodium) ? 1500 : parsedSodium,
    blood_certificate_name: form.blood_certificate_name || null,
    blood_certificate_data: form.blood_certificate_data || null,
    blood_certificate_mime: form.blood_certificate_mime || null,
    blood_certificate_uploaded_at: form.blood_certificate_uploaded_at || null,
    points: currentProfile?.points || 0,
    streak_days: currentProfile?.streak_days || 1,
  };
  return { payload, healthGoals };
}

async function fetchRecentSwipes(userId) {
  const [swipes, menus] = await Promise.all([
    localStore.entities.MenuSwipe.list(),
    localStore.entities.Menu.list(),
  ]);
  const menuMap = new Map(menus.map((menu) => [String(menu.id), menu]));
  return swipes
    .filter((swipe) => String(swipe.user_id || '') === String(userId))
    .sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0))
    .map((swipe) => ({ ...swipe, menu: menuMap.get(String(swipe.menu_id || '')) || null }))
    .filter((swipe) => swipe.menu);
}

/* ───── Sub-components ───── */

function SelectButton({ active, onClick, icon, label, activeClass }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border px-3 py-2.5 text-left transition-all ${active ? activeClass : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
        }`}
    >
      <div className="flex items-center gap-2">
        <Icon name={icon} className="w-4 h-4" />
        <span className="text-sm font-semibold leading-tight">{label}</span>
      </div>
    </button>
  );
}

function SwipeHistoryItem({ swipe, onOpenMenu }) {
  const direction = swipeDirectionMeta[swipe.direction] || {
    label: swipe.direction || 'ไม่ระบุ',
    className: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: 'history',
  };
  const menuName = swipe.menu?.name_th || swipe.menu?.name || swipe.menu?.name_en || `เมนู #${swipe.menu_id}`;
  const menuSub = swipe.menu?.name_en || swipe.menu?.region || 'เมนูอาหารไทย';

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-2.5">
      <div className="flex items-center gap-3">
        <img
          src={swipe.menu?.image_url || fallbackSwipeImage}
          alt={menuName}
          className="w-14 h-14 rounded-xl object-cover"
          onError={(event) => { event.currentTarget.src = fallbackSwipeImage; }}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800 line-clamp-1">{menuName}</p>
          <p className="text-xs text-slate-500 line-clamp-1">{menuSub}</p>
          <p className="text-xs text-slate-400 mt-0.5">{formatThaiDate(swipe.created_date)}</p>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-xl border px-2 py-1 text-[11px] font-semibold ${direction.className}`}>
          <Icon name={direction.icon} className="w-3.5 h-3.5" />
          {direction.label}
        </span>
      </div>
      <div className="mt-2 flex justify-end">
        <button
          onClick={() => onOpenMenu(swipe.menu?.id || swipe.menu_id)}
          className="inline-flex items-center gap-1 rounded-xl border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-[11px] font-semibold text-violet-700"
        >
          <Icon name="restaurant_menu" className="w-3.5 h-3.5" />
          ดูสูตรเมนูนี้
        </button>
      </div>
    </div>
  );
}

/* ───── Main Component ───── */

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [uploadingCertificate, setUploadingCertificate] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [profile, setProfile] = useState(null);
  const [recentSwipes, setRecentSwipes] = useState([]);
  const [posts, setPosts] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [joinedChallenges, setJoinedChallenges] = useState([]);
  const [participants, setParticipants] = useState([]);

  // Tabs
  const [activeTab, setActiveTab] = useState('posts');
  const [menuSubTab, setMenuSubTab] = useState('like');
  const [challengeFilter, setChallengeFilter] = useState('select');

  const [certificateError, setCertificateError] = useState('');
  const [form, setForm] = useState(defaultFormState);

  const profileName = useMemo(
    () => form.name || user?.name || 'โปรไฟล์ของฉัน',
    [form.name, user?.name]
  );

  const currentGoal = useMemo(
    () => goalOptions.find((item) => item.value === form.health_goal) || goalOptions[0],
    [form.health_goal]
  );

  useEffect(() => {
    if (!user?.id) return;
    const loadAll = async () => {
      setLoading(true);
      try {
        let existingProfile = null;
        try {
          existingProfile = await localStore.entities.UserProfile.get(user.id);
        } catch {
          existingProfile = null;
        }

        const [swipes, postsData, challengesData, participantsData] = await Promise.all([
          fetchRecentSwipes(user.id),
          localStore.entities.CommunityPost.list(),
          localStore.entities.Challenge.list(),
          localStore.entities.ChallengeParticipant.list(),
        ]);

        setProfile(existingProfile);
        setForm(createFormFromProfile(existingProfile, user));
        setRecentSwipes(swipes);

        // Filter to user's own posts, fallback to mock data
        const userName = existingProfile?.name || user?.name || 'คุณ';
        const userPosts = postsData
          .filter((p) => p.created_by === userName || p.created_by === user?.name || p.created_by === user?.email)
          .sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
        setPosts(userPosts.length > 0 ? userPosts : createMockPosts(userName));
        setChallenges(challengesData);
        setParticipants(participantsData);
        setJoinedChallenges(participantsData.map((p) => p.challenge_id));
      } catch (error) {
        console.error('Error loading profile page:', error);
      } finally {
        setLoading(false);
      }
    };
    void loadAll();
  }, [user?.id, user?.name]);

  /* Form handlers */
  const updateFormField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleToggleNcdTarget = (value) => {
    setForm((prev) => ({
      ...prev,
      ncd_targets: prev.ncd_targets.includes(value)
        ? prev.ncd_targets.filter((item) => item !== value)
        : [...prev.ncd_targets, value],
    }));
  };

  const handleUploadCertificate = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const validMime = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    const validByExt = /\.(pdf|png|jpe?g|webp)$/i.test(file.name);
    const isMimeAllowed = validMime.includes(file.type) || (file.type === '' && validByExt);
    if (!isMimeAllowed) { setCertificateError('รองรับเฉพาะไฟล์ PDF, JPG, PNG หรือ WEBP'); return; }
    if (file.size > 5 * 1024 * 1024) { setCertificateError('ขนาดไฟล์ต้องไม่เกิน 5MB'); return; }
    setUploadingCertificate(true);
    setCertificateError('');
    try {
      const dataUrl = await toDataUrl(file);
      setForm((prev) => ({
        ...prev,
        blood_certificate_name: file.name,
        blood_certificate_data: dataUrl,
        blood_certificate_mime: file.type || 'application/octet-stream',
        blood_certificate_uploaded_at: new Date().toISOString(),
      }));
    } catch (error) {
      setCertificateError(error?.message || 'อัปโหลดไฟล์ไม่สำเร็จ');
    } finally {
      setUploadingCertificate(false);
    }
  };

  const handleRemoveCertificate = () => {
    setForm((prev) => ({
      ...prev, blood_certificate_name: '', blood_certificate_data: '',
      blood_certificate_mime: '', blood_certificate_uploaded_at: null,
    }));
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const { payload, healthGoals } = buildProfilePayload(form, profile, user);
      const savedProfile = profile
        ? await localStore.entities.UserProfile.update(user.id, payload)
        : await localStore.entities.UserProfile.create({ id: user.id, email: user?.email || null, ...payload });
      setProfile(savedProfile);
      setSavedAt(new Date());
      setShowEditModal(false);
      void syncUserProfileToGraph(
        { ...savedProfile, health_goal: form.health_goal, health_goals: healthGoals, sodium_limit: payload.sodium_limit },
        user.id
      );
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenMenuRecommendation = (menuId) => {
    if (!menuId) return;
    navigate(createPageUrl('Recommendation') + `?menuId=${menuId}`);
  };

  const handleCheer = async (postId) => {
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, cheer_count: (p.cheer_count || 0) + 1 } : p));
    const post = posts.find((p) => p.id === postId);
    if (post) {
      await localStore.entities.CommunityPost.update(postId, { cheer_count: (post.cheer_count || 0) + 1 });
    }
  };

  const handleJoinChallenge = async (challengeId) => {
    if (joinedChallenges.includes(challengeId)) return;
    await localStore.entities.ChallengeParticipant.create({
      challenge_id: challengeId, progress: 0, completed: false, days_completed: 0,
    });
    const challenge = challenges.find((c) => c.id === challengeId);
    if (challenge) {
      await localStore.entities.Challenge.update(challengeId, {
        participant_count: (challenge.participant_count || 0) + 1,
      });
      setChallenges((prev) => prev.map((c) =>
        c.id === challengeId ? { ...c, participant_count: (c.participant_count || 0) + 1 } : c
      ));
    }
    setJoinedChallenges((prev) => [...prev, challengeId]);
    setParticipants((prev) => [...prev, { challenge_id: challengeId, progress: 0 }]);
  };

  const handleLogout = () => { logout(); navigate(createPageUrl('Login')); };

  /* Derived data */
  const likedSwipes = useMemo(() => recentSwipes.filter((s) => s.direction === 'like'), [recentSwipes]);

  const filteredChallenges = useMemo(() => {
    if (challengeFilter === 'select') return challenges.filter((c) => !joinedChallenges.includes(c.id));
    if (challengeFilter === 'pending') return challenges.filter((c) => {
      if (!joinedChallenges.includes(c.id)) return false;
      const p = participants.find((pt) => pt.challenge_id === c.id);
      return !p?.completed;
    });
    if (challengeFilter === 'done') return challenges.filter((c) => {
      if (!joinedChallenges.includes(c.id)) return false;
      const p = participants.find((pt) => pt.challenge_id === c.id);
      return p?.completed;
    });
    return challenges;
  }, [challengeFilter, challenges, joinedChallenges, participants]);

  const mainTabs = [
    { key: 'posts', label: 'โพสต์', icon: 'grid_view' },
    { key: 'menu', label: 'เมนู', icon: 'restaurant' },
    { key: 'challenges', label: 'ชาเลนจ์', icon: 'emoji_events' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f3]">
      <div className="mx-auto max-w-md px-4 pb-28 pt-5">

        {/* ─── Profile Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative overflow-hidden rounded-[28px] border border-[#e2e7e0] bg-white px-5 py-5 shadow-[0_12px_32px_rgba(35,65,51,0.06)]"
        >
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[20px] border border-[#e4ece8] bg-gradient-to-br from-emerald-200/55 via-emerald-100/80 to-white text-2xl font-bold text-emerald-800 shadow-[0_8px_18px_rgba(16,101,73,0.14)]">
              {getInitial(profileName)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-slate-800 line-clamp-1">{profileName}</h1>
              <p className="text-sm text-slate-500 line-clamp-1">{user?.email || 'ไม่มีอีเมล'}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  <Icon name={currentGoal.icon} className="w-3 h-3" />
                  {currentGoal.label}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                  <Icon name="star" className="w-3 h-3" />
                  {profile?.points || 0} คะแนน
                </span>
              </div>
            </div>
          </div>

          {/* Edit + Logout buttons */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Icon name="edit_square" className="text-base" />
              แก้ไขโปรไฟล์
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-100"
            >
              <Icon name="logout" className="text-base" />
            </button>
          </div>
        </motion.div>

        {/* ─── Main Tabs ─── */}
        <div className="mt-4 bg-white rounded-2xl p-1 flex gap-1 shadow-sm border border-slate-100">
          {mainTabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive
                  ? 'bg-[#1B4332] text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
              >
                <Icon name={tab.icon} className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ─── Tab Content ─── */}
        <AnimatePresence mode="wait">

          {/* ── Posts Tab ── */}
          {activeTab === 'posts' && (
            <motion.div
              key="posts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 space-y-4"
            >
              {posts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                  <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <Icon name="photo_camera" className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600">ยังไม่มีโพสต์</p>
                  <p className="text-xs text-slate-400 mt-1">แชร์เมนูสุขภาพของคุณกับชุมชน</p>
                  <button
                    onClick={() => navigate(createPageUrl('CreatePost'))}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#1B4332] px-4 py-2 text-sm font-semibold text-white hover:bg-[#143728] transition-colors"
                  >
                    <Icon name="add" className="w-4 h-4" />
                    สร้างโพสต์แรก
                  </button>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard key={post.id} post={post} onCheer={handleCheer} />
                ))
              )}
            </motion.div>
          )}

          {/* ── Menu Tab ── */}
          {activeTab === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4"
            >
              {/* Sub-tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setMenuSubTab('like')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${menuSubTab === 'like'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                >
                  <Icon name="favorite" className="w-4 h-4" />
                  เมนูที่ถูกใจ
                </button>
                <button
                  onClick={() => setMenuSubTab('history')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${menuSubTab === 'history'
                    ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                >
                  <Icon name="history" className="w-4 h-4" />
                  ประวัติการสั่งซื้อ
                </button>
              </div>

              <AnimatePresence mode="wait">
                {menuSubTab === 'like' && (
                  <motion.div
                    key="like-menu"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-2"
                  >
                    {likedSwipes.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                        <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 flex items-center justify-center mb-3">
                          <Icon name="favorite" className="w-6 h-6 text-rose-300" />
                        </div>
                        <p className="text-sm font-semibold text-slate-600">ยังไม่มีเมนูที่ถูกใจ</p>
                        <p className="text-xs text-slate-400 mt-1">ลองปัดขวาเพื่อถูกใจเมนูในหน้าค้นหา</p>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm space-y-2">
                        <div className="flex items-center justify-between px-1 pb-1">
                          <h3 className="text-sm font-bold text-slate-700">❤️ เมนูที่ถูกใจ</h3>
                          <span className="text-xs text-slate-400">{likedSwipes.length} รายการ</span>
                        </div>
                        {likedSwipes.map((swipe) => (
                          <SwipeHistoryItem key={swipe.id} swipe={swipe} onOpenMenu={handleOpenMenuRecommendation} />
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {menuSubTab === 'history' && (
                  <motion.div
                    key="history-menu"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-2"
                  >
                    {recentSwipes.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                        <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 flex items-center justify-center mb-3">
                          <Icon name="receipt_long" className="w-6 h-6 text-amber-300" />
                        </div>
                        <p className="text-sm font-semibold text-slate-600">ยังไม่มีประวัติการสั่งซื้อ</p>
                        <p className="text-xs text-slate-400 mt-1">ประวัติจะแสดงเมื่อคุณเริ่มใช้งาน</p>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm space-y-2">
                        <div className="flex items-center justify-between px-1 pb-1">
                          <h3 className="text-sm font-bold text-slate-700">📋 ประวัติการสั่งซื้อ</h3>
                          <span className="text-xs text-slate-400">{recentSwipes.length} รายการ</span>
                        </div>
                        {recentSwipes.map((swipe) => (
                          <SwipeHistoryItem key={swipe.id} swipe={swipe} onOpenMenu={handleOpenMenuRecommendation} />
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── Challenges Tab ── */}
          {activeTab === 'challenges' && (
            <motion.div
              key="challenges"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4"
            >
              {/* Sub-filters */}
              <div className="flex gap-2 mb-4">
                {[
                  { key: 'select', label: 'เลือกชาเลนจ์', icon: 'add_circle' },
                  { key: 'pending', label: 'กำลังทำ', icon: 'pending' },
                  { key: 'done', label: 'สำเร็จ', icon: 'check_circle' },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setChallengeFilter(filter.key)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-all border ${challengeFilter === filter.key
                      ? filter.key === 'done'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm'
                        : filter.key === 'pending'
                          ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-sm'
                          : 'bg-[#1B4332]/10 border-[#1B4332]/30 text-[#1B4332] shadow-sm'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                  >
                    <Icon name={filter.icon} className="w-3.5 h-3.5" />
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Challenge list */}
              <div className="space-y-3">
                {filteredChallenges.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                    <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 flex items-center justify-center mb-3">
                      <Icon name="emoji_events" className="w-6 h-6 text-amber-300" />
                    </div>
                    <p className="text-sm font-semibold text-slate-600">
                      {challengeFilter === 'select' ? 'ไม่มีชาเลนจ์ใหม่' : challengeFilter === 'pending' ? 'ไม่มีชาเลนจ์ที่กำลังทำ' : 'ยังไม่มีชาเลนจ์ที่สำเร็จ'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {challengeFilter === 'select' ? 'คุณเข้าร่วมทุกชาเลนจ์แล้ว 🎉' : challengeFilter === 'pending' ? 'ไปเลือกชาเลนจ์ใหม่กัน!' : 'สู้ๆ ทำชาเลนจ์ให้สำเร็จนะ!'}
                    </p>
                  </div>
                ) : (
                  filteredChallenges.map((challenge) => {
                    const isJoined = joinedChallenges.includes(challenge.id);
                    const participant = participants.find((p) => p.challenge_id === challenge.id);
                    return (
                      <ChallengeCard
                        key={challenge.id}
                        challenge={challenge}
                        isJoined={isJoined}
                        progress={isJoined ? (participant?.progress || Math.floor(Math.random() * 60 + 10)) : 0}
                        onJoin={handleJoinChallenge}
                      />
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Floating Add Post Button ─── */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
          onClick={() => navigate(createPageUrl('CreatePost'))}
          className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] flex items-center justify-center shadow-lg shadow-emerald-900/30 active:scale-95 transition-transform sm:right-[calc(50%-220px)]"
        >
          <Icon name="add" className="w-7 h-7 text-white" />
        </motion.button>
      </div>

      {/* ─── Edit Profile Modal ─── */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-3xl w-full max-w-md max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="sticky top-0 bg-white z-10 px-5 pt-5 pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800">แก้ไขโปรไฟล์</h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
                  >
                    <Icon name="close" className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </div>

              {/* Modal body */}
              <div className="p-5 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">ชื่อแสดงผล</label>
                  <input
                    value={form.name}
                    onChange={(event) => updateFormField('name', event.target.value)}
                    placeholder="ชื่อของคุณ"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">อายุ</label>
                    <input
                      type="number"
                      value={form.age}
                      onChange={(event) => updateFormField('age', event.target.value)}
                      placeholder="เช่น 28"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">เป้าหมายโซเดียม</label>
                    <input
                      type="number" min="800" max="3500" step="50"
                      value={form.sodium_limit}
                      onChange={(event) => updateFormField('sodium_limit', event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">เป้าหมายสุขภาพหลัก</p>
                  <div className="grid grid-cols-2 gap-2">
                    {goalOptions.map((goal) => (
                      <SelectButton
                        key={goal.value}
                        active={form.health_goal === goal.value}
                        onClick={() => updateFormField('health_goal', goal.value)}
                        icon={goal.icon}
                        label={goal.label}
                        activeClass="border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">เป้าหมายสุขภาพ NCDs</p>
                  <div className="grid grid-cols-2 gap-2">
                    {ncdTargetOptions.map((target) => (
                      <SelectButton
                        key={target.value}
                        active={form.ncd_targets.includes(target.value)}
                        onClick={() => handleToggleNcdTarget(target.value)}
                        icon={target.icon}
                        label={target.label}
                        activeClass="border-rose-500 bg-rose-50 text-rose-700 shadow-sm"
                      />
                    ))}
                  </div>
                </div>

                {/* Blood Certificate */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">ใบผลตรวจเลือด</p>
                      <p className="text-xs text-slate-500">อัปโหลดไฟล์ PDF หรือรูปภาพ ไม่เกิน 5MB</p>
                    </div>
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                      <Icon name="upload" className="h-4 w-4" />
                      อัปโหลด
                      <input
                        type="file"
                        accept="application/pdf,image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleUploadCertificate}
                      />
                    </label>
                  </div>
                  {uploadingCertificate && <p className="text-xs text-sky-700">กำลังอ่านไฟล์...</p>}
                  {certificateError && <p className="text-xs text-rose-600">{certificateError}</p>}
                  {form.blood_certificate_name && (
                    <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="line-clamp-1 text-sm font-semibold text-slate-800">{form.blood_certificate_name}</p>
                          <p className="text-xs text-slate-500">อัปโหลดเมื่อ {formatThaiDate(form.blood_certificate_uploaded_at)}</p>
                        </div>
                        <button onClick={handleRemoveCertificate} className="text-xs font-semibold text-rose-600 hover:text-rose-700">ลบไฟล์</button>
                      </div>
                      {form.blood_certificate_data && form.blood_certificate_mime.startsWith('image/') && (
                        <img src={form.blood_certificate_data} alt="Blood certificate" className="h-40 w-full rounded-xl border border-slate-100 object-cover" />
                      )}
                      {form.blood_certificate_data && (
                        <a href={form.blood_certificate_data} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800">
                          <Icon name="open_in_new" className="h-4 w-4" />
                          เปิดเอกสาร
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleSave}
                  disabled={saving || uploadingCertificate}
                  className="h-12 w-full rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:from-teal-700 hover:to-teal-800"
                >
                  {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </Button>

                {savedAt && (
                  <p className="text-center text-xs text-emerald-700">
                    บันทึกสำเร็จเมื่อ {savedAt.toLocaleTimeString('th-TH')}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}