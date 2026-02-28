import React from 'react';
import Icon from '@/components/ui/Icon';

export default function CreatePostPrompt({ userName, onPress }) {
    return (
        <div className="bg-white px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {userName?.[0]?.toUpperCase() || '👤'}
                </div>
                <button
                    onClick={onPress}
                    className="flex-1 bg-slate-50 hover:bg-slate-100 transition-colors rounded-full px-4 py-2.5 text-left"
                >
                    <span className="text-sm text-slate-400">คุณทำเมนูอะไรวันนี้?</span>
                </button>
            </div>

            <div className="flex items-center justify-around mt-3 pt-2 border-t border-slate-50">
                <button className="flex items-center gap-1.5 text-slate-500 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors">
                    <Icon name="photo_camera" className="w-5 h-5 text-emerald-500" />
                    <span className="text-xs font-medium">รูปภาพ</span>
                </button>
                <button className="flex items-center gap-1.5 text-slate-500 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors">
                    <Icon name="restaurant" className="w-5 h-5 text-orange-500" />
                    <span className="text-xs font-medium">สูตรอาหาร</span>
                </button>
                <button className="flex items-center gap-1.5 text-slate-500 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors">
                    <Icon name="sell" className="w-5 h-5 text-cyan-500" />
                    <span className="text-xs font-medium">แท็ก</span>
                </button>
            </div>
        </div>
    );
}
