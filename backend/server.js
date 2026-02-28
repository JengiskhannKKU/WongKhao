import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { closeNeo4j, hasNeo4jConfig, verifyNeo4j } from './neo4j.js';
import crudRouter from './routes/crud.js';
import behaviorRouter from './routes/behavior.js';
import authRouter from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3001);

const rawOrigins = process.env.CORS_ORIGIN || '';
const allowedOrigins = rawOrigins
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
const allowVercelPreviews = process.env.CORS_ALLOW_VERCEL_PREVIEWS === 'true';
const localhostRegex = /^http:\/\/localhost:\d+$/;
const vercelPreviewRegex = /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/;

const corsOptions = {
    origin(origin, callback) {
        // Allow non-browser clients (curl/postman) that send no Origin.
        if (!origin) {
            return callback(null, true);
        }

        const originAllowed =
            allowedOrigins.includes('*') ||
            allowedOrigins.includes(origin) ||
            (!allowedOrigins.length && localhostRegex.test(origin)) ||
            (allowVercelPreviews && vercelPreviewRegex.test(origin));

        if (originAllowed) {
            return callback(null, true);
        }

        return callback(new Error(`CORS blocked origin: ${origin}`));
    },
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/behavior', behaviorRouter);
app.use('/api/auth', authRouter);
app.use('/api', crudRouter);

app.get('/health', async (_req, res) => {
    let neo4jReady = false;

    if (hasNeo4jConfig()) {
        try {
            await verifyNeo4j();
            neo4jReady = true;
        } catch {
            neo4jReady = false;
        }
    }

    res.json({
        status: 'ok',
        neo4jConfigured: hasNeo4jConfig(),
        neo4jReady,
    });
});

const server = app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});

async function shutdown() {
    server.close(async () => {
        await closeNeo4j();
        process.exit(0);
    });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
