import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AiPromptBox({ onSubmit, disabled = false }) {
    const [prompt, setPrompt] = useState("");

    const handleSubmit = () => {
        if (!prompt.trim() || disabled) return;
        onSubmit(prompt.trim());
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-violet-50 via-purple-50/50 to-white rounded-3xl p-5 border border-violet-100 shadow-sm"
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h3 className="text-base font-bold text-slate-800">
                        ปรับสูตรด้วย AI
                    </h3>
                    <p className="text-xs text-slate-500">
                        พิมพ์คำสั่งเพื่อปรับสูตรตามต้องการ
                    </p>
                </div>
            </div>

            {/* Textarea */}
            <textarea
                id="ai-prompt-textarea"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                placeholder='เช่น "ลดโซเดียมลง ไม่ใส่ผงชูรส" หรือ "เพิ่มโปรตีน เหมาะกับคนออกกำลังกาย"'
                rows={3}
                className="w-full resize-none rounded-2xl border border-violet-200 bg-white/80 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />

            {/* Submit Button */}
            <div className="mt-3 flex justify-end">
                <Button
                    id="ai-prompt-submit"
                    onClick={handleSubmit}
                    disabled={disabled || !prompt.trim()}
                    className="h-10 px-5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl shadow-md shadow-violet-200 disabled:opacity-50 disabled:shadow-none transition-all"
                >
                    {disabled ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            กำลังปรับสูตร...
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4 mr-2" />
                            ส่งคำสั่ง AI
                        </>
                    )}
                </Button>
            </div>
        </motion.div>
    );
}
