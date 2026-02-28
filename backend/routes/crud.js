import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

const ENTITY_MAP = {
    UserProfile: prisma.userProfile,
    Menu: prisma.menu,
    MenuSwipe: prisma.menuSwipe,
    MealLog: prisma.mealLog,
    Challenge: prisma.challenge,
    ChallengeParticipant: prisma.challengeParticipant,
    CommunityPost: prisma.communityPost,
    ProvinceScore: prisma.provinceScore,
};

const ENTITY_ORDER_FIELD = {
    ChallengeParticipant: 'joined_date',
};

function getModel(entity) {
    const model = ENTITY_MAP[entity];
    if (!model) throw new Error(`Unknown entity: ${entity}`);
    return model;
}

function getOrderBy(entity) {
    const field = ENTITY_ORDER_FIELD[entity] || 'created_date';
    return { [field]: 'desc' };
}

// GET /api/:entity - list all
router.get('/:entity', async (req, res) => {
    try {
        const entity = req.params.entity;
        const model = getModel(entity);
        const items = await model.findMany({ orderBy: getOrderBy(entity) });
        res.json(items);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// GET /api/:entity/filter - filter by query params
router.get('/:entity/filter', async (req, res) => {
    try {
        const entity = req.params.entity;
        const model = getModel(entity);
        const where = {};
        for (const [key, val] of Object.entries(req.query)) {
            where[key] = val;
        }
        const items = await model.findMany({ where, orderBy: getOrderBy(entity) });
        res.json(items);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// GET /api/:entity/:id - get one
router.get('/:entity/:id', async (req, res) => {
    try {
        const model = getModel(req.params.entity);
        const item = await model.findUnique({ where: { id: req.params.id } });
        if (!item) return res.status(404).json({ error: 'Not found' });
        res.json(item);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// POST /api/:entity - create
router.post('/:entity', async (req, res) => {
    try {
        const model = getModel(req.params.entity);
        const item = await model.create({ data: req.body });
        res.status(201).json(item);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// PUT /api/:entity/:id - update
router.put('/:entity/:id', async (req, res) => {
    try {
        const model = getModel(req.params.entity);
        const item = await model.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(item);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// DELETE /api/:entity/:id - delete
router.delete('/:entity/:id', async (req, res) => {
    try {
        const model = getModel(req.params.entity);
        await model.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

export default router;
