import React from 'react';

export default function Community() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-white">
      <div className="max-w-sm mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">วงข้าว</h1>
        <p className="text-sm text-slate-600 mb-6">ชุมชนคนรักสุขภาพ</p>

        <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🍜</span>
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">เร็วๆ นี้</h2>
          <p className="text-sm text-slate-500">
            ฟีเจอร์ชุมชนกำลังพัฒนา แชร์เมนูสุขภาพกับเพื่อนๆ ได้เร็วๆ นี้
          </p>
        </div>
      </div>
    </div>
  );
}
