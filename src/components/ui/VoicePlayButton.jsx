import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "@/components/ui/Icon";

export default function VoicePlayButton({
  text,
  audioId,
  isPlaying,
  isLoading,
  onPlay,
  size = "default", // "default" for ingredients/steps headers, "small" for individual steps
  label = "ฟังเสียง",
}) {
  const isSmall = size === "small";

  return (
    <motion.button
      onClick={(e) => {
        e.stopPropagation();
        onPlay(text, audioId);
      }}
      disabled={isLoading}
      layout
      animate={{
        width: isPlaying ? (isSmall ? 100 : 160) : "auto",
        transition: { type: "spring", bounce: 0.2, duration: 0.5 },
      }}
      className={`relative overflow-hidden flex items-center justify-center transition-shadow shadow-sm ${
        isPlaying
          ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-violet-300/50 hover:shadow-violet-400/60"
          : isSmall
          ? "bg-transparent text-emerald-400 hover:text-emerald-500 hover:bg-emerald-50/50"
          : "bg-white text-emerald-600 border border-emerald-100/80 hover:border-emerald-200 hover:bg-emerald-50/50"
      } ${
        isSmall
          ? isPlaying
            ? "h-8 rounded-full px-3 gap-2" // Playing small
            : "w-8 h-8 rounded-full p-1.5" // Idle small
          : isPlaying
          ? "h-9 rounded-full px-4 gap-2.5" // Playing default
          : "h-9 rounded-full px-3.5 gap-2" // Idle default
      }`}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center justify-center w-full h-full"
          >
            <Icon
              name="progress_activity"
              className={`${isSmall ? "w-[18px] h-[18px]" : "w-5 h-5"} animate-spin`}
            />
          </motion.div>
        ) : isPlaying ? (
          <motion.div
            key="playing"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center w-full h-full justify-between"
          >
            <Icon name="pause" className={`${isSmall ? "w-[16px] h-[16px]" : "w-[18px] h-[18px]"} flex-shrink-0 text-white/90 drop-shadow-sm`} />
            
            {/* Animated Waveform */}
            <div className="flex items-center justify-center gap-[2px] h-3 ml-1.5">
              {[...Array(isSmall ? 4 : 6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-white/90 rounded-full drop-shadow-sm"
                  animate={{
                    height: ["20%", "100%", "40%", "80%", "30%"],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut",
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
            
            {!isSmall && (
              <span className="text-[12px] font-bold tracking-wide ml-2 text-white/90">
                PLAYING
              </span>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center justify-center w-full h-full"
          >
            <Icon name="volume_up" className={`${isSmall ? "w-[18px] h-[18px]" : "w-5 h-5"}`} />
            {!isSmall && (
              <span className="text-[12px] font-bold ml-1.5">{label}</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shimmer effect when playing */}
      {isPlaying && (
        <motion.div
          className="absolute inset-0 -translate-x-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
          animate={{
            translateX: ["100%", "-100%"],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}
    </motion.button>
  );
}
