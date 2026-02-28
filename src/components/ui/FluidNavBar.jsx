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
        const index = navItems.findIndex(item => item.path === currentPageName.toLowerCase());
        if (index !== -1) {
            setActiveIndex(index);
        }
    }, [currentPageName, navItems]);

    const handleNav = (index, path) => {
        setActiveIndex(index);
        // Slight delay allows animation to start before routing
        setTimeout(() => {
            navigate(createPageUrl(path));
        }, 150);
    };

    // Calculate position for the cutout based on active index
    // Assuming equal distribution and dynamic width
    const itemWidth = 100 / navItems.length;
    const cutoutLeftPercent = (activeIndex * itemWidth) + (itemWidth / 2);

    return (
        <div className="fixed bottom-0 left-0 right-0 w-full z-50 pointer-events-none pb-0">
            {/* The main wrapper. Using w-full but keeping centering if needed, or remove max-w to span full width */}
            <div className="relative w-full h-20 pointer-events-auto bg-transparent mx-auto sm:max-w-md">

                {/* Floating Active Circle (The Button) */}
                <motion.div
                    // Changed from -translate-y-3 to -translate-y-1 to sit lower into the notch
                    className="absolute top-0 w-[60px] h-[60px] rounded-full flex items-center justify-center -translate-y-1 -translate-x-1/2 z-20"
                    initial={false}
                    animate={{ left: `${cutoutLeftPercent}%` }}
                    transition={{ type: "spring", stiffness: 350, damping: 25, mass: 0.8 }}
                >
                    <div className="w-[60px] h-[60px] rounded-full bg-[#1B4332] flex items-center justify-center shadow-lg relative overflow-hidden">
                        <Icon
                            name={navItems[activeIndex]?.icon}
                            filled={true}
                            className="text-[28px] text-white"
                        />
                    </div>
                </motion.div>

                {/* Background Layer with Precise SVG Curve */}
                <div className="absolute bottom-0 w-full h-[72px] overflow-hidden drop-shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
                    <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 400 72"
                        preserveAspectRatio="none"
                        className="absolute bottom-0 w-full h-full text-white"
                    >
                        <defs>
                            <mask id="hole-mask">
                                <rect width="100%" height="100%" fill="white" />
                                <motion.g
                                    initial={false}
                                    animate={{ x: `calc(${cutoutLeftPercent}% - 60px)` }}
                                    transition={{ type: "spring", stiffness: 350, damping: 25, mass: 0.8 }}
                                >
                                    <path
                                        d="M 0,0 
                                           C 30,0 35,38 60,38 
                                           C 85,38 90,0 120,0 
                                           L 120,-20 L 0,-20 Z"
                                        fill="black"
                                    />
                                </motion.g>
                            </mask>
                        </defs>
                        <rect x="0" y="0" width="100%" height="100%" fill="currentColor" mask="url(#hole-mask)" />
                    </svg>
                </div>

                {/* Navigation Items container */}
                {/* Changed top-6 to top-2 to pull the icons up and give text room at the bottom */}
                <div className="absolute inset-0 top-2 h-[70px] flex justify-around items-center px-2 z-30">
                    {navItems.map((item, index) => {
                        const isActive = index === activeIndex;

                        return (
                            <button
                                key={item.path}
                                onClick={() => handleNav(index, item.path)}
                                className="flex-1 h-full flex flex-col items-center justify-center relative outline-none tap-transparent group"
                            >
                                <div className={`flex flex-col items-center justify-center transition-all duration-200 pt-1 ${isActive ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
                                    {/* Icon */}
                                    <Icon
                                        name={item.icon}
                                        filled={false}
                                        className="text-[24px] text-slate-400 group-hover:text-emerald-700 transition-colors"
                                    />
                                    {/* Label: Increased size to text-xs and font-bold */}
                                    <span className="text-xs font-bold mt-1 text-slate-500 group-hover:text-emerald-800 tracking-wide transition-colors">
                                        {item.label}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
            {/* Global style for tap higlight removal */}
            <style>{`
                .tap-transparent { -webkit-tap-highlight-color: transparent; }
            `}</style>
        </div>
    );
}
