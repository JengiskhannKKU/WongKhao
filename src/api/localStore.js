/**
 * localStorage-based data store that replaces base44 entity CRUD.
 * Each entity stores its data as a JSON array in localStorage.
 */

const STORAGE_PREFIX = 'wongkhao_';

function getStorageKey(entityName) {
    return `${STORAGE_PREFIX}${entityName}`;
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function readAll(entityName) {
    try {
        const raw = localStorage.getItem(getStorageKey(entityName));
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function writeAll(entityName, items) {
    localStorage.setItem(getStorageKey(entityName), JSON.stringify(items));
}

function createEntity(entityName) {
    return {
        list: async () => {
            return readAll(entityName);
        },

        create: async (data) => {
            const items = readAll(entityName);
            const newItem = { id: generateId(), ...data, created_date: new Date().toISOString() };
            items.push(newItem);
            writeAll(entityName, items);
            return newItem;
        },

        update: async (id, data) => {
            const items = readAll(entityName);
            const index = items.findIndex(item => item.id === id);
            if (index === -1) throw new Error(`${entityName} with id ${id} not found`);
            items[index] = { ...items[index], ...data };
            writeAll(entityName, items);
            return items[index];
        },

        delete: async (id) => {
            const items = readAll(entityName);
            const filtered = items.filter(item => item.id !== id);
            writeAll(entityName, filtered);
        },

        filter: async (criteria) => {
            const items = readAll(entityName);
            return items.filter(item => {
                return Object.entries(criteria).every(([key, value]) => item[key] === value);
            });
        },

        get: async (id) => {
            const items = readAll(entityName);
            return items.find(item => item.id === id) || null;
        }
    };
}

// Seed default menus if none exist
function seedMenus() {
    const existing = readAll('Menu');
    if (existing.length > 0) return;

    const defaultMenus = [
        {
            id: '1',
            name_th: 'ข้าวซอยไก่',
            name_en: 'Khao Soi Chicken',
            region: 'north',
            image_url: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=800&q=80',
            spice_level: 3,
            health_score: 72,
            sodium_level: 'high',
            calories: 520,
            protein: 28,
            carbs: 55,
            fat: 18
        },
        {
            id: '2',
            name_th: 'ส้มตำปลาร้า',
            name_en: 'Som Tam Pla Ra',
            region: 'northeast',
            image_url: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800&q=80',
            spice_level: 5,
            health_score: 68,
            sodium_level: 'high',
            calories: 280,
            protein: 12,
            carbs: 35,
            fat: 8
        },
        {
            id: '3',
            name_th: 'แกงเขียวหวานไก่',
            name_en: 'Green Curry Chicken',
            region: 'central',
            image_url: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80',
            spice_level: 4,
            health_score: 75,
            sodium_level: 'medium',
            calories: 450,
            protein: 32,
            carbs: 25,
            fat: 22
        },
        {
            id: '4',
            name_th: 'แกงส้มปลา',
            name_en: 'Sour Curry Fish',
            region: 'south',
            image_url: 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=800&q=80',
            spice_level: 4,
            health_score: 82,
            sodium_level: 'medium',
            calories: 320,
            protein: 28,
            carbs: 18,
            fat: 14
        },
        {
            id: '5',
            name_th: 'ไก่ย่าง',
            name_en: 'Grilled Chicken',
            region: 'northeast',
            image_url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80',
            spice_level: 2,
            health_score: 88,
            sodium_level: 'low',
            calories: 380,
            protein: 42,
            carbs: 5,
            fat: 18
        }
    ];

    writeAll('Menu', defaultMenus);
}

// Seed default challenges if none exist
function seedChallenges() {
    const existing = readAll('Challenge');
    if (existing.length > 0) return;

    const defaultChallenges = [
        {
            id: 'ch1',
            title: '7 วัน ลดเค็ม',
            description: 'กินอาหารลดโซเดียมติดต่อกัน 7 วัน ลดเค็มอย่างน้อย 20% ทุกมื้อ',
            level: 1,
            duration_days: 7,
            reward_points: 50,
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
            participant_count: 128,
            icon: '🧂',
            status: 'active'
        },
        {
            id: 'ch2',
            title: 'ปรุงเอง ดีกว่า',
            description: 'ทำอาหารเองอย่างน้อย 5 มื้อ ใน 7 วัน โดยใช้สูตรปรับจาก Fingerprint Foodie',
            level: 2,
            duration_days: 7,
            reward_points: 80,
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
            participant_count: 64,
            icon: '👨‍🍳',
            status: 'active'
        },
        {
            id: 'ch3',
            title: 'สัปดาห์ผักนำ',
            description: 'กินผักเป็นวัตถุดิบหลักทุกมื้อ ติดต่อกัน 7 วัน',
            level: 2,
            duration_days: 7,
            reward_points: 100,
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
            participant_count: 42,
            icon: '🥬',
            status: 'active'
        },
        {
            id: 'ch4',
            title: 'Zero น้ำตาล 14 วัน',
            description: 'หลีกเลี่ยงน้ำตาลเพิ่มในอาหารทุกมื้อ ติดต่อกัน 14 วัน',
            level: 3,
            duration_days: 14,
            reward_points: 200,
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
            participant_count: 23,
            icon: '🚫',
            status: 'active'
        }
    ];

    writeAll('Challenge', defaultChallenges);
}

// Seed default community posts if none exist
function seedCommunityPosts() {
    const existing = readAll('CommunityPost');
    if (existing.length > 0) return;

    const defaultPosts = [
        {
            id: 'p1',
            menu_name: 'ส้มตำไทย ลดเค็ม',
            image_url: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800&q=80',
            caption: 'วันนี้ลองทำส้มตำลดน้ำปลา ใช้มะนาวเพิ่ม เปลี่ยนรสเค็มเป็นรสเปรี้ยว อร่อยไม่แพ้สูตรเดิมเลย! 🥗',
            sodium_reduced: 35,
            calories_reduced: 10,
            region: 'northeast',
            province: 'ขอนแก่น',
            cheer_count: 24,
            created_by: 'สมชาย',
            created_date: new Date(Date.now() - 2 * 3600000).toISOString()
        },
        {
            id: 'p2',
            menu_name: 'ข้าวซอย สูตรคลีน',
            image_url: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=800&q=80',
            caption: 'ข้าวซอยไก่ ใส่กะทิน้อยลง เพิ่มผักสดเต็มจาน สูตรนี้แม่บอกว่าอร่อย! 💪',
            sodium_reduced: 22,
            calories_reduced: 15,
            region: 'north',
            province: 'เชียงใหม่',
            cheer_count: 18,
            challenge_id: 'ch1',
            created_by: 'พิมพ์ลดา',
            created_date: new Date(Date.now() - 5 * 3600000).toISOString()
        },
        {
            id: 'p3',
            menu_name: 'แกงจืดเต้าหู้หมูสับ',
            image_url: 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=800&q=80',
            caption: 'แกงจืดง่ายๆ สำหรับคนอยากเริ่มลดเค็ม ใส่ผักเยอะๆ ซดน้ำได้สบายใจ 🍲',
            sodium_reduced: 40,
            region: 'central',
            province: 'กรุงเทพ',
            cheer_count: 31,
            created_by: 'วิภา',
            created_date: new Date(Date.now() - 8 * 3600000).toISOString()
        },
        {
            id: 'p4',
            menu_name: 'ไก่ย่างสมุนไพร',
            image_url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80',
            caption: 'หมักสมุนไพรแทนเกลือ ไก่ย่างหอมมาก แถมโปรตีนสูง! ใครอยากลดเค็มแนะนำเลย 🔥',
            sodium_reduced: 28,
            calories_reduced: 8,
            region: 'northeast',
            province: 'อุดรธานี',
            cheer_count: 45,
            challenge_id: 'ch2',
            created_by: 'ธนวัฒน์',
            created_date: new Date(Date.now() - 24 * 3600000).toISOString()
        }
    ];

    writeAll('CommunityPost', defaultPosts);
}

// Seed default province scores if none exist
function seedProvinceScores() {
    const existing = readAll('ProvinceScore');
    if (existing.length > 0) return;

    const defaultScores = [
        { id: 'ps1', province: 'ขอนแก่น', region: 'northeast', total_sodium_reduced: 12500, participant_count: 85, week: '2026-W09' },
        { id: 'ps2', province: 'เชียงใหม่', region: 'north', total_sodium_reduced: 10200, participant_count: 62, week: '2026-W09' },
        { id: 'ps3', province: 'กรุงเทพ', region: 'central', total_sodium_reduced: 9800, participant_count: 120, week: '2026-W09' },
        { id: 'ps4', province: 'สงขลา', region: 'south', total_sodium_reduced: 7600, participant_count: 45, week: '2026-W09' },
        { id: 'ps5', province: 'อุดรธานี', region: 'northeast', total_sodium_reduced: 6900, participant_count: 38, week: '2026-W09' },
    ];

    writeAll('ProvinceScore', defaultScores);
}

// Initialize seed data
seedMenus();
seedChallenges();
seedCommunityPosts();
seedProvinceScores();

// Export the store with the same shape as base44 client
export const localStore = {
    entities: {
        UserProfile: createEntity('UserProfile'),
        Menu: createEntity('Menu'),
        MenuSwipe: createEntity('MenuSwipe'),
        MealLog: createEntity('MealLog'),
        Challenge: createEntity('Challenge'),
        ChallengeParticipant: createEntity('ChallengeParticipant'),
        CommunityPost: createEntity('CommunityPost'),
        ProvinceScore: createEntity('ProvinceScore'),
    }
};
