import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { localStore } from '@/api/apiStore';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import Icon from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import { syncUserProfileToGraph } from '@/api/behaviorAnalytics';

const goalOptions = [
  { value: 'reduce_sodium', label: 'ลดโซเดียม', icon: 'water_drop' },
  { value: 'lose_weight', label: 'ลดน้ำหนัก', icon: 'local_fire_department' },
  { value: 'eat_clean', label: 'กินคลีน', icon: 'eco' },
  { value: 'heart_health', label: 'ดูแลหัวใจ', icon: 'favorite' }
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: '',
    age: '',
    health_goal: 'reduce_sodium',
    sodium_limit: 1500,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      let existing = null;
      try {
        existing = await localStore.entities.UserProfile.get(user.id);
      } catch {
        existing = null;
      }

      setProfile(existing);
      setForm({
        name: existing?.name || user?.name || '',
        age: existing?.age ? String(existing.age) : '',
        health_goal: existing?.health_goal || 'reduce_sodium',
        sodium_limit: existing?.sodium_limit || 1500,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const parsedAge = Number.parseInt(form.age, 10);
      const parsedSodium = Number.parseInt(String(form.sodium_limit), 10);

      const payload = {
        name: form.name || user?.name || null,
        age: Number.isNaN(parsedAge) ? null : parsedAge,
        health_goal: form.health_goal,
        sodium_limit: Number.isNaN(parsedSodium) ? 1500 : parsedSodium,
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
          <div className="mt-4 grid grid-cols-3 gap-2">
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
          </div>
        </div>

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

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-12 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-2xl"
          >
            {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </Button>

          {savedAt && (
            <p className="text-xs text-emerald-700 text-center">บันทึกสำเร็จเมื่อ {savedAt.toLocaleTimeString('th-TH')}</p>
          )}
        </div>

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
