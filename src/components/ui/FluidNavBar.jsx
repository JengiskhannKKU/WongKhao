import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/Icon';
import { createPageUrl } from '@/utils';

export default function FluidNavBar({ navItems, currentPageName }) {
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(0);

    // Sync active index with URL changes
    useEffect(() => {
        const index = navItems.findIndex(item => item.path === currentPageName.toLowerCase() && !item.isAction);
        if (index !== -1) {
            setActiveIndex(index);
        }
    }, [currentPageName, navItems]);

    const handleNav = (index, item) => {
        if (item.isAction) {
            // Placeholder for create post action
            alert("Create post clicked!");
            return;
        }

        setActiveIndex(index);
        setTimeout(() => {
            navigate(createPageUrl(item.path));
        }, 100);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 w-full z-50 bg-white border-t border-slate-100 pb-safe">
            <div className="max-w-md mx-auto h-[60px] flex justify-between items-center px-4">
                {navItems.map((item, index) => {
                    const isCenterBtn = item.isAction;
                    // Find actual active index among non-action items
                    const isActive = !isCenterBtn && index === activeIndex;

                    if (isCenterBtn) {
                        return (
                            <button
                                key={item.path}
                                onClick={() => handleNav(index, item)}
                                className="flex flex-col items-center justify-center outline-none tap-transparent shrink-0 mx-2"
                            >
                                <div className="w-[42px] h-[32px] rounded-xl bg-[#fbbf24] flex items-center justify-center shadow-sm -mt-2">
                                    <Icon name={item.icon} className="w-6 h-6 text-black" filled={true} />
                                </div>
                            </button>
                        );
                    }

                    return (
                        <button
                            key={item.path}
                            onClick={() => handleNav(index, item)}
                            className="flex-1 h-full flex flex-col items-center justify-center relative outline-none tap-transparent group"
                        >
                            <div className="flex flex-col items-center justify-center pt-1 w-full gap-0.5">
                                <Icon
                                    name={item.icon}
                                    filled={isActive}
                                    className={`w-6 h-6 transition-colors ${isActive ? 'text-black' : 'text-slate-400'}`}
                                />
                                <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-black font-bold' : 'text-slate-500'}`}>
                                    {item.label}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
            {/* Global style for tap higlight removal and safe area padding iOS */}
            <style>{`
                .tap-transparent { -webkit-tap-highlight-color: transparent; }
                .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
            `}</style>
        </div>
    );
}
