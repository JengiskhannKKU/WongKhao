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
 * @returns {Promise<{ modifications: string[], tasteRetention: number }>}
 */
export async function adjustRecipeByAI(menu, userPrompt) {
    const systemMessage = `คุณคือผู้เชี่ยวชาญด้านโภชนาการและสูตรอาหารไทย
เมื่อผู้ใช้ขอปรับสูตร ให้ตอบเป็น JSON เท่านั้น ห้ามมีข้อความอื่น
รูปแบบ JSON:
{
  "modifications": ["คำอธิบายการปรับข้อ 1", "คำอธิบายการปรับข้อ 2", ...],
  "tasteRetention": <ตัวเลข 0-100 คือเปอร์เซ็นต์รสชาติที่ยังคงอยู่>
}`;

    const menuContext = `เมนูปัจจุบัน: ${menu.name_th} (${menu.name_en})
ระดับความเผ็ด: ${menu.spice_level}/5
โซเดียม: ${menu.sodium_level}
แคลอรี: ${menu.calories} kcal | โปรตีน: ${menu.protein}g | คาร์บ: ${menu.carbs}g | ไขมัน: ${menu.fat}g`;

    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: `${menuContext}\n\nคำขอของผู้ใช้: ${userPrompt}` },
        ],
        model: "gemini-2.5-flash-lite",
        stream: false,
    });

    const raw = completion.choices[0].message.content;

    // Strip markdown code fences if the model wraps the JSON
    const cleaned = raw.replace(/```json\s*/gi, "").replace(/```/g, "").trim();

    const result = JSON.parse(cleaned);

    // Validate shape
    if (
        !Array.isArray(result.modifications) ||
        typeof result.tasteRetention !== "number"
    ) {
        throw new Error("Unexpected AI response shape");
    }

    return result;
}
