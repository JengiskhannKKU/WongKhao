import { localStore } from '@/api/apiStore';

const runtimeEnv = /** @type {Record<string, string | undefined>} */ ((/** @type {any} */ (import.meta)).env || {});
const API_HOST = runtimeEnv.VITE_BACKEND_BASE_URL || 'http://localhost:3001';
const BEHAVIOR_BASE_URL = runtimeEnv.VITE_BEHAVIOR_API_URL || `${API_HOST}/api/behavior`;
const TRACKING_ENABLED = (runtimeEnv.VITE_BEHAVIOR_TRACKING_ENABLED || 'true') === 'true';

const AUTH_STORAGE_KEY = 'wongkhao_user';
const SESSION_STORAGE_KEY = 'wongkhao_session_id';
const BEHAVIOR_QUEUE_KEY = 'wongkhao_behavior_queue';
const MAX_QUEUE_SIZE = 200;

function enabled() {
  return TRACKING_ENABLED && Boolean(BEHAVIOR_BASE_URL);
}

export function getBehaviorTrackingConfig() {
  return {
    enabled: enabled(),
    baseUrl: BEHAVIOR_BASE_URL,
  };
}

function logError(prefix, error) {
  console.warn(prefix, error?.message || error);
}

function loadQueue() {
  try {
    const raw = localStorage.getItem(BEHAVIOR_QUEUE_KEY);
    const queue = raw ? JSON.parse(raw) : [];
    return Array.isArray(queue) ? queue : [];
  } catch {
    return [];
  }
}

function saveQueue(queue) {
  try {
    localStorage.setItem(BEHAVIOR_QUEUE_KEY, JSON.stringify(queue.slice(-MAX_QUEUE_SIZE)));
  } catch {
    // ignore localStorage errors
  }
}

function enqueueEvent(event) {
  const queue = loadQueue();
  queue.push(event);
  saveQueue(queue);
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

  try {
    const rawAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (rawAuth) {
      const authUser = JSON.parse(rawAuth);
      if (authUser?.id) {
        return String(authUser.id);
      }
    }
  } catch {
    // ignore auth storage parse errors
  }

  try {
    const profiles = await localStore.entities.UserProfile.list();
    if (profiles.length > 0) {
      return String(profiles[0].id);
    }
  } catch {
    // backend could be temporarily unavailable; continue to anon fallback
  }

  try {
    let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionId) {
      sessionId = `anon-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    }
    return sessionId;
  } catch {
    return null;
  }
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

export async function flushBehaviorQueue(limit = 20) {
  if (!enabled()) {
    return 0;
  }

  const queue = loadQueue();
  if (!queue.length) {
    return 0;
  }

  const remaining = [];
  let sent = 0;

  for (let i = 0; i < queue.length; i += 1) {
    const event = queue[i];

    if (sent >= limit) {
      remaining.push(...queue.slice(i));
      break;
    }

    try {
      await callBehavior(event.path, event.method, event.body);
      sent += 1;
    } catch {
      remaining.push(event);
    }
  }

  saveQueue(remaining);
  return sent;
}

export async function syncUserProfileToGraph(profile, explicitUserId) {
  const eventBody = {
    userId: explicitUserId || profile?.id || null,
    profile: toProfilePayload(profile),
    occurredAt: new Date().toISOString(),
  };

  try {
    const userId = await resolveUserId(explicitUserId || profile?.id);
    if (!userId) {
      return null;
    }

    eventBody.userId = userId;
    await flushBehaviorQueue(10);
    return await callBehavior('/user-profile', 'POST', eventBody);
  } catch (error) {
    enqueueEvent({ path: '/user-profile', method: 'POST', body: eventBody });
    logError('Failed to sync profile to Neo4j:', error);
    return null;
  }
}

export async function trackSwipeEvent(payload) {
  const { userId, menu, action, source, selectedRegion, mood } = payload || {};

  if (!menu?.id || !action) {
    return {
      status: 'skipped',
      reason: 'missing_payload',
    };
  }

  if (!enabled()) {
    return {
      status: 'disabled',
    };
  }

  const eventBody = {
    userId: userId || null,
    menu: toMenuPayload(menu),
    action,
    source: source || null,
    selectedRegion,
    mood,
    occurredAt: new Date().toISOString(),
  };

  try {
    const resolvedUserId = await resolveUserId(userId);
    if (!resolvedUserId) {
      return {
        status: 'skipped',
        reason: 'missing_user',
      };
    }

    eventBody.userId = resolvedUserId;
    await flushBehaviorQueue(10);
    const result = await callBehavior('/swipe', 'POST', eventBody);
    return {
      status: 'sent',
      userId: resolvedUserId,
      result,
    };
  } catch (error) {
    enqueueEvent({ path: '/swipe', method: 'POST', body: eventBody });
    logError('Failed to track swipe:', error);
    return {
      status: 'queued',
      userId: eventBody.userId || null,
      error: error?.message || String(error),
    };
  }
}

export async function trackAdjustmentEvent(payload) {
  const { userId, menu, adjustType, source, prompt, impacts, tasteRetention } = payload || {};

  if (!menu?.id || !adjustType) {
    return null;
  }

  const eventBody = {
    userId: userId || null,
    menu: toMenuPayload(menu),
    adjustType,
    source,
    prompt,
    impacts,
    tasteRetention,
    occurredAt: new Date().toISOString(),
  };

  try {
    const resolvedUserId = await resolveUserId(userId);
    if (!resolvedUserId) {
      return null;
    }

    eventBody.userId = resolvedUserId;
    await flushBehaviorQueue(10);
    return await callBehavior('/adjustment', 'POST', eventBody);
  } catch (error) {
    enqueueEvent({ path: '/adjustment', method: 'POST', body: eventBody });
    logError('Failed to track adjustment:', error);
    return null;
  }
}

export async function trackMealLogEvent(payload) {
  const { userId, menu, mealLog } = payload || {};

  if (!menu?.id || !mealLog) {
    return null;
  }

  const eventBody = {
    userId: userId || null,
    menu: toMenuPayload(menu),
    mealLog,
    occurredAt: new Date().toISOString(),
  };

  try {
    const resolvedUserId = await resolveUserId(userId);
    if (!resolvedUserId) {
      return null;
    }

    eventBody.userId = resolvedUserId;
    await flushBehaviorQueue(10);
    return await callBehavior('/meal-log', 'POST', eventBody);
  } catch (error) {
    enqueueEvent({ path: '/meal-log', method: 'POST', body: eventBody });
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
