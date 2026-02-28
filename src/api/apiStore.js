/**
 * API-based data store that replaces localStorage.
 * Uses fetch to talk to the Express backend at localhost:3001.
 * Exports the same `localStore` name so pages don't need to change their import variable.
 */
import { BACKEND_BASE_URL } from '@/lib/backendBaseUrl';

const BASE_URL = `${BACKEND_BASE_URL}/api`;

function createEntity(entityName) {
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
