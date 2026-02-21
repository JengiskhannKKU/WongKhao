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

// Initialize seed data
seedMenus();

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
