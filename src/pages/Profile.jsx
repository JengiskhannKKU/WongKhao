import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { localStore } from '@/api/apiStore';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import Icon from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import { syncUserProfileToGraph } from '@/api/behaviorAnalytics';

const fallbackSwipeImage = 'https://images.unsplash.com/photo-1559847844-d721426d6edc?w=800&q=80';

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
    label: 'ไม่สน',
    className: 'bg-rose-100 text-rose-700 border-rose-200',
    icon: 'close',
  },
  save: {
    label: 'บันทึกไว้',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: 'bookmark',
  },
};

function parseArrayField(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map(String).filter(Boolean);
      }
    } catch {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function normalizeSwipeDate(value) {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';
  return parsed.toLocaleString('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์ได้'));
    reader.readAsDataURL(file);
  });
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [profile, setProfile] = useState(null);
  const [recentSwipes, setRecentSwipes] = useState([]);
  const [activeProfileTab, setActiveProfileTab] = useState('health');
  const [swipeHistoryOpen, setSwipeHistoryOpen] = useState(true);
  const [uploadingCertificate, setUploadingCertificate] = useState(false);
  const [certificateError, setCertificateError] = useState('');
  const [form, setForm] = useState({
    name: '',
    age: '',
    health_goal: 'reduce_sodium',
    sodium_limit: 1500,
    ncd_targets: [],
    blood_certificate_name: '',
    blood_certificate_data: '',
    blood_certificate_mime: '',
    blood_certificate_uploaded_at: null,
  });

  useEffect(() => {
    if (!user?.id) return;
    void loadProfileAndSwipes();
  }, [user?.id]);

  const loadRecentSwipes = async (userId) => {
    try {
      const [swipes, menus] = await Promise.all([
        localStore.entities.MenuSwipe.list(),
        localStore.entities.Menu.list(),
      ]);

      const menuMap = new Map(
        menus.map((menu) => [String(menu.id), menu])
      );

      const items = swipes
        .filter((swipe) => String(swipe.user_id || '') === String(userId))
        .sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0))
        .map((swipe) => {
          const menu = menuMap.get(String(swipe.menu_id || '')) || null;
          return {
            ...swipe,
            menu,
          };
        })
        .filter((swipe) => swipe.menu)
        .slice(0, 10);

      setRecentSwipes(items);
    } catch (error) {
      console.error('Error loading swipe history:', error);
      setRecentSwipes([]);
    }
  };

  const loadProfileAndSwipes = async () => {
    setLoading(true);
    try {
      let existing = null;
      try {
        existing = await localStore.entities.UserProfile.get(user.id);
      } catch {
        existing = null;
      }

      const ncdTargets = parseArrayField(existing?.ncd_targets);
      const mixedGoals = parseArrayField(existing?.health_goals);
      const fallbackNcdTargets = mixedGoals.filter((goal) => goal !== existing?.health_goal);

      setProfile(existing);
      setForm({
        name: existing?.name || user?.name || '',
        age: existing?.age ? String(existing.age) : '',
        health_goal: existing?.health_goal || 'reduce_sodium',
        sodium_limit: existing?.sodium_limit || 1500,
        ncd_targets: ncdTargets.length ? ncdTargets : fallbackNcdTargets,
        blood_certificate_name: existing?.blood_certificate_name || '',
        blood_certificate_data: existing?.blood_certificate_data || '',
        blood_certificate_mime: existing?.blood_certificate_mime || '',
        blood_certificate_uploaded_at: existing?.blood_certificate_uploaded_at || null,
      });

      await loadRecentSwipes(user.id);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNcdTarget = (value) => {
    setForm((prev) => {
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
    event.target.value = '';
    if (!file) return;

    const validMime = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    const validByExt = /\.(pdf|png|jpe?g|webp)$/i.test(file.name);
    const isMimeAllowed = validMime.includes(file.type) || (file.type === '' && validByExt);

    if (!isMimeAllowed) {
      setCertificateError('รองรับเฉพาะไฟล์ PDF, JPG, PNG หรือ WEBP');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setCertificateError('ขนาดไฟล์ต้องไม่เกิน 5MB');
      return;
    }

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
      ...prev,
      blood_certificate_name: '',
      blood_certificate_data: '',
      blood_certificate_mime: '',
      blood_certificate_uploaded_at: null,
    }));
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const parsedAge = Number.parseInt(form.age, 10);
      const parsedSodium = Number.parseInt(String(form.sodium_limit), 10);
      const healthGoals = Array.from(new Set([form.health_goal, ...form.ncd_targets].filter(Boolean)));

      const payload = {
        name: form.name || user?.name || null,
        age: Number.isNaN(parsedAge) ? null : parsedAge,
        health_goal: form.health_goal,
        health_goals: JSON.stringify(healthGoals),
        ncd_targets: JSON.stringify(form.ncd_targets),
        sodium_limit: Number.isNaN(parsedSodium) ? 1500 : parsedSodium,
        blood_certificate_name: form.blood_certificate_name || null,
        blood_certificate_data: form.blood_certificate_data || null,
        blood_certificate_mime: form.blood_certificate_mime || null,
        blood_certificate_uploaded_at: form.blood_certificate_uploaded_at || null,
        points: profile?.points || 0,
        streak_days: profile?.streak_days || 1,
      };

      let savedProfile;
      if (profile) {
        savedProfile = await localStore.entities.UserProfile.update(user.id, payload);
      } else {
        savedProfile = await localStore.entities.UserProfile.create({
          id: user.id,
          email: user?.email || null,
          ...payload,
        });
      }

      setProfile(savedProfile);
      setSavedAt(new Date());

      void syncUserProfileToGraph({
        ...savedProfile,
        health_goal: form.health_goal,
        health_goals: healthGoals,
        sodium_limit: payload.sodium_limit,
      }, user.id);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate(createPageUrl('Login'));
  };

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
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-white">
      <div className="max-w-sm mx-auto px-4 pt-6 pb-24 space-y-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Icon name="person" className="w-7 h-7" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-800 line-clamp-1">{form.name || user?.name || 'โปรไฟล์ของฉัน'}</h1>
              <p className="text-sm text-slate-500 line-clamp-1">{user?.email || 'ไม่มีอีเมล'}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="bg-emerald-50 rounded-2xl p-3 text-center">
              <p className="text-xs text-emerald-700">Streak</p>
              <p className="font-bold text-emerald-800">{profile?.streak_days || 1} วัน</p>
            </div>
            <div className="bg-amber-50 rounded-2xl p-3 text-center">
              <p className="text-xs text-amber-700">Points</p>
              <p className="font-bold text-amber-800">{profile?.points || 0}</p>
            </div>
            <div className="bg-cyan-50 rounded-2xl p-3 text-center">
              <p className="text-xs text-cyan-700">โซเดียม</p>
              <p className="font-bold text-cyan-800">{form.sodium_limit} mg</p>
            </div>
            <div className="bg-rose-50 rounded-2xl p-3 text-center">
              <p className="text-xs text-rose-700">NCD Targets</p>
              <p className="font-bold text-rose-800">{form.ncd_targets.length} รายการ</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-2 border border-slate-100 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveProfileTab('health')}
              className={`rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                activeProfileTab === 'health'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ข้อมูลสุขภาพ
            </button>
            <button
              onClick={() => setActiveProfileTab('swipes')}
              className={`rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                activeProfileTab === 'swipes'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              เมนูที่ปัด
            </button>
          </div>
        </div>

        {activeProfileTab === 'health' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800">ข้อมูลสุขภาพ</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">ชื่อแสดงผล</label>
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="ชื่อของคุณ"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">อายุ</label>
              <input
                type="number"
                value={form.age}
                onChange={(event) => setForm((prev) => ({ ...prev, age: event.target.value }))}
                placeholder="เช่น 28"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">เป้าหมายโซเดียม</label>
              <input
                type="number"
                min="800"
                max="3500"
                step="50"
                value={form.sodium_limit}
                onChange={(event) => setForm((prev) => ({ ...prev, sodium_limit: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">เป้าหมายสุขภาพหลัก</p>
            <div className="grid grid-cols-2 gap-2">
              {goalOptions.map((goal) => {
                const isActive = form.health_goal === goal.value;
                return (
                  <button
                    key={goal.value}
                    onClick={() => setForm((prev) => ({ ...prev, health_goal: goal.value }))}
                    className={`rounded-2xl border px-3 py-2.5 text-left transition-all ${isActive
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon name={goal.icon} className="w-4 h-4" />
                      <span className="text-sm font-semibold">{goal.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">เป้าหมายสุขภาพ NCDs</p>
            <div className="grid grid-cols-2 gap-2">
              {ncdTargetOptions.map((target) => {
                const isActive = form.ncd_targets.includes(target.value);
                return (
                  <button
                    key={target.value}
                    onClick={() => handleToggleNcdTarget(target.value)}
                    className={`rounded-2xl border px-3 py-2.5 text-left transition-all ${isActive
                      ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon name={target.icon} className="w-4 h-4" />
                      <span className="text-sm font-semibold leading-tight">{target.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">ใบผลตรวจเลือด</p>
                <p className="text-xs text-slate-500">อัปโหลดไฟล์ PDF หรือรูปภาพ ไม่เกิน 5MB</p>
              </div>
              <label className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-100">
                <Icon name="upload" className="w-4 h-4" />
                อัปโหลด
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleUploadCertificate}
                />
              </label>
            </div>

            {uploadingCertificate && (
              <p className="text-xs text-sky-700">กำลังอ่านไฟล์...</p>
            )}

            {certificateError && (
              <p className="text-xs text-rose-600">{certificateError}</p>
            )}

            {form.blood_certificate_name && (
              <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 line-clamp-1">{form.blood_certificate_name}</p>
                    <p className="text-xs text-slate-500">
                      อัปโหลดเมื่อ {normalizeSwipeDate(form.blood_certificate_uploaded_at)}
                    </p>
                  </div>
                  <button
                    onClick={handleRemoveCertificate}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                  >
                    ลบไฟล์
                  </button>
                </div>

                {form.blood_certificate_data && form.blood_certificate_mime.startsWith('image/') && (
                  <img
                    src={form.blood_certificate_data}
                    alt="Blood certificate"
                    className="w-full h-40 object-cover rounded-xl border border-slate-100"
                  />
                )}

                {form.blood_certificate_data && (
                  <a
                    href={form.blood_certificate_data}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800"
                  >
                    <Icon name="open_in_new" className="w-4 h-4" />
                    เปิดเอกสาร
                  </a>
                )}
              </div>
            )}
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || uploadingCertificate}
            className="w-full h-12 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-2xl"
          >
            {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </Button>

          {savedAt && (
            <p className="text-xs text-emerald-700 text-center">บันทึกสำเร็จเมื่อ {savedAt.toLocaleTimeString('th-TH')}</p>
          )}
        </div>
        )}

        {activeProfileTab === 'swipes' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
          <button
            onClick={() => setSwipeHistoryOpen((prev) => !prev)}
            className="w-full flex items-center justify-between"
          >
            <h2 className="text-lg font-bold text-slate-800">เมนูที่คุณปัดล่าสุด</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{recentSwipes.length} รายการ</span>
              <Icon
                name={swipeHistoryOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                className="w-5 h-5 text-slate-400"
              />
            </div>
          </button>

          <AnimatePresence initial={false}>
            {swipeHistoryOpen && (
              <motion.div
                key="swipe-history-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {recentSwipes.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
                    ยังไม่มีประวัติการปัดเมนู ลองไปปัดเมนูที่หน้า Discover
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentSwipes.map((swipe) => {
                      const direction = swipeDirectionMeta[swipe.direction] || {
                        label: swipe.direction || 'ไม่ระบุ',
                        className: 'bg-slate-100 text-slate-700 border-slate-200',
                        icon: 'history',
                      };
                      const menuName = swipe.menu?.name_th || swipe.menu?.name || swipe.menu?.name_en || `เมนู #${swipe.menu_id}`;
                      const menuSub = swipe.menu?.name_en || swipe.menu?.region || 'เมนูอาหารไทย';

                      return (
                        <div key={swipe.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-2.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={swipe.menu?.image_url || fallbackSwipeImage}
                              alt={menuName}
                              className="w-14 h-14 rounded-xl object-cover"
                              onError={(event) => {
                                event.currentTarget.src = fallbackSwipeImage;
                              }}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-800 line-clamp-1">{menuName}</p>
                              <p className="text-xs text-slate-500 line-clamp-1">{menuSub}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{normalizeSwipeDate(swipe.created_date)}</p>
                            </div>
                            <span className={`inline-flex items-center gap-1 rounded-xl border px-2 py-1 text-[11px] font-semibold ${direction.className}`}>
                              <Icon name={direction.icon} className="w-3.5 h-3.5" />
                              {direction.label}
                            </span>
                          </div>
                          <div className="mt-2 flex justify-end">
                            <button
                              onClick={() => navigate(createPageUrl('Recommendation') + `?menuId=${swipe.menu.id}`)}
                              className="inline-flex items-center gap-1 rounded-xl border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-[11px] font-semibold text-violet-700"
                            >
                              <Icon name="restaurant_menu" className="w-3.5 h-3.5" />
                              ดูสูตรเมนูนี้
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        )}

        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-2">
          <button
            onClick={() => navigate(createPageUrl('Discover'))}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 font-medium"
          >
            ไปหน้าเลือกเมนู
          </button>
          <button
            onClick={handleLogout}
            className="w-full rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-600 font-medium"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  );
}
