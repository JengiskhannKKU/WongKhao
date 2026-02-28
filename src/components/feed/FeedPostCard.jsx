import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from '@/components/ui/Icon';

const reactionEmojis = [
    { emoji: '👍', label: 'ถูกใจ' },
    { emoji: '❤️', label: 'รัก' },
    { emoji: '🔥', label: 'ร้อนแรง' },
    { emoji: '😋', label: 'น่ากิน' },
    { emoji: '💪', label: 'เฮลตี้' },
];

export default function FeedPostCard({ post }) {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes || 0);
    const [showReactions, setShowReactions] = useState(false);

    const handleLike = () => {
        setLiked(!liked);
        setLikeCount(prev => liked ? prev - 1 : prev + 1);
    };

    const handleReaction = (emoji) => {
        setLiked(true);
        setLikeCount(prev => prev + 1);
        setShowReactions(false);
    };

    const timeAgo = (hours) => {
        if (hours < 1) return 'เมื่อกี้';
        if (hours < 24) return `${hours} ชม.`;
        return `${Math.floor(hours / 24)} วัน`;
    };

    return (
        <div className="bg-white mb-2">
            {/* Post Header */}
            <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                    {post.avatar ? (
                        <img src={post.avatar} alt={post.userName} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
                            {post.userName?.[0]?.toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-[14px] text-slate-800">{post.userName}</span>
                        {post.badge && (
                            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {post.badge}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
                        <span>{timeAgo(post.hoursAgo)}</span>
                        <span>•</span>
                        <Icon name="public" className="w-3 h-3" />
                    </div>
                </div>
                <button className="text-slate-400 hover:bg-slate-50 p-1 rounded-full">
                    <Icon name="more_horiz" className="w-6 h-6" />
                </button>
            </div>

            {/* Caption */}
            {post.caption && (
                <div className="px-4 pb-2">
                    <p className="text-[14px] text-slate-700 leading-relaxed whitespace-pre-line">{post.caption}</p>
                </div>
            )}

            {/* Recipe tag */}
            {post.menuName && (
                <div className="px-4 pb-2">
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                        <Icon name="restaurant" className="w-3.5 h-3.5" />
                        {post.menuName}
                    </span>
                </div>
            )}

            {/* Image */}
            <div className="relative">
                <img
                    src={post.image}
                    alt={post.menuName || 'recipe'}
                    className="w-full aspect-[4/3] object-cover"
                />

                {/* Health stats overlay */}
                {(post.sodiumReduced || post.caloriesReduced) && (
                    <div className="absolute bottom-3 left-3 flex gap-2">
                        {post.sodiumReduced && (
                            <div className="bg-emerald-500/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
                                <Icon name="trending_down" className="w-3 h-3 text-white" />
                                <span className="text-[11px] font-bold text-white">-{post.sodiumReduced}% โซเดียม</span>
                            </div>
                        )}
                        {post.caloriesReduced && (
                            <div className="bg-orange-500/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
                                <Icon name="local_fire_department" className="w-3 h-3 text-white" />
                                <span className="text-[11px] font-bold text-white">-{post.caloriesReduced}% แคล</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Reaction summary */}
            <div className="px-4 pt-2 pb-1 flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <div className="flex -space-x-1">
                        <span className="text-sm">👍</span>
                        <span className="text-sm">❤️</span>
                        <span className="text-sm">🔥</span>
                    </div>
                    <span className="text-xs text-slate-500 ml-1">{likeCount}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{post.comments || 0} ความคิดเห็น</span>
                    <span>{post.shares || 0} แชร์</span>
                </div>
            </div>

            {/* Action buttons */}
            <div className="px-2 py-1 border-t border-slate-100 flex items-center relative">
                <button
                    onClick={handleLike}
                    onMouseEnter={() => setShowReactions(true)}
                    onMouseLeave={() => setTimeout(() => setShowReactions(false), 1500)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-slate-50 transition-colors ${liked ? 'text-blue-500' : 'text-slate-500'}`}
                >
                    <Icon name="thumb_up" className="w-5 h-5" filled={liked} />
                    <span className="text-[13px] font-medium">ถูกใจ</span>
                </button>

                {/* Reaction popup */}
                {showReactions && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        onMouseEnter={() => setShowReactions(true)}
                        onMouseLeave={() => setShowReactions(false)}
                        className="absolute left-2 -top-12 bg-white rounded-full shadow-xl border border-slate-100 px-2 py-1 flex gap-1 z-20"
                    >
                        {reactionEmojis.map((r) => (
                            <button
                                key={r.emoji}
                                onClick={() => handleReaction(r.emoji)}
                                className="w-9 h-9 rounded-full hover:bg-slate-50 flex items-center justify-center text-xl transition-transform hover:scale-125"
                                title={r.label}
                            >
                                {r.emoji}
                            </button>
                        ))}
                    </motion.div>
                )}

                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-500">
                    <Icon name="chat_bubble_outline" className="w-5 h-5" />
                    <span className="text-[13px] font-medium">แสดงความเห็น</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-500">
                    <Icon name="share" className="w-5 h-5" />
                    <span className="text-[13px] font-medium">แชร์</span>
                </button>
            </div>

            {/* Top comment preview */}
            {post.topComment && (
                <div className="px-4 py-2 border-t border-slate-50 flex items-start gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0 mt-0.5">
                        {post.topComment.name?.[0]}
                    </div>
                    <div className="bg-slate-50 rounded-2xl px-3 py-2 flex-1">
                        <span className="text-xs font-semibold text-slate-700">{post.topComment.name}</span>
                        <p className="text-xs text-slate-600 mt-0.5">{post.topComment.text}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
