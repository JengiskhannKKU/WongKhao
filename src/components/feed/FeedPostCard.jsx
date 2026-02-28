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
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 mb-4 inline-block w-full">
            {/* Image (Top) */}
            <div className="relative">
                <img
                    src={post.image}
                    alt={post.menuName || 'recipe'}
                    className="w-full object-cover"
                    style={{ aspectRatio: post.id % 2 === 0 ? '3/4' : '1/1' }} // Mix aspect ratios for masonry effect
                />

                {/* Tags overlay */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {post.menuName && (
                        <span className="bg-amber-400/90 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            {post.menuName}
                        </span>
                    )}
                </div>
            </div>

            {/* Content (Bottom) */}
            <div className="p-3">
                {/* Caption / Title */}
                {post.caption && (
                    <p className="text-[13px] font-bold text-slate-800 leading-snug line-clamp-2 mb-2">
                        {post.caption}
                    </p>
                )}

                {/* User Info & Likes Row */}
                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 bg-slate-100">
                            {post.avatar ? (
                                <img src={post.avatar} alt={post.userName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[10px] font-bold">
                                    {post.userName?.[0]?.toUpperCase()}
                                </div>
                            )}
                        </div>
                        <span className="text-[11px] font-medium text-slate-600 truncate">
                            {post.userName}
                        </span>
                    </div>

                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-1 shrink-0 ${liked ? 'text-rose-500' : 'text-slate-400'} transition-colors`}
                    >
                        <Icon name={liked ? "favorite" : "favorite_border"} className="w-3.5 h-3.5" filled={liked} />
                        <span className="text-[11px] font-medium">{likeCount}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
