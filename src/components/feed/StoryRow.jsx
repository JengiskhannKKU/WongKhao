import React from 'react';

const stories = [
    { id: 0, name: 'สร้างสตอรี่', img: null, isCreate: true },
    { id: 1, name: 'สมชาย', img: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=150&h=150&fit=crop&q=80', hasNew: true },
    { id: 2, name: 'วิภา', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&h=150&fit=crop&q=80', hasNew: true },
    { id: 3, name: 'ปิยะ', img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=150&h=150&fit=crop&q=80', hasNew: true },
    { id: 4, name: 'มานี', img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=150&h=150&fit=crop&q=80', hasNew: false },
    { id: 5, name: 'กิตติ', img: 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=150&h=150&fit=crop&q=80', hasNew: true },
];

export default function StoryRow() {
    return (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 py-3">
            {stories.map((story) => (
                <div key={story.id} className="flex flex-col items-center gap-1 min-w-[68px] cursor-pointer">
                    {story.isCreate ? (
                        <>
                            <div className="w-[62px] h-[62px] rounded-full bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300 relative">
                                <span className="text-2xl text-emerald-600 font-bold">+</span>
                            </div>
                            <span className="text-[10px] font-semibold text-slate-500 leading-tight text-center">{story.name}</span>
                        </>
                    ) : (
                        <>
                            <div className={`w-[62px] h-[62px] rounded-full p-[3px] ${story.hasNew
                                ? 'bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400'
                                : 'bg-slate-200'
                                }`}>
                                <img
                                    src={story.img}
                                    alt={story.name}
                                    className="w-full h-full rounded-full object-cover border-[3px] border-white"
                                />
                            </div>
                            <span className="text-[10px] font-semibold text-slate-600 leading-tight text-center truncate w-[62px]">{story.name}</span>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}
