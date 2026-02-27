import { localStore } from '@/api/apiStore';

const runtimeEnv = /** @type {Record<string, string | undefined>} */ ((/** @type {any} */ (import.meta)).env || {});
const API_HOST = runtimeEnv.VITE_BACKEND_BASE_URL || 'http://localhost:3001';
const BEHAVIOR_BASE_URL = runtimeEnv.VITE_BEHAVIOR_API_URL || `${API_HOST}/api/behavior`;
const TRACKING_ENABLED = (runtimeEnv.VITE_BEHAVIOR_TRACKING_ENABLED || 'true') === 'true';

function enabled() {
  return TRACKING_ENABLED && Boolean(BEHAVIOR_BASE_URL);
}

function logError(prefix, error) {
  console.warn(prefix, error?.message || error);
}

function toMenuPayload(menu = {}) {
  return {
    id: String(menu.id),
    name: menu.name || null,
    name_th: menu.name_th || null,
    name_en: menu.name_en || null,
    category: menu.category || null,
    region: menu.region || null,
    sodium_level: menu.sodium_level || null,
    sodium_mg: menu.sodium_mg ?? null,
    calories: menu.calories ?? null,
    protein: menu.protein ?? null,
    carbs: menu.carbs ?? null,
    fat: menu.fat ?? null,
    spice_level: menu.spice_level ?? null,
  };
}

function toProfilePayload(profile = {}) {
  return {
    region: profile.region || null,
    health_goals: profile.health_goals || null,
    health_goal: profile.health_goal || null,
    spice_level: profile.spice_level ?? null,
    sodium_target: profile.sodium_target ?? null,
    sodium_limit: profile.sodium_limit ?? null,
    points: profile.points ?? null,
    streak_days: profile.streak_days ?? null,
  };
}

async function resolveUserId(explicitUserId) {
  if (explicitUserId) {
    return String(explicitUserId);
  }

  const profiles = await localStore.entities.UserProfile.list();
  if (!profiles.length) {
    return null;
  }

  return String(profiles[0].id);
}

async function callBehavior(path, method, body) {
  if (!enabled()) {
    return null;
  }

  const response = await fetch(`${BEHAVIOR_BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || `Behavior API ${response.status}`);
  }

  return payload;
}

export async function syncUserProfileToGraph(profile, explicitUserId) {
  try {
    const userId = await resolveUserId(explicitUserId || profile?.id);
    if (!userId) {
      return null;
    }

    return await callBehavior('/user-profile', 'POST', {
      userId,
      profile: toProfilePayload(profile),
      occurredAt: new Date().toISOString(),
    });
  } catch (error) {
    logError('Failed to sync profile to Neo4j:', error);
    return null;
  }
}

export async function trackSwipeEvent(payload) {
  const { userId, menu, action, selectedRegion, mood } = payload || {};

  try {
    const resolvedUserId = await resolveUserId(userId);
    if (!resolvedUserId || !menu?.id || !action) {
      return null;
    }

    return await callBehavior('/swipe', 'POST', {
      userId: resolvedUserId,
      menu: toMenuPayload(menu),
      action,
      selectedRegion,
      mood,
      occurredAt: new Date().toISOString(),
    });
  } catch (error) {
    logError('Failed to track swipe:', error);
    return null;
  }
}

export async function trackAdjustmentEvent(payload) {
  const { userId, menu, adjustType, source, prompt, impacts, tasteRetention } = payload || {};

  try {
    const resolvedUserId = await resolveUserId(userId);
    if (!resolvedUserId || !menu?.id || !adjustType) {
      return null;
    }

    return await callBehavior('/adjustment', 'POST', {
      userId: resolvedUserId,
      menu: toMenuPayload(menu),
      adjustType,
      source,
      prompt,
      impacts,
      tasteRetention,
      occurredAt: new Date().toISOString(),
    });
  } catch (error) {
    logError('Failed to track adjustment:', error);
    return null;
  }
}

export async function trackMealLogEvent(payload) {
  const { userId, menu, mealLog } = payload || {};

  try {
    const resolvedUserId = await resolveUserId(userId);
    if (!resolvedUserId || !menu?.id || !mealLog) {
      return null;
    }

    return await callBehavior('/meal-log', 'POST', {
      userId: resolvedUserId,
      menu: toMenuPayload(menu),
      mealLog,
      occurredAt: new Date().toISOString(),
    });
  } catch (error) {
    logError('Failed to track meal log:', error);
    return null;
  }
}

export async function fetchBehaviorInsights(userId) {
  try {
    const resolvedUserId = await resolveUserId(userId);
    if (!resolvedUserId) {
      return null;
    }

    const result = await callBehavior(`/insights/${encodeURIComponent(resolvedUserId)}`, 'GET');
    return result?.data || null;
  } catch (error) {
    logError('Failed to fetch behavior insights:', error);
    return null;
  }
}
