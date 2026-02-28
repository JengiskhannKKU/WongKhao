import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/Icon";
import { motion } from "framer-motion";

export default function CreatePost() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-gray-800"
        >
          <Icon name="arrow_back_ios_new" className="w-5 h-5" />
        </button>
        <span className="text-sm font-bold text-gray-800">ตัวอย่าง</span>
      </div>

      <div className="flex-1 overflow-y-auto w-full max-w-md mx-auto relative bg-white pb-24">
        {/* Image Selection Area */}
        <div className="flex items-center gap-3 px-4 py-4 overflow-x-auto scrollbar-hide">
          {/* Mock selected image */}
          <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop"
              alt="selected"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md font-medium">
              ปก
            </div>
            {/* Remove button */}
            <button className="absolute top-1 right-1 bg-black/40 rounded-full p-0.5 text-white">
              <Icon name="close" className="w-3 h-3" />
            </button>
          </div>

          {/* Add Image Button */}
          <button className="w-20 h-20 rounded-xl border border-gray-200 border-dashed flex items-center justify-center text-gray-400 flex-shrink-0 hover:bg-gray-50 transition-colors">
            <Icon name="add" className="w-8 h-8 font-light" />
          </button>
        </div>

        <div className="px-4">
          <div className="h-[1px] w-full bg-gray-100 my-2" />
        </div>

        {/* Title Input */}
        <div className="px-4 py-2 flex items-center justify-between gap-3">
          <input
            type="text"
            placeholder="เพิ่มพาดหัว"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 min-w-0 text-lg font-bold placeholder-gray-400 border-none outline-none bg-transparent py-2"
          />
          <button className="flex-shrink-0 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap">
            <Icon name="auto_fix_high" className="w-[14px] h-[14px]" />
            <span>หัวข้อเรื่องอัจฉริยะ</span>
          </button>
        </div>

        <div className="px-4">
          <div className="h-[1px] w-full bg-gray-100" />
        </div>

        {/* Content Input Area */}
        <div className="px-4 py-3">
          <textarea
            placeholder="โพสต์อะไรบางอย่างเลย"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[150px] text-base text-gray-800 placeholder-gray-400 border-none outline-none bg-transparent resize-none leading-relaxed"
          />
        </div>

        {/* Toolbar */}
        <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <button className="bg-gray-50 text-gray-700 border border-gray-100 rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 whitespace-nowrap hover:bg-gray-100 transition-colors">
            <Icon name="edit_note" className="w-4 h-4" />
            ไอเดียแคปชั่น
          </button>
          <button className="bg-gray-50 text-gray-700 border border-gray-100 rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 whitespace-nowrap hover:bg-gray-100 transition-colors">
            <Icon name="location_on" className="w-4 h-4" />
            สถานที่
          </button>
          <button className="bg-gray-50 text-gray-700 border border-gray-100 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium hover:bg-gray-100 transition-colors flex-shrink-0">
            @
          </button>
          <button className="bg-gray-50 text-gray-700 border border-gray-100 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium hover:bg-gray-100 transition-colors flex-shrink-0">
            #
          </button>
        </div>

        <div className="px-4 py-2">
          <div className="h-[1px] w-full bg-gray-100" />
        </div>

        {/* Options List */}
        <div className="px-4 flex flex-col">
          <div className="py-4 flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3 text-gray-800">
              <Icon name="location_on" className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-[15px]">
                เพิ่มตำแหน่งที่ตั้ง
              </span>
            </div>
            <Icon
              name="chevron_right"
              className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors"
            />
          </div>

          <div className="py-4 flex items-center justify-between group cursor-pointer border-t border-gray-50">
            <div className="flex items-center gap-3 text-gray-800">
              <Icon name="share" className="w-5 h-5 text-gray-600" />
              <div className="flex items-center gap-1">
                <span className="font-semibold text-[15px]">
                  แชร์ไปยังแพลตฟอร์มอื่น
                </span>
                <Icon name="info" className="w-3.5 h-3.5 text-gray-400 ml-1" />
              </div>
            </div>
            {/* Custom Toggle Switch */}
            <div className="w-11 h-6 bg-gray-200 rounded-full relative transition-colors cursor-pointer">
              <div className="w-5 h-5 bg-white rounded-full absolute top-[2px] left-[2px] shadow-sm transition-transform" />
            </div>
          </div>

          <div className="py-4 flex items-center justify-between group cursor-pointer border-t border-gray-50">
            <div className="flex items-center gap-3 text-gray-800">
              <Icon name="more_horiz" className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-[15px]">
                ตัวเลือกเพิ่มเติม
              </span>
            </div>
            <Icon
              name="chevron_right"
              className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-[70px] left-0 right-0 w-full px-4 py-3 bg-white border-t border-gray-100 flex items-center gap-3 z-20 sm:max-w-md sm:mx-auto">
        <button className="flex-1 py-3 px-2 rounded-xl border border-gray-200 text-gray-800 text-sm font-bold bg-white hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap">
          บันทึกแบบร่าง
        </button>
        <button className="flex-[1.5] py-3 px-4 rounded-xl text-white text-[15px] font-bold bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm">
          โพสต์
        </button>
      </div>

      {/* Adding TikTok promotion tooltip mock (like in the image) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="fixed bottom-[180px] right-4 bg-[#2C2C2C] text-white text-xs px-3 py-2 rounded-lg shadow-xl z-30 pointer-events-none"
      >
        <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-[#2C2C2C] rotate-45"></div>
        เข้าถึงกลุ่มผู้ชมที่กว้างขึ้นด้วยช่องทางอื่นๆ!
      </motion.div>
    </div>
  );
}
