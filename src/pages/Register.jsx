import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '@/images/logo2.png';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('กรุณากรอก Email และรหัสผ่าน');
      return;
    }
    if (form.password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }
    setLoading(true);
    try {
      await register(form.email, form.password, form.name);
      navigate(createPageUrl('Onboarding'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-teal-50/40 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full blur-3xl opacity-40 translate-y-1/2 -translate-x-1/2" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <img src={logo} alt="WongKhao" className="w-12 h-12 rounded-2xl object-contain" />
          <div>
            <h1 className="text-xl font-bold text-slate-800">WongKhao</h1>
            <p className="text-xs text-slate-500">วงข้าว</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-slate-100 shadow-xl shadow-slate-100 p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">สมัครสมาชิก</h2>
          <p className="text-sm text-slate-500 mb-6">สร้างบัญชีเพื่อเริ่มดูแลสุขภาพ</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">ชื่อ (ไม่บังคับ)</label>
              <Input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="ชื่อของคุณ"
                className="rounded-xl border-slate-200 focus:border-teal-400 focus:ring-teal-400/20"
                autoComplete="name"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">Email</label>
              <Input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="rounded-xl border-slate-200 focus:border-teal-400 focus:ring-teal-400/20"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">รหัสผ่าน</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  className="rounded-xl border-slate-200 focus:border-teal-400 focus:ring-teal-400/20 pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">ยืนยันรหัสผ่าน</label>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="rounded-xl border-slate-200 focus:border-teal-400 focus:ring-teal-400/20"
                autoComplete="new-password"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-rose-500 bg-rose-50 rounded-xl px-4 py-2.5"
              >
                {error}
              </motion.p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-xl shadow-lg shadow-teal-200 font-medium mt-2"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  สมัครสมาชิก
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          มีบัญชีอยู่แล้ว?{' '}
          <Link
            to={createPageUrl('Login')}
            className="font-semibold text-teal-600 hover:text-teal-700"
          >
            เข้าสู่ระบบ
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
