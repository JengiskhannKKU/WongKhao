/// <reference types="vite/client" />
import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: "https://gen.ai.kku.ac.th/api/v1",
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
});

/**
 * Ask AI to adjust a recipe based on user instructions.
 *
 * @param {{ name_th: string, name_en: string, sodium_level: string, spice_level: number, calories: number, protein: number, carbs: number, fat: number }} menu
 * @param {string} userPrompt – free-form user instruction, e.g. "ลดโซเดียมลง"
 * @param {{ health_goal?: string | null, health_goals?: string[] | string | null, ncd_targets?: string[] | string | null, sodium_limit?: number | null } | null} userProfile
 * @returns {Promise<{ modifications: string[], tasteRetention: number }>}
 */
function parseList(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(String).filter(Boolean);

    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
                return parsed.map(String).filter(Boolean);
            }
        } catch {
            return value.split(",").map((item) => item.trim()).filter(Boolean);
        }
    }

    return [];
}

function withBullet(text) {
    const cleaned = String(text || "").trim().replace(/^[-•]\s*/, "");
    if (!cleaned) return null;
    return `• ${cleaned}`;
}

export async function adjustRecipeByAI(menu, userPrompt, userProfile = null) {
    const primaryGoal = userProfile?.health_goal || "reduce_sodium";
    const ncdTargets = parseList(userProfile?.ncd_targets);
    const allGoals = parseList(userProfile?.health_goals);
    const additionalGoals = allGoals.filter((goal) => goal !== primaryGoal && !ncdTargets.includes(goal));
    const sodiumLimit = typeof userProfile?.sodium_limit === "number" ? userProfile.sodium_limit : null;

    const healthTargetContext = `เป้าหมายสุขภาพผู้ใช้:
- เป้าหมายหลัก: ${primaryGoal}
- NCD targets: ${ncdTargets.length ? ncdTargets.join(", ") : "ไม่มี"}
- เป้าหมายเสริม: ${additionalGoals.length ? additionalGoals.join(", ") : "ไม่มี"}
- โซเดียมต่อวัน: ${sodiumLimit ? `${sodiumLimit} mg` : "ไม่ระบุ"}
`;

    const systemMessage = `คุณคือผู้เชี่ยวชาญด้านโภชนาการและสูตรอาหารไทย
งานของคุณคือ "ปรับสูตรอาหารตามเป้าหมายสุขภาพผู้ใช้" โดยใช้เป้าหมายที่ได้รับเป็นข้อบังคับ
ต้องตอบเป็น JSON เท่านั้น ห้ามมีข้อความอื่น
ข้อกำหนด:
1) ingredients ต้องเป็น bullet points ชัดเจนพร้อมปริมาณ
2) ระบุหน่วยให้ชัดเจน (กรัม, มล., ช้อนชา, ช้อนโต๊ะ, ฟอง, ถ้วย)
3) สูตรต้องสอดคล้องกับเป้าหมายสุขภาพผู้ใช้และ NCD targets
4) ห้ามเว้นว่าง ingredients
รูปแบบ JSON:
{
  "ingredients": [
    "• วัตถุดิบ 1 ... ปริมาณ ...",
    "• วัตถุดิบ 2 ... ปริมาณ ..."
  ],
  "steps": ["ขั้นตอนที่ 1", "ขั้นตอนที่ 2"],
  "tasteRetention": <ตัวเลข 0-100>
}`;

    const menuContext = `เมนูปัจจุบัน: ${menu.name_th} (${menu.name_en})
ระดับความเผ็ด: ${menu.spice_level}/5
โซเดียม: ${menu.sodium_level}
แคลอรี: ${menu.calories} kcal | โปรตีน: ${menu.protein}g | คาร์บ: ${menu.carbs}g | ไขมัน: ${menu.fat}g`;

    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: `${menuContext}\n\n${healthTargetContext}\nคำขอของผู้ใช้: ${userPrompt}` },
        ],
        model: "gemini-2.5-flash-lite",
        stream: false,
    });

    const raw = completion?.choices?.[0]?.message?.content || "";
    if (!raw.trim()) {
        throw new Error("AI returned empty response");
    }

    // Strip markdown code fences if the model wraps the JSON
    const cleaned = raw.replace(/```json\s*/gi, "").replace(/```/g, "").trim();

    const result = JSON.parse(cleaned);

    // New format with ingredient bullets.
    if (Array.isArray(result.ingredients)) {
        const ingredientBullets = result.ingredients
            .map(withBullet)
            .filter(Boolean);
        const steps = Array.isArray(result.steps)
            ? result.steps.map((step) => String(step || "").trim()).filter(Boolean)
            : [];
        const tasteRetention = Number(result.tasteRetention);

        if (!ingredientBullets.length || !Number.isFinite(tasteRetention)) {
            throw new Error("Unexpected AI response shape");
        }

        return {
            modifications: [
                "วัตถุดิบ (Bullet Points)",
                ...ingredientBullets,
                ...(steps.length ? ["ขั้นตอนแบบย่อ", ...steps.map((step, index) => `${index + 1}. ${step}`)] : []),
            ],
            tasteRetention: Math.max(0, Math.min(100, tasteRetention)),
        };
    }

    // Backward compatibility if model returns older format.
    if (Array.isArray(result.modifications) && Number.isFinite(Number(result.tasteRetention))) {
        const bulletMods = result.modifications
            .map(withBullet)
            .filter(Boolean);
        if (!bulletMods.length) {
            throw new Error("Unexpected AI response shape");
        }
        return {
            modifications: [
                "วัตถุดิบ (Bullet Points)",
                ...bulletMods,
            ],
            tasteRetention: Math.max(0, Math.min(100, Number(result.tasteRetention))),
        };
    }

    throw new Error("Unexpected AI response shape");
}
