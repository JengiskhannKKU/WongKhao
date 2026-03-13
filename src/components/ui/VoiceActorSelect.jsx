import React from "react";
import { motion } from "framer-motion";

export const BOTNOI_VOICES = [
  {
    id: "8",
    name: "เอวา V2",
    gender: "Female",
    age: "Adult",
    type: "เล่าเรื่อง",
    tags: ["🇹🇭 + อื่นๆ"],
    image: "",
    fallbackColor: "bg-pink-100 text-pink-600",
  },
  {
    id: "4",
    name: "สมโชค V2",
    gender: "Male",
    age: "Adult",
    type: "เล่าเรื่อง",
    tags: ["🇹🇭 + อื่นๆ"],
    image: "",
    fallbackColor: "bg-blue-100 text-blue-600",
  },
  {
    id: "9",
    name: "เลโอ V2",
    gender: "Male",
    age: "Adult",
    type: "เล่าเรื่อง",
    tags: ["🇹🇭 + อื่นๆ"],
    image: "",
    fallbackColor: "bg-indigo-100 text-indigo-600",
  },
  {
    id: "12",
    name: "นาเดียร์ V2",
    gender: "Female",
    age: "Teen",
    type: "บรรยาย",
    tags: ["🇬🇧🇹🇭 + อื่นๆ"],
    image: "",
    fallbackColor: "bg-cyan-100 text-cyan-600",
  },
  {
    id: "13",
    name: "เนโอ V2",
    gender: "Male",
    age: "Teen",
    type: "บรรยาย",
    tags: ["🇹🇭 + อื่นๆ"],
    image: "",
    fallbackColor: "bg-green-100 text-green-600",
  },
  {
    id: "23",
    name: "โบ V2",
    gender: "Female",
    age: "Child",
    type: "เล่าเรื่อง",
    tags: ["🇹🇭 + อื่นๆ"],
    image: "",
    fallbackColor: "bg-yellow-100 text-yellow-700",
  },
  {
    id: "73",
    name: "อ้าย V2",
    gender: "Male",
    age: "Adult",
    type: "เล่าเรื่อง",
    tags: ["🇹🇭 อีสาน"],
    image: "",
    fallbackColor: "bg-orange-100 text-orange-600",
  },
  {
    id: "85",
    name: "ไข่นุ้ย V2",
    gender: "Male",
    age: "Adult",
    type: "บรรยาย",
    tags: ["🇹🇭 ใต้"],
    image: "",
    fallbackColor: "bg-teal-100 text-teal-600",
  },
  {
    id: "87",
    name: "อ้ายถิน V2",
    gender: "Female",
    age: "Adult",
    type: "เล่าเรื่อง",
    tags: ["🇹🇭 เหนือ"],
    image: "",
    fallbackColor: "bg-rose-100 text-rose-600",
  },
];

export default function VoiceActorSelect({ selectedId, onSelect }) {
  return (
    <div className="mb-6 mt-2">
      <h4 className="text-sm font-bold text-slate-800 mb-2.5 ml-1">
        เลือกนักพากย์เสียง (Voice Actor)
      </h4>
      <div className="flex overflow-x-auto gap-3 pb-3 scrollbar-hide snap-x px-1">
        {BOTNOI_VOICES.map((voice) => {
          const isSelected = selectedId === voice.id;

          return (
            <motion.button
              type="button"
              key={voice.id}
              onClick={() => onSelect(voice.id)}
              whileTap={{ scale: 0.95 }}
              className={`relative flex items-center gap-2.5 p-2 rounded-2xl border-2 transition-all flex-shrink-0 snap-start text-left w-[170px] ${
                isSelected
                  ? "bg-violet-50 border-violet-500 shadow-md shadow-violet-200/50"
                  : "bg-white border-slate-100 shadow-sm hover:border-violet-200 hover:bg-slate-50"
              }`}
            >
              {/* Premium Quality Badge for selected items like in the screenshot */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-[8px] font-black text-white px-1.5 py-0.5 rounded-full shadow-sm border border-yellow-200 z-10">
                  SELECTED
                </div>
              )}

              {/* Avatar */}
              <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow-inner flex-shrink-0 bg-slate-100 border border-slate-200/50">
                {voice.image ? (
                  <img
                    src={voice.image}
                    alt={voice.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = "none";
                      e.target.nextElementSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                {/* Fallback avatar if image fails to load or isn't provided */}
                <div
                  className={`absolute inset-0 items-center justify-center font-bold text-sm leading-none ${
                    voice.image ? "hidden" : "flex"
                  } ${voice.fallbackColor}`}
                >
                  {voice.name[0]}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[13px] text-slate-800 truncate leading-none">
                    {voice.name}
                  </span>
                </div>
                <div className="flex items-center flex-wrap gap-1 mt-1.5">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      voice.tags[0].includes("อีสาน")
                        ? "bg-orange-100 text-orange-700"
                        : voice.tags[0].includes("ใต้")
                        ? "bg-teal-100 text-teal-700"
                        : voice.tags[0].includes("เหนือ")
                        ? "bg-rose-100 text-rose-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {voice.tags[0]}
                  </span>
                  <span className="text-[9px] font-medium text-slate-500 truncate">
                    {voice.gender === "Female" ? "ญ" : "ช"}/{voice.age}
                  </span>

                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
