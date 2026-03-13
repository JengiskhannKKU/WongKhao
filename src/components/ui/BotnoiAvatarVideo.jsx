import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "@/components/ui/Icon";

export default function BotnoiAvatarVideo({ 
  voiceId, 
  text, 
  isPlaying, 
  onClose,
  actorName,
  actorImage,
  actorFallbackColor
}) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <AnimatePresence>
      {isPlaying && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: "auto", marginTop: 12 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          className="w-full overflow-hidden"
        >
          <div className="relative w-full rounded-2xl bg-slate-900 overflow-hidden shadow-lg border border-slate-800">
            {/* Aspect Ratio Container 16:9 like video */}
            <div className="w-full pb-[56.25%] relative">
              
              {/* Animated Background Mesh */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-900/60 via-slate-900 to-emerald-900/40 opacity-50" />
              <motion.div 
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-500/20 via-transparent to-transparent blur-xl"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Main Video Content Area */}
              <div className="absolute inset-0 p-4 flex flex-col justify-between">
                
                {/* Header (Live Badge & Actor Name) */}
                <div className="flex justify-between items-start z-20">
                  <div className="flex gap-2">
                    <div className="bg-rose-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm border border-rose-400/50">
                      <motion.div 
                        className="w-1.5 h-1.5 rounded-full bg-white"
                        animate={{ opacity: [1, 0.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      LIVE AUDIO
                    </div>
                    <div className="bg-black/50 backdrop-blur-sm text-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-slate-700/50">
                      Mockup Video
                    </div>
                  </div>
                  
                  <button 
                    onClick={onClose}
                    className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/80 transition-colors border border-white/10"
                  >
                    <Icon name="close" className="text-[16px]" />
                  </button>
                </div>

                {/* Center Avatar / 'Talking' Subject */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative">
                    {/* Pulsing Rings (Talking Effect) */}
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-violet-400/40"
                      animate={{ 
                        scale: [1, 1.5, 2],
                        opacity: [0.6, 0.2, 0]
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                        ease: "easeOut",
                        delay: 0
                      }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-fuchsia-400/40"
                      animate={{ 
                        scale: [1, 1.8, 2.5],
                        opacity: [0.5, 0.1, 0]
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                        ease: "easeOut",
                        delay: 0.5
                      }}
                    />

                    {/* Avatar Image */}
                    <div className={`w-20 h-20 rounded-full overflow-hidden border-[3px] border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.5)] z-10 relative bg-slate-800 flex flex-col items-center justify-center ${!actorImage && actorFallbackColor ? actorFallbackColor.replace('text-', 'text-white bg-').replace('100', '600') : ''}`}>
                      {actorImage ? (
                        <img 
                          src={actorImage} 
                          alt="Voice Actor" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`absolute inset-0 items-center justify-center text-2xl font-bold ${actorImage ? "hidden" : "flex"}`}>
                        {actorName ? actorName[0] : "?"}
                      </div>

                      {/* Small Mic Icon overlay */}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                        <Icon name="mic" className="text-[12px] text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Subtitles overlay */}
                <div className="z-20 w-full mt-auto">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-violet-300 font-bold text-xs drop-shadow-md flex items-center gap-1">
                      <Icon name="record_voice_over" className="text-[14px]" />
                      {actorName || "Botnoi Voice"}
                    </span>
                  </div>
                  <div className="bg-black/40 backdrop-blur-md rounded-xl p-3 border border-white/10 w-full">
                    <p className="text-white/95 text-xs sm:text-sm font-medium leading-relaxed drop-shadow-sm min-h-[40px]">
                      {text}{dots}
                    </p>
                    
                    {/* Animated Audio Bars in Subtitle Box */}
                    <div className="flex items-center gap-[2px] h-2 mt-2 opacity-70">
                      {[...Array(12)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 bg-violet-400 rounded-full"
                          animate={{
                            height: ["20%", "100%", "30%", "80%", "40%"],
                          }}
                          transition={{
                            duration: 0.8 + Math.random() * 0.5,
                            repeat: Infinity,
                            repeatType: "mirror",
                            ease: "easeInOut",
                            delay: i * 0.05,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
