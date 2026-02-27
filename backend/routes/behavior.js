import { Router } from 'express';
import {
  hasNeo4jConfig,
  normalizeRecords,
  runRead,
  runWrite,
} from '../neo4j.js';

const router = Router();

let graphReady = false;

function nowISO(value) {
  return value || new Date().toISOString();
}

function listFromInput(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map((item) => String(item));
  }

  if (typeof value === 'string' && value.trim()) {
    return [value.trim()];
  }

  return [];
}

function normalizeMenu(menu = {}) {
  return {
    id: String(menu.id),
    name: menu.name || menu.name_th || menu.name_en || null,
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

async function ensureConstraints() {
  if (graphReady || !hasNeo4jConfig()) {
    return;
  }

  const queries = [
    'CREATE CONSTRAINT user_id_unique IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE',
    'CREATE CONSTRAINT food_id_unique IF NOT EXISTS FOR (f:Food) REQUIRE f.id IS UNIQUE',
    'CREATE CONSTRAINT region_id_unique IF NOT EXISTS FOR (r:Region) REQUIRE r.id IS UNIQUE',
    'CREATE CONSTRAINT health_goal_id_unique IF NOT EXISTS FOR (g:HealthGoal) REQUIRE g.id IS UNIQUE',
  ];

  await runWrite(async (tx) => {
    for (const query of queries) {
      await tx.run(query);
    }
  });

  graphReady = true;
}

async function guardReady(_req, res, next) {
  if (!hasNeo4jConfig()) {
    return res.status(503).json({
      ok: false,
      message: 'Neo4j not configured. Set NEO4J_URI/NEO4J_USERNAME/NEO4J_PASSWORD in backend/.env',
    });
  }

  try {
    await ensureConstraints();
    next();
  } catch (error) {
    console.error('Neo4j readiness error:', error);
    return res.status(503).json({
      ok: false,
      message: 'Neo4j is unreachable. Verify AuraDB URI and credentials.',
    });
  }
}

router.get('/health', async (_req, res) => {
  res.json({
    ok: true,
    neo4jConfigured: hasNeo4jConfig(),
    graphReady,
  });
});

router.post('/user-profile', guardReady, async (req, res) => {
  try {
    const { userId, profile = {}, occurredAt } = req.body || {};

    if (!userId) {
      return res.status(400).json({ ok: false, message: 'userId is required' });
    }

    const goals = listFromInput(profile.health_goals || profile.health_goal);

    await runWrite((tx) => tx.run(
      `
      MERGE (u:User {id: $userId})
      ON CREATE SET u.created_at = datetime($occurredAt)
      SET u.updated_at = datetime($occurredAt),
          u.region = $region,
          u.sodium_limit = $sodiumLimit,
          u.spice_level = $spiceLevel,
          u.health_goals = $goals,
          u.points = $points,
          u.streak_days = $streakDays
      WITH u
      OPTIONAL MATCH (u)-[r:PREFERS_REGION]->(:Region)
      DELETE r
      WITH u
      FOREACH (regionId IN CASE WHEN $region IS NULL OR $region = '' THEN [] ELSE [$region] END |
        MERGE (region:Region {id: regionId})
        MERGE (u)-[:PREFERS_REGION]->(region)
      )
      WITH u
      OPTIONAL MATCH (u)-[g:HAS_GOAL]->(:HealthGoal)
      DELETE g
      WITH u
      FOREACH (goalId IN $goals |
        MERGE (goal:HealthGoal {id: goalId})
        MERGE (u)-[:HAS_GOAL]->(goal)
      )
      RETURN u.id AS userId
      `,
      {
        userId: String(userId),
        occurredAt: nowISO(occurredAt),
        region: profile.region || null,
        sodiumLimit: profile.sodium_limit ?? profile.sodium_target ?? null,
        spiceLevel: profile.spice_level ?? null,
        goals,
        points: profile.points ?? null,
        streakDays: profile.streak_days ?? null,
      }
    ));

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Failed to sync user profile' });
  }
});

router.post('/swipe', guardReady, async (req, res) => {
  try {
    const { userId, menu, action, selectedRegion, mood, occurredAt } = req.body || {};

    if (!userId || !menu?.id || !action) {
      return res.status(400).json({
        ok: false,
        message: 'userId, menu.id, and action are required',
      });
    }

    await runWrite((tx) => tx.run(
      `
      MERGE (u:User {id: $userId})
      ON CREATE SET u.created_at = datetime($occurredAt)
      SET u.updated_at = datetime($occurredAt)
      MERGE (f:Food {id: $menu.id})
      SET f += $menu
      CREATE (u)-[:SWIPED {
        action: $action,
        selected_region: $selectedRegion,
        mood: $mood,
        occurred_at: datetime($occurredAt)
      }]->(f)
      `,
      {
        userId: String(userId),
        menu: normalizeMenu(menu),
        action: String(action),
        selectedRegion: selectedRegion || null,
        mood: mood || null,
        occurredAt: nowISO(occurredAt),
      }
    ));

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Failed to track swipe' });
  }
});

router.post('/adjustment', guardReady, async (req, res) => {
  try {
    const {
      userId,
      menu,
      adjustType,
      source,
      prompt,
      impacts,
      tasteRetention,
      occurredAt,
    } = req.body || {};

    if (!userId || !menu?.id || !adjustType) {
      return res.status(400).json({
        ok: false,
        message: 'userId, menu.id, and adjustType are required',
      });
    }

    await runWrite((tx) => tx.run(
      `
      MERGE (u:User {id: $userId})
      ON CREATE SET u.created_at = datetime($occurredAt)
      SET u.updated_at = datetime($occurredAt)
      MERGE (f:Food {id: $menu.id})
      SET f += $menu
      CREATE (u)-[:ADJUSTED_RECIPE {
        adjust_type: $adjustType,
        source: $source,
        prompt: $prompt,
        sodium_delta: $sodiumDelta,
        sugar_delta: $sugarDelta,
        calories_delta: $caloriesDelta,
        bp_risk_delta: $bpRiskDelta,
        taste_retention: $tasteRetention,
        occurred_at: datetime($occurredAt)
      }]->(f)
      `,
      {
        userId: String(userId),
        menu: normalizeMenu(menu),
        adjustType: String(adjustType),
        source: source || 'manual',
        prompt: prompt || null,
        sodiumDelta: impacts?.sodium ?? null,
        sugarDelta: impacts?.sugar ?? null,
        caloriesDelta: impacts?.calories ?? null,
        bpRiskDelta: impacts?.bp_risk ?? null,
        tasteRetention: tasteRetention ?? null,
        occurredAt: nowISO(occurredAt),
      }
    ));

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Failed to track adjustment' });
  }
});

router.post('/meal-log', guardReady, async (req, res) => {
  try {
    const { userId, menu, mealLog, occurredAt } = req.body || {};

    if (!userId || !menu?.id || !mealLog) {
      return res.status(400).json({
        ok: false,
        message: 'userId, menu.id, and mealLog are required',
      });
    }

    await runWrite((tx) => tx.run(
      `
      MERGE (u:User {id: $userId})
      ON CREATE SET u.created_at = datetime($occurredAt)
      SET u.updated_at = datetime($occurredAt)
      MERGE (f:Food {id: $menu.id})
      SET f += $menu
      CREATE (u)-[:LOGGED_MEAL {
        meal_type: $mealType,
        is_modified: $isModified,
        sodium_saved: $sodiumSaved,
        calories: $calories,
        points_earned: $pointsEarned,
        occurred_at: datetime($occurredAt)
      }]->(f)
      `,
      {
        userId: String(userId),
        menu: normalizeMenu(menu),
        mealType: mealLog.meal_type || null,
        isModified: mealLog.is_modified ?? null,
        sodiumSaved: mealLog.sodium_saved ?? null,
        calories: mealLog.calories ?? null,
        pointsEarned: mealLog.points_earned ?? null,
        occurredAt: nowISO(occurredAt),
      }
    ));

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Failed to track meal log' });
  }
});

router.get('/insights/:userId', guardReady, async (req, res) => {
  try {
    const userId = String(req.params.userId || '').trim();

    if (!userId) {
      return res.status(400).json({ ok: false, message: 'userId is required' });
    }

    const [swipeBreakdown, likedFoods, dislikedFoods, preferredRegions, adjustmentPatterns, mealSummary] = await Promise.all([
      runRead(async (tx) => normalizeRecords((await tx.run(
        `
        MATCH (:User {id: $userId})-[s:SWIPED]->(:Food)
        RETURN s.action AS action, count(*) AS total
        ORDER BY total DESC
        `,
        { userId }
      )).records)),
      runRead(async (tx) => normalizeRecords((await tx.run(
        `
        MATCH (:User {id: $userId})-[s:SWIPED {action: 'like'}]->(f:Food)
        RETURN f.id AS menuId, coalesce(f.name_th, f.name_en, f.name, f.id) AS menuName, count(*) AS likes
        ORDER BY likes DESC
        LIMIT 5
        `,
        { userId }
      )).records)),
      runRead(async (tx) => normalizeRecords((await tx.run(
        `
        MATCH (:User {id: $userId})-[s:SWIPED {action: 'dislike'}]->(f:Food)
        RETURN f.id AS menuId, coalesce(f.name_th, f.name_en, f.name, f.id) AS menuName, count(*) AS dislikes
        ORDER BY dislikes DESC
        LIMIT 5
        `,
        { userId }
      )).records)),
      runRead(async (tx) => normalizeRecords((await tx.run(
        `
        MATCH (:User {id: $userId})-[s:SWIPED {action: 'like'}]->(f:Food)
        WHERE f.region IS NOT NULL
        RETURN f.region AS region, count(*) AS likes
        ORDER BY likes DESC
        LIMIT 5
        `,
        { userId }
      )).records)),
      runRead(async (tx) => normalizeRecords((await tx.run(
        `
        MATCH (:User {id: $userId})-[a:ADJUSTED_RECIPE]->(:Food)
        RETURN a.adjust_type AS adjustType, count(*) AS uses, avg(a.taste_retention) AS avgTasteRetention
        ORDER BY uses DESC
        `,
        { userId }
      )).records)),
      runRead(async (tx) => normalizeRecords((await tx.run(
        `
        MATCH (:User {id: $userId})-[m:LOGGED_MEAL]->(:Food)
        RETURN count(*) AS mealLogs,
               sum(coalesce(m.sodium_saved, 0)) AS sodiumSaved,
               avg(coalesce(m.calories, 0)) AS avgCalories,
               sum(coalesce(m.points_earned, 0)) AS pointsEarned
        `,
        { userId }
      )).records)),
    ]);

    res.json({
      ok: true,
      data: {
        userId,
        swipeBreakdown,
        topLikedFoods: likedFoods,
        topDislikedFoods: dislikedFoods,
        preferredRegions,
        adjustmentPatterns,
        mealSummary: mealSummary[0] || {
          mealLogs: 0,
          sodiumSaved: 0,
          avgCalories: 0,
          pointsEarned: 0,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: 'Failed to fetch insights' });
  }
});

export default router;
