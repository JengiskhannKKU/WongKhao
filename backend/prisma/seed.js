import { PrismaClient } from '@prisma/client';
import { randomBytes, scryptSync } from 'crypto';
const prisma = new PrismaClient();

function hashPassword(password) {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

async function upsertMany(model, items, idField = 'id') {
    for (const item of items) {
        await model.upsert({
            where: { [idField]: item[idField] },
            update: item,
            create: item,
        });
    }
}

async function main() {
    console.log('Seeding database...');

    // Hardcoded test users
    await prisma.userProfile.upsert({
        where: { email: 'test@test.com' },
        update: {},
        create: { email: 'test@test.com', password: hashPassword('1234'), name: 'Test User' },
    });
    await prisma.userProfile.upsert({
        where: { email: 'admin@wongkhao.com' },
        update: {},
        create: { email: 'admin@wongkhao.com', password: hashPassword('admin1234'), name: 'Admin' },
    });

    await upsertMany(prisma.menu, [
        { id: 'menu1', name: 'ต้มยำกุ้ง', category: 'soup', sodium_mg: 1200, calories: 180, image_url: 'https://images.unsplash.com/photo-1559847844-d721426d6edc?w=800&q=80', province: 'กรุงเทพ', region: 'central', description: 'ต้มยำกุ้งสูตรดั้งเดิม' },
        { id: 'menu2', name: 'ส้มตำ', category: 'salad', sodium_mg: 800, calories: 120, image_url: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800&q=80', province: 'ขอนแก่น', region: 'northeast', description: 'ส้มตำไทยรสจัดจ้าน' },
        { id: 'menu3', name: 'ข้าวผัด', category: 'rice', sodium_mg: 600, calories: 350, image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80', province: 'เชียงใหม่', region: 'north', description: 'ข้าวผัดธรรมดาไข่ดาว' },
        { id: 'menu4', name: 'แกงเขียวหวาน', category: 'curry', sodium_mg: 950, calories: 280, image_url: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80', province: 'กรุงเทพ', region: 'central', description: 'แกงเขียวหวานไก่' },
        { id: 'menu5', name: 'ปลาทอด', category: 'main', sodium_mg: 450, calories: 220, image_url: 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=800&q=80', province: 'สงขลา', region: 'south', description: 'ปลาทอดกระเทียม' },
    ]);

    await upsertMany(prisma.challenge, [
        { id: 'ch1', title: 'ลดเกลือ 7 วัน', description: 'ทานอาหารโซเดียมต่ำกว่า 1500mg ต่อวัน เป็นเวลา 7 วัน', target_days: 7, reward_points: 100 },
        { id: 'ch2', title: 'กินผักทุกมื้อ', description: 'ทานผักอย่างน้อย 1 อย่างในทุกมื้ออาหาร', target_days: 14, reward_points: 200 },
        { id: 'ch3', title: 'หลีกเลี่ยงอาหารสำเร็จรูป', description: 'ไม่ทานอาหารสำเร็จรูปเป็นเวลา 30 วัน', target_days: 30, reward_points: 500 },
        { id: 'ch4', title: 'ดื่มน้ำ 8 แก้ว', description: 'ดื่มน้ำเปล่าอย่างน้อย 8 แก้วต่อวัน เป็นเวลา 7 วัน', target_days: 7, reward_points: 80 },
    ]);

    await upsertMany(prisma.communityPost, [
        { id: 'post1', author_name: 'น้องมิน', content: 'วันนี้ทำส้มตำโซเดียมต่ำ อร่อยมากเลย แนะนำเลย!', likes: 12 },
        { id: 'post2', author_name: 'พี่โอ', content: 'ลองทำต้มยำกุ้งสูตรลดเกลือ ยังคงรสชาติอยู่เลย', likes: 8 },
        { id: 'post3', author_name: 'น้องใหม่', content: 'แชร์เมนูข้าวต้มหมูโซเดียมต่ำ ทำง่ายมาก ใช้เวลาแค่ 20 นาที', likes: 15 },
        { id: 'post4', author_name: 'คุณแม่บ้าน', content: 'เทคนิคลดโซเดียม: ใช้สมุนไพรแทนเกลือ เช่น ตะไคร้ ใบมะกรูด', likes: 25 },
    ]);

    await upsertMany(prisma.provinceScore, [
        { id: 'ps1', province: 'ขอนแก่น', region: 'northeast', total_sodium_reduced: 12500, participant_count: 85, week: '2026-W09' },
        { id: 'ps2', province: 'เชียงใหม่', region: 'north', total_sodium_reduced: 10200, participant_count: 62, week: '2026-W09' },
        { id: 'ps3', province: 'กรุงเทพ', region: 'central', total_sodium_reduced: 9800, participant_count: 120, week: '2026-W09' },
        { id: 'ps4', province: 'สงขลา', region: 'south', total_sodium_reduced: 7600, participant_count: 45, week: '2026-W09' },
        { id: 'ps5', province: 'อุดรธานี', region: 'northeast', total_sodium_reduced: 6900, participant_count: 38, week: '2026-W09' },
    ]);

    console.log('Seeding complete!');
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
