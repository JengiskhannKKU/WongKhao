/**
 * API-based data store with localStorage fallback.
 *
 * When the Express backend is available (localhost:3001 in dev), uses fetch.
 * When deployed without a backend (e.g. on Vercel), automatically falls back
 * to localStorage so the app still works for demos.
 */

const runtimeEnv = /** @type {Record<string, string | undefined>} */ ((/** @type {any} */ (import.meta)).env || {});
const API_HOST = runtimeEnv.VITE_BACKEND_BASE_URL || '';
const BASE_URL = API_HOST ? `${API_HOST}/api` : '';

/**
 * Determine if we should use localStorage instead of the API.
 */
function shouldUseLocalStore() {
    if (!API_HOST) return true;
    if (typeof window === 'undefined') return false;
    const isLocalhost = API_HOST.includes('localhost') || API_HOST.includes('127.0.0.1');
    const siteIsRemote = !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1');
    return isLocalhost && siteIsRemote;
}

/* ── localStorage-based entity (offline / demo mode) ────────── */
function createLocalEntity(entityName) {
    const STORE_KEY = `wongkhao_local_${entityName}`;

    function load() {
        try {
            const raw = localStorage.getItem(STORE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    function save(items) {
        localStorage.setItem(STORE_KEY, JSON.stringify(items));
    }

    return {
        list: async () => load(),

        create: async (data) => {
            const items = load();
            const newItem = {
                ...data,
                id: data.id || `${entityName}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
                created_date: data.created_date || new Date().toISOString(),
            };
            items.push(newItem);
            save(items);
            return newItem;
        },

        update: async (id, data) => {
            const items = load();
            const idx = items.findIndex(i => String(i.id) === String(id));
            if (idx === -1) throw new Error(`${entityName} ${id} not found`);
            items[idx] = { ...items[idx], ...data };
            save(items);
            return items[idx];
        },

        delete: async (id) => {
            const items = load();
            const filtered = items.filter(i => String(i.id) !== String(id));
            save(filtered);
            return { success: true };
        },

        filter: async (filters) => {
            const items = load();
            return items.filter(item => {
                for (const [key, value] of Object.entries(filters)) {
                    if (String(item[key]) !== String(value)) return false;
                }
                return true;
            });
        },

        get: async (id) => {
            const items = load();
            const found = items.find(i => String(i.id) === String(id));
            if (!found) throw new Error(`${entityName} ${id} not found`);
            return found;
        },
    };
}

/* ── API-based entity (backend available) ───────────────────── */
function createApiEntity(entityName) {
    async function parseError(res, fallback) {
        try {
            const payload = await res.json();
            throw new Error(payload?.error || fallback);
        } catch (error) {
            if (error instanceof Error && error.message !== 'Unexpected end of JSON input') {
                throw error;
            }
            throw new Error(fallback);
        }
    }

    return {
        list: async () => {
            const res = await fetch(`${BASE_URL}/${entityName}`);
            if (!res.ok) return parseError(res, `Failed to list ${entityName}`);
            return res.json();
        },

        create: async (data) => {
            const res = await fetch(`${BASE_URL}/${entityName}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) return parseError(res, `Failed to create ${entityName}`);
            return res.json();
        },

        update: async (id, data) => {
            const res = await fetch(`${BASE_URL}/${entityName}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) return parseError(res, `Failed to update ${entityName} ${id}`);
            return res.json();
        },

        delete: async (id) => {
            const res = await fetch(`${BASE_URL}/${entityName}/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) return parseError(res, `Failed to delete ${entityName} ${id}`);
            return res.json();
        },

        filter: async (filters) => {
            const params = new URLSearchParams(filters).toString();
            const res = await fetch(`${BASE_URL}/${entityName}/filter?${params}`);
            if (!res.ok) return parseError(res, `Failed to filter ${entityName}`);
            return res.json();
        },

        get: async (id) => {
            const res = await fetch(`${BASE_URL}/${entityName}/${id}`);
            if (!res.ok) return parseError(res, `Failed to get ${entityName} ${id}`);
            return res.json();
        },
    };
}

/* ── Pick the right entity factory ──────────────────────────── */
const createEntity = shouldUseLocalStore() ? createLocalEntity : createApiEntity;

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
