import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const router = Router();
const prisma = new PrismaClient();

function hashPassword(password) {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

function verifyPassword(stored, input) {
    try {
        const [salt, hash] = stored.split(':');
        const inputHash = scryptSync(input, salt, 64).toString('hex');
        return timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(inputHash, 'hex'));
    } catch {
        return false;
    }
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'กรุณากรอก Email และรหัสผ่าน' });
        }
        const existing = await prisma.userProfile.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ error: 'Email นี้ถูกใช้งานแล้ว' });
        }
        const hashed = hashPassword(password);
        const user = await prisma.userProfile.create({
            data: { email, password: hashed, name: name || null }
        });
        res.json({ user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'กรุณากรอก Email และรหัสผ่าน' });
        }
        const user = await prisma.userProfile.findUnique({ where: { email } });
        if (!user || !user.password) {
            return res.status(401).json({ error: 'Email หรือรหัสผ่านไม่ถูกต้อง' });
        }
        if (!verifyPassword(user.password, password)) {
            return res.status(401).json({ error: 'Email หรือรหัสผ่านไม่ถูกต้อง' });
        }
        res.json({ user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
